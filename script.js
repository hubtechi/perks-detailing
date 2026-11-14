
/* ================= PERKS WEBSITE SETTINGS =================
   1) Add your real company email below.
   2) Add your WhatsApp number in international format, digits only.
   3) For automatic email delivery, create an EmailJS account and
      enter your public key, service ID and template IDs below.
   EmailJS setup: https://www.emailjs.com/
============================================================= */
const PERKS_CONFIG = {
  companyEmail: "YOUR_COMPANY_EMAIL@example.com",
  whatsappNumber: "971XXXXXXXXX", // e.g. 971501234567; no + or spaces
  emailJsPublicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  emailJsServiceId: "YOUR_EMAILJS_SERVICE_ID",
  bookingTemplateId: "YOUR_BOOKING_TEMPLATE_ID",
  quotationTemplateId: "YOUR_QUOTATION_TEMPLATE_ID"
};

function navToggle(){document.querySelector(".navlinks")?.classList.toggle("open")}
function money(n){return new Intl.NumberFormat("en-US").format(n)}
function emailConfigured(){return window.emailjs && !PERKS_CONFIG.emailJsPublicKey.startsWith("YOUR_")}
async function sendPerksEmail(templateId, data){
  if(emailConfigured() && !templateId.startsWith("YOUR_")){
    await emailjs.send(PERKS_CONFIG.emailJsServiceId, templateId, {...data,to_email:PERKS_CONFIG.companyEmail});
    return true;
  }
  return false;
}
function whatsappLink(message){
  const number=PERKS_CONFIG.whatsappNumber.replace(/\D/g,"");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
function openWhatsApp(message){
  if(PERKS_CONFIG.whatsappNumber.includes("X") || !PERKS_CONFIG.whatsappNumber){alert("Please add your PERKS WhatsApp number in script.js first.");return}
  window.open(whatsappLink(message),"_blank","noopener");
}
function initSlides(){
  const slides=[...document.querySelectorAll(".hero-slide")], dots=[...document.querySelectorAll(".dot")];
  if(!slides.length)return;let i=0;
  function show(n){slides.forEach((s,k)=>s.classList.toggle("active",k===n));dots.forEach((d,k)=>d.classList.toggle("active",k===n));i=n}
  dots.forEach((d,k)=>d.addEventListener("click",()=>show(k)));
  setInterval(()=>show((i+1)%slides.length),4500);
}
function initBooking(){
  const form=document.querySelector("#bookingForm");if(!form)return;
  form.addEventListener("submit",async e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(form).entries());
    const ref="PK-"+Date.now().toString().slice(-8);
    const msg=`PERKS APPOINTMENT REQUEST\nReference: ${ref}\nName: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nVehicle: ${d.vehicle}\nService: ${d.service}\nPreferred date: ${d.date}\nPreferred time: ${d.time}\nMessage: ${d.message||"N/A"}`;
    const status=document.querySelector("#bookingStatus");
    try{
      const sent=await sendPerksEmail(PERKS_CONFIG.bookingTemplateId,{...d,reference:ref,request_type:"Appointment booking",message:msg});
      status.style.display="block";
      status.textContent=sent?`Thank you. Your request (${ref}) has been emailed to PERKS.`:`Your request is ready (${ref}). Email delivery is not configured yet. You can send it through WhatsApp below.`;
      const wa=document.querySelector("#bookingWhatsApp");wa.href=whatsappLink(msg);wa.style.display="inline-block";
      form.reset();
    }catch(err){status.style.display="block";status.textContent="Email could not be sent. Please use the WhatsApp option.";const wa=document.querySelector("#bookingWhatsApp");wa.href=whatsappLink(msg);wa.style.display="inline-block"}
  });
}


function initQuotation(){

  const form = document.querySelector("#quoteForm");
  if(!form) return;

  const totalEl = document.querySelector("#quoteTotal");
  const selectedEl = document.querySelector("#selectedServices");

  const emailServices = document.querySelector("#emailServices");
  const emailTotal = document.querySelector("#emailTotal");

  function selected(){

    return [...form.querySelectorAll('input[name="service"]:checked')]
      .map(x => ({
        name: x.dataset.name,
        price: Number(x.value)
      }));

  }

  function update(){

    const items = selected();

    const total = items.reduce((sum, item) =>
      sum + item.price, 0
    );

    // Update quotation display
    totalEl.textContent = "AED " + money(total);

    selectedEl.innerHTML = items.length
      ? items.map(item => `
          <div class="price-item">
            <span>${item.name}</span>
            <b class="price">AED ${money(item.price)}</b>
          </div>
        `).join("")
      : "<p class='hint'>No services selected yet.</p>";

    // IMPORTANT: Populate email fields
    emailServices.value = items.map(item =>
      `${item.name} - AED ${money(item.price)}`
    ).join("\n");

    emailTotal.value = "AED " + money(total);

  }

  // Update when client selects services
  form.querySelectorAll('input[name="service"]').forEach(input => {
    input.addEventListener("change", update);
  });

  update();

  // Print quotation
  document.querySelector("#printQuote").addEventListener("click", () => {
    window.print();
  });

  // FormSubmit email
  form.addEventListener("submit", function(e){

    e.preventDefault();

    update();

    const items = selected();

    if(!items.length){
      alert("Please select at least one service.");
      return;
    }

    if(!form.reportValidity()){
      return;
    }

    // Submit only AFTER hidden fields have been populated
    HTMLFormElement.prototype.submit.call(form);

  });

  // WhatsApp quotation
  document.querySelector("#quoteWhatsApp").addEventListener("click", function(e){

    const d = Object.fromEntries(new FormData(form).entries());
    const items = selected();

    if(!d.name || !d.phone || !items.length){
      e.preventDefault();
      alert("Please enter your name, phone number and select at least one service.");
      return;
    }

    const total = items.reduce((sum, item) =>
      sum + item.price, 0
    );

    const lines = items.map(item =>
      `${item.name}: AED ${money(item.price)}`
    ).join("\n");

    const message =
      `PERKS QUOTATION REQUEST\n` +
      `Customer: ${d.name}\n` +
      `Phone: ${d.phone}\n` +
      `Email: ${d.email || "N/A"}\n` +
      `Vehicle: ${d.vehicle || "N/A"}\n` +
      `Selected Services:\n${lines}\n` +
      `TOTAL: AED ${money(total)}\n` +
      `Notes: ${d.notes || "N/A"}`;

    this.href = whatsappLink(message);

  });

}


document.addEventListener("DOMContentLoaded",()=>{initSlides();initBooking();initQuotation()});
