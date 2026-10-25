/* Everything you are likely to change lives here. No build step needed. */
window.RF_CONFIG = {
  /* Working name from the Project Codex. Change here and every [data-brand] updates. */
  brand: "rfstairlifts",

  /* Shows a thin banner on every page saying nothing leaves the device. Set false for a real launch. */
  prototypeBanner: true,

  /* Click-to-call number. Leave href empty until a real tracked number exists. */
  phone: { display: "[PHONE NUMBER]", href: "", hours: "[HOURS]" },

  /* The buyer (friend's company to start with). All placeholders until agreed in writing. */
  buyer: {
    name: "[Installer name]",
    callerNumber: "[NUMBER]",
    callbackWithin: "[TIME]",
    /* Postcode areas (the letters at the start of a postcode) this buyer covers.
       PLACEHOLDER: Central Belt of Scotland as a test region. Replace with the real coverage. */
    coveredAreas: ["G", "ML", "PA", "KA", "FK", "EH", "KY"]
  },

  /* Lead delivery: each lead is emailed using FormSubmit (formsubmit.co), a free form-to-email
     service, so no server is needed. The very first submission triggers an activation email to
     emailTo: click the link in it once. After that FormSubmit gives you a random alias; paste the
     alias into emailTo instead of the address, so your email address is not in the public page.
     Set emailTo to "" to switch delivery off (leads then stay in this browser only). */
  delivery: {
    emailTo: "robertandnadiafarmer@gmail.com",
    service: "https://formsubmit.co/ajax/",
    sendFromLocalhost: false,   /* stops local testing from emailing you */
    timeoutMs: 8000
  },

  /* Duplicate blocking by phone number. Local only in this prototype; needs a server later. */
  blockDuplicates: true,

  /* Consent wording. Version it: every lead stores the version and text it was given.
     Needs solicitor / data protection review before launch. */
  consentVersion: "v1-draft",
  consentText:
    "I agree that {brand} may pass my answers and contact details to one installer of stairlifts and home mobility products who covers my area. They may call or text me about my enquiry. If no installer covers my area yet, {brand} may keep my details for a limited time and contact me if one does.",

  storagePrefix: "rf_"
};
