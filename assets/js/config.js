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

  /* Lead delivery. Empty = leads stay in this browser only (localStorage).
     To send leads somewhere, put an HTTPS endpoint here (Formspree, a Google Apps Script,
     a Supabase edge function...). The lead JSON is POSTed WITHOUT the photo. */
  endpoint: "",

  /* Duplicate blocking by phone number. Local only in this prototype; needs a server later. */
  blockDuplicates: true,

  /* Consent wording. Version it: every lead stores the version and text it was given.
     Needs solicitor / data protection review before launch. */
  consentVersion: "v1-draft",
  consentText:
    "I agree that {brand} may pass my answers and contact details to one installer of stairlifts and home mobility products who covers my area. They may call or text me about my enquiry. If no installer covers my area yet, {brand} may keep my details for a limited time and contact me if one does.",

  storagePrefix: "rf_"
};
