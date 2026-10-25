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
    name: "Senior Stairlifts",
    callerNumber: "[NUMBER]",
    callbackWithin: "[TIME]",
    /* Postcode areas (the letters at the start of a postcode) this buyer covers.
       PLACEHOLDER: Central Belt of Scotland as a test region. Replace with the real coverage. */
    coveredAreas: ["G", "ML", "PA", "KA", "FK", "EH", "KY"]
  },

  /* The installer the leads go to, and the public facts used as accreditation.
     Every value here was read from a public page on 25 October 2026 and is stated as the
     INSTALLER'S credential, never ours. Re-check the rating and review count before launch:
     they move, and an out-of-date figure in an ad or page is a problem. */
  installer: {
    name: "Senior Stairlifts",
    legalName: "Senior Stairlifts Ltd",
    companyNumber: "11872519",     /* Companies House: registered in England and Wales, March 2019 */
    town: "Leeds",
    website: "https://seniorstairlifts.co.uk/",
    which: {                        /* trustedtraders.which.co.uk listing, "Endorsed by Which?" */
      url: "https://trustedtraders.which.co.uk/businesses/senior-stairlifts-ltd/",
      rating: "4.9",
      reviews: "144",
      checkedOn: "25 October 2026"
    },
    /* Found on the installer's own pages but NOT independently confirmed, so NOT used on the site yet.
       Ask them for proof or permission before using any of these:
       - "Which? Trusted Trader Project of the Year Award 2025" (no Which? source found)
       - "all engineers are DBS-checked" and the Trustmark / Trading Standards badge
       - "rated 5 stars from 1,000+ reviews" (Which? shows 144; Trustpilot is a separate count)
       - Handicare Gold Dealer status (trade press, undated)
       - the warranty: free 2 years, extendable to 5 (extension cost not published)
       - coverage: site says England, Scotland and Wales (a 2024 listing excludes NI, Highlands and Islands) */
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
  /* {brand} and {buyer} are filled in automatically. {buyer} is the installer's legal name. */
  consentVersion: "v3-draft",
  consentText:
    "I agree that {brand} may pass my answers and contact details to {buyer}, an installer of stairlifts and home mobility products. My answers may include health or mobility details, and I agree to that. They may call or text me about my enquiry. If no installer covers my area yet, {brand} may keep my details for a limited time and contact me if one does.",

  storagePrefix: "rf_"
};
