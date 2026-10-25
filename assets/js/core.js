/* Shared logic. Classic script (no modules) so pages also work when opened from disk. */
(function () {
  var C = window.RF_CONFIG;
  var RF = (window.RF = {});

  /* ---------- Safe storage ---------- */
  function key(k) { return C.storagePrefix + k; }
  RF.store = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(key(k)); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(key(k), JSON.stringify(v)); return true; }
      catch (e) { return false; }
    },
    remove: function (k) { try { localStorage.removeItem(key(k)); } catch (e) {} }
  };
  RF.session = {
    get: function (k, fallback) {
      try { var v = sessionStorage.getItem(key(k)); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (k, v) { try { sessionStorage.setItem(key(k), JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Labels ---------- */
  RF.LABELS = {
    shape: {
      straight: "Straight, no turns",
      oneTurn: "One turn with a landing",
      winders: "Steps that fan round a corner",
      spiral: "Spiral or tightly curving",
      unsure: "Not sure, or something different"
    },
    difficulty: {
      narrow: "The stairs are narrow",
      steep: "The stairs are steep",
      winders: "Winding or fan-shaped steps",
      short: "They stop short at the top or bottom",
      door: "A door opens onto the stairs",
      weight: "Weight or size of the person",
      none: "No difficulty, a regular stairlift",
      other: "Something else"
    },
    refused: {
      yes: "Yes, a company has said no",
      maybe: "One said it might not work",
      no: "No, this is my first enquiry"
    },
    who: { me: "Me", parent: "A parent", other: "Someone else" },
    when: { month: "Within a month", three: "Within 3 months", explore: "Just exploring" },
    slot: { am: "Morning", pm: "Afternoon", eve: "Evening" },
    stream: {
      premium: "Premium (Tier A/B, in area)",
      tierC: "Tier C stream",
      standard: "Standard stream",
      waiting: "Waiting list (out of area)"
    }
  };

  /* ---------- Attribution: click IDs, UTMs, landing variant ---------- */
  var ATTR_KEYS = ["gclid", "gbraid", "wbraid", "fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  RF.captureAttribution = function () {
    var attr = RF.session.get("attr", {});
    var params = new URLSearchParams(window.location.search);
    ATTR_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) attr[k] = v.slice(0, 200);
    });
    var variant = document.body.getAttribute("data-variant");
    if (variant && !attr.landing_variant) {
      attr.landing_variant = variant;
      attr.landing_path = window.location.pathname;
      attr.landing_at = new Date().toISOString();
      attr.referrer = (document.referrer || "").slice(0, 300);
    }
    RF.session.set("attr", attr);
    return attr;
  };

  /* ---------- Validation ---------- */
  /* UK phone: accepts +44 / 0044 / 0 prefixes, spaces and dashes. Geographic (01/02/03) and mobile (07). */
  RF.validatePhone = function (raw) {
    var s = String(raw || "").replace(/[\s\-().]/g, "");
    if (/^(\+44|0044)/.test(s)) s = "0" + s.replace(/^(\+44|0044)/, "").replace(/^0/, "");
    var ok = /^0(7\d{9}|[123]\d{8,9})$/.test(s) && !/^070|^076/.test(s);
    return { ok: ok, normalised: ok ? s : "" };
  };

  /* UK postcode (standard pattern, GIR 0AA excluded for simplicity). */
  RF.validatePostcode = function (raw) {
    var s = String(raw || "").toUpperCase().replace(/\s+/g, "");
    var ok = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(s);
    if (!ok) return { ok: false, normalised: "", area: "" };
    var norm = s.slice(0, -3) + " " + s.slice(-3);
    return { ok: true, normalised: norm, area: s.match(/^[A-Z]{1,2}/)[0] };
  };

  RF.validateEmail = function (raw) {
    var s = String(raw || "").trim();
    return s === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  };

  RF.inCoverage = function (area) {
    return C.buyer.coveredAreas.indexOf(area) !== -1;
  };

  /* ---------- Scoring and routing (draft spec from the Project Codex) ----------
     Four tests: stairs, area, timing, evidence of intent.
     Tier A = all four, Tier B = three, Tier C = fewer.
     Standard = regular stairlift, no difficulty, never refused: a separate stream, never premium.
     Streams: premium (A/B in area), standard, tierC, waiting (out of area). */
  RF.score = function (a, hasPhoto, area) {
    var complex = a.difficulty && a.difficulty !== "none";
    var refused = a.refused === "yes" || a.refused === "maybe";
    var reason = !!(a.refusedReason && a.refusedReason.trim().length >= 3);
    var isStandard = a.difficulty === "none" && a.refused === "no";

    var tests = {
      stairs: refused || complex,
      area: RF.inCoverage(area),
      timing: a.when === "month" || a.when === "three",
      evidence: hasPhoto || reason
    };
    var passed = Object.keys(tests).filter(function (k) { return tests[k]; }).length;
    var tier = isStandard ? "Standard" : passed === 4 ? "A" : passed === 3 ? "B" : "C";

    var stream;
    if (!tests.area) stream = "waiting";
    else if (isStandard) stream = "standard";
    else if (tier === "A" || tier === "B") stream = "premium";
    else stream = "tierC";

    return { tests: tests, passed: passed, tier: tier, stream: stream, isStandard: isStandard };
  };

  /* ---------- Leads store ---------- */
  RF.leads = {
    list: function () { return RF.store.get("leads", []); },
    get: function (id) { return RF.leads.list().filter(function (l) { return l.id === id; })[0] || null; },
    add: function (lead) {
      var all = RF.leads.list();
      all.unshift(lead);
      return RF.store.set("leads", all);
    },
    update: function (id, patch) {
      var all = RF.leads.list().map(function (l) { return l.id === id ? Object.assign({}, l, patch) : l; });
      RF.store.set("leads", all);
    },
    clear: function () { RF.store.remove("leads"); },
    hasPhone: function (normalised) {
      return RF.leads.list().some(function (l) { return l.contact && l.contact.phoneNormalised === normalised; });
    },
    newId: function () {
      return "L" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    }
  };

  /* Build a complete lead object from quiz answers. */
  RF.buildLead = function (a, contact, photoThumb, attr, honeypotTripped) {
    var pc = RF.validatePostcode(a.postcode);
    var ph = RF.validatePhone(contact.phone);
    var score = RF.score(a, !!photoThumb, pc.area);
    return {
      id: RF.leads.newId(),
      createdAt: new Date().toISOString(),
      product: "stairlift",
      variant: (attr && attr.landing_variant) || "direct",
      attribution: attr || {},
      answers: {
        shape: a.shape, difficulty: a.difficulty, refused: a.refused,
        refusedReason: (a.refusedReason || "").trim(), who: a.who, when: a.when,
        postcode: pc.normalised, postcodeArea: pc.area, slot: a.slot || ""
      },
      photo: { attached: !!photoThumb, thumb: photoThumb || "" },
      contact: {
        firstName: contact.firstName.trim(), phone: contact.phone.trim(),
        phoneNormalised: ph.normalised, email: (contact.email || "").trim()
      },
      consent: {
        given: true, at: new Date().toISOString(), version: C.consentVersion,
        text: C.consentText.replace(/\{brand\}/g, C.brand)
      },
      scoring: score,
      flags: { spamTrap: !!honeypotTripped },
      status: "new",
      rejectReason: ""
    };
  };

  /* Optional delivery to an endpoint. Never sends the photo. Never blocks the user. */
  RF.deliver = function (lead) {
    if (!C.endpoint) return Promise.resolve(false);
    var copy = JSON.parse(JSON.stringify(lead));
    copy.photo = { attached: lead.photo.attached };
    return fetch(C.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copy),
      keepalive: true
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  };

  /* ---------- Sample leads, so the buyer view has something to show ---------- */
  RF.sampleLeads = function () {
    var now = Date.now();
    var base = [
      { shape: "winders", difficulty: "winders", refused: "yes", refusedReason: "Said the winders were too tight for their rail", who: "parent", when: "three", postcode: "G12 8QQ", slot: "pm", photo: true, name: "Margaret", phone: "07700 900111", utm_term: "stairlift for winding stairs", variant: "google" },
      { shape: "spiral", difficulty: "narrow", refused: "yes", refusedReason: "", who: "me", when: "month", postcode: "EH10 4AB", slot: "am", photo: false, name: "Alan", phone: "07700 900222", utm_term: "refused stairlift", variant: "google" },
      { shape: "oneTurn", difficulty: "short", refused: "maybe", refusedReason: "Landing is short at the top", who: "parent", when: "explore", postcode: "PA3 2BE", slot: "", photo: false, name: "Priya", phone: "07700 900333", utm_term: "", variant: "meta" },
      { shape: "straight", difficulty: "none", refused: "no", refusedReason: "", who: "me", when: "month", postcode: "G41 3JX", slot: "eve", photo: false, name: "Hamish", phone: "07700 900444", utm_term: "stairlift", variant: "google" },
      { shape: "winders", difficulty: "winders", refused: "yes", refusedReason: "Three firms said no", who: "other", when: "three", postcode: "M20 2RT", slot: "am", photo: true, name: "Joan", phone: "07700 900555", utm_term: "four companies said no stairlift", variant: "meta" },
      { shape: "unsure", difficulty: "door", refused: "no", refusedReason: "", who: "parent", when: "three", postcode: "FK8 1AA", slot: "pm", photo: true, name: "Euan", phone: "07700 900666", utm_term: "", variant: "meta" }
    ];
    var tinyPhoto = "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#e9eff0"/><path d="M20 100h30V80h30V60h30V40h30" fill="none" stroke="#1f6f78" stroke-width="4"/><text x="80" y="112" text-anchor="middle" font-size="10" fill="#4a6168" font-family="sans-serif">sample photo</text></svg>'
    );
    var out = base.map(function (b, i) {
      var attr = { landing_variant: b.variant };
      if (b.utm_term) attr.utm_term = b.utm_term;
      if (b.variant === "google") attr.gclid = "SAMPLE_GCLID_" + i;
      if (b.variant === "meta") attr.fbclid = "SAMPLE_FBCLID_" + i;
      var lead = RF.buildLead(
        { shape: b.shape, difficulty: b.difficulty, refused: b.refused, refusedReason: b.refusedReason, who: b.who, when: b.when, postcode: b.postcode, slot: b.slot },
        { firstName: b.name, phone: b.phone, email: "" },
        b.photo ? tinyPhoto : "",
        attr, false
      );
      lead.id = "SAMPLE" + (i + 1);
      lead.createdAt = new Date(now - (i + 1) * 3600 * 1000 * 5).toISOString();
      lead.sample = true;
      return lead;
    });
    return out;
  };

  /* ---------- Formatting ---------- */
  RF.fmtDate = function (iso) {
    try {
      return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return iso; }
  };
  RF.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- Page chrome: brand, phone, banner, footer year ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-brand]").forEach(function (el) { el.textContent = C.brand; });

    document.querySelectorAll("[data-phone]").forEach(function (el) {
      el.textContent = C.phone.display;
      if (C.phone.href) { el.setAttribute("href", "tel:" + C.phone.href); }
      else { el.removeAttribute("href"); el.classList.add("ph"); }
    });
    document.querySelectorAll("[data-hours]").forEach(function (el) { el.textContent = C.phone.hours; });
    document.querySelectorAll("[data-buyer]").forEach(function (el) { el.textContent = C.buyer.name; });
    document.querySelectorAll("[data-buyer-number]").forEach(function (el) { el.textContent = C.buyer.callerNumber; });
    document.querySelectorAll("[data-buyer-time]").forEach(function (el) { el.textContent = C.buyer.callbackWithin; });

    if (C.prototypeBanner) {
      var root = document.body.getAttribute("data-root") || "./";
      var b = document.createElement("div");
      b.className = "proto-banner";
      b.setAttribute("role", "note");
      b.innerHTML = "Prototype. Nothing you enter leaves this device. <a href=\"" + root + "\">All pages</a>";
      document.body.insertBefore(b, document.body.firstChild);
    }

    RF.captureAttribution();
  });
})();
