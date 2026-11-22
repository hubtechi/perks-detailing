
/* ================= PERKS WEBSITE SETTINGS ================= */

const PERKS_CONFIG = {
    companyEmail: "YOUR_COMPANY_EMAIL@example.com",
    whatsappNumber: "+971586778562",

    emailJsPublicKey: "YOUR_EMAILJS_PUBLIC_KEY",
    emailJsServiceId: "YOUR_EMAILJS_SERVICE_ID",
    bookingTemplateId: "YOUR_BOOKING_TEMPLATE_ID",
    quotationTemplateId: "YOUR_QUOTATION_TEMPLATE_ID"
};

/* ================= GENERAL FUNCTIONS ================= */

function navToggle() {
    document.querySelector(".navlinks")?.classList.toggle("open");
}

function money(n) {
    return new Intl.NumberFormat("en-US").format(n);
}

function whatsappLink(message) {
    const number = PERKS_CONFIG.whatsappNumber.replace(/\D/g, "");
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
    const number = PERKS_CONFIG.whatsappNumber;

    if (!number || number.includes("X")) {
        alert("Please add the PERKS WhatsApp number in script.js.");
        return;
    }

    window.open(whatsappLink(message), "_blank", "noopener");
}

/* ================= HOMEPAGE SLIDESHOW ================= */

function initSlides() {
    const slides = [...document.querySelectorAll(".hero-slide")];
    const dots = [...document.querySelectorAll(".dot")];

    if (!slides.length) return;

    let i = 0;

    function show(n) {
        slides.forEach((s, k) =>
            s.classList.toggle("active", k === n)
        );

        dots.forEach((d, k) =>
            d.classList.toggle("active", k === n)
        );

        i = n;
    }

    dots.forEach((d, k) =>
        d.addEventListener("click", () => show(k))
    );

    setInterval(() => {
        show((i + 1) % slides.length);
    }, 4500);
}

/* ================= BOOKING FORM ================= */

function initBooking() {
    const form = document.querySelector("#bookingForm");

    if (!form) return;

    const whatsappBtn =
        document.querySelector("#bookingWhatsApp") ||
        document.querySelector("#sendBookingWhatsApp");

    if (!whatsappBtn) return;

    whatsappBtn.addEventListener("click", function(e) {
        e.preventDefault();

        if (!form.reportValidity()) return;

        const d = Object.fromEntries(
            new FormData(form).entries()
        );

        const ref = "PK-" + Date.now().toString().slice(-8);

        const message =
`*PERKS CAR WASH & DETAILING*
*NEW APPOINTMENT BOOKING REQUEST*

Reference: ${ref}

*Customer Details*
Name: ${d.name}
Phone: ${d.phone}
Email: ${d.email}
Vehicle: ${d.vehicle}

*Appointment Details*
Service: ${d.service}
Preferred Date: ${d.date}
Preferred Time: ${d.time}

Additional Details: ${d.message || "N/A"}

Thank you for choosing PERKS!
Drive Clean. Drive Fresh. Drive PERKS.`;

        openWhatsApp(message);
    });
}

/* ================= QUOTATION FORM ================= */

function initQuotation() {
    const form = document.querySelector("#quoteForm");

    if (!form) return;

    const totalEl = document.querySelector("#quoteTotal");
    const selectedEl = document.querySelector("#selectedServices");

    const emailServices = document.querySelector("#emailServices");
    const emailTotal = document.querySelector("#emailTotal");

    function selected() {
        return [...form.querySelectorAll(
            'input[name="service"]:checked'
        )].map(x => ({
            name: x.dataset.name,
            price: Number(x.value)
        }));
    }

    function update() {
        const items = selected();

        const total = items.reduce(
            (sum, item) => sum + item.price, 0
        );

        totalEl.textContent = "AED " + money(total);

        selectedEl.innerHTML = items.length
            ? items.map(item => `
                <div class="price-item">
                    <span>${item.name}</span>
                    <b class="price">AED ${money(item.price)}</b>
                </div>
            `).join("")
            : "<p class='hint'>No services selected yet.</p>";

        emailServices.value = items.map(item =>
            `${item.name} - AED ${money(item.price)}`
        ).join("\n");

        emailTotal.value = "AED " + money(total);
    }

    /* Update quotation when services are selected */

    form.querySelectorAll('input[name="service"]').forEach(input => {
        input.addEventListener("change", update);
    });

    update();

    /* Print / Save PDF */

    document.querySelector("#printQuote")?.addEventListener("click", () => {
        window.print();
    });

    /* Send quotation through email */

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        update();

        const items = selected();

        if (!items.length) {
            alert("Please select at least one service.");
            return;
        }

        if (!form.reportValidity()) return;

        HTMLFormElement.prototype.submit.call(form);
    });

    /* Send quotation through WhatsApp */

    document.querySelector("#quoteWhatsApp")?.addEventListener("click", function(e) {
        e.preventDefault();

        if (!form.reportValidity()) return;

        const d = Object.fromEntries(
            new FormData(form).entries()
        );

        const items = selected();

        if (!items.length) {
            alert("Please select at least one service.");
            return;
        }

        const total = items.reduce(
            (sum, item) => sum + item.price, 0
        );

        const lines = items.map(item =>
            `${item.name}: AED ${money(item.price)}`
        ).join("\n");

        const message =
`*PERKS CAR WASH & DETAILING*
*NEW QUOTATION REQUEST*

*Customer Details*
Name: ${d.name}
Phone: ${d.phone}
Email: ${d.email || "N/A"}
Vehicle: ${d.vehicle || "N/A"}

*Selected Services*
${lines}

*TOTAL: AED ${money(total)}*

Additional Notes:
${d.notes || "N/A"}

Thank you for choosing PERKS!
Drive Clean. Drive Fresh. Drive PERKS.`;

        openWhatsApp(message);
    });
}

/* ================= INITIALIZE WEBSITE ================= */

document.addEventListener("DOMContentLoaded", () => {
    initSlides();
    initBooking();
    initQuotation();
});

// OPEN ZOHO BOOKING
function openZohoBooking() {
    document.getElementById("zohoBookingModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

// CLOSE ZOHO BOOKING
function closeZohoBooking() {
    document.getElementById("zohoBookingModal").classList.remove("active");
    document.body.style.overflow = "";
}

// CLOSE WHEN CLICKING OUTSIDE
document.getElementById("zohoBookingModal").addEventListener("click", function(event) {
    if (event.target === this) {
        closeZohoBooking();
    }
});

// CLOSE WITH ESCAPE
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeZohoBooking();
    }
});
