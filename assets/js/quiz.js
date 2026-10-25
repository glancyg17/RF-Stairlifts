/* Quiz controller. Six steps, hash-based so the browser Back button works. */
(function () {
  var C = window.RF_CONFIG;
  var TOTAL = 6;
  var form = document.getElementById("quiz");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".q-step"));
  var nextBtn = document.getElementById("next");
  var backBtn = document.getElementById("back");
  var stepLabel = document.getElementById("stepLabel");
  var fill = document.getElementById("fill");
  var bar = document.getElementById("bar");
  var reasonField = document.getElementById("reasonField");
  var photoInput = document.getElementById("photo");
  var preview = document.getElementById("preview");
  var previewImg = document.getElementById("previewImg");
  var uploadBtn = document.getElementById("uploadBtn");
  var uploadText = document.getElementById("uploadText");
  var formError = document.getElementById("formError");

  var photoThumb = "";
  var maxStep = 0;
  var current = 1;
  var submitting = false;

  /* Consent wording from config, with a placeholder link to the privacy policy */
  (function () {
    var label = document.getElementById("consentText");
    label.textContent = C.consentText.replace(/\{brand\}/g, C.brand) + " See our ";
    var ph = document.createElement("span");
    ph.className = "ph";
    ph.textContent = "[privacy policy]";
    label.appendChild(ph);
    label.appendChild(document.createTextNode("."));
  })();

  /* ---------- State ---------- */
  function checked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function val(id) { return (document.getElementById(id).value || "").trim(); }

  function readForm() {
    return {
      shape: checked("shape"), difficulty: checked("difficulty"), refused: checked("refused"),
      refusedReason: val("refusedReason"), who: checked("who"), when: checked("when"),
      postcode: val("postcode"), firstName: val("firstName"), phone: val("phone"),
      email: val("email"), slot: checked("slot"), website: val("website")
    };
  }

  function save() {
    var d = readForm();
    delete d.website;
    d.photoThumb = photoThumb;
    d.maxStep = maxStep;
    RF.session.set("quiz", d);
  }

  function setRadio(name, value) {
    if (!value) return;
    var el = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }

  function restore() {
    var d = RF.session.get("quiz", null);
    if (d) {
      ["shape", "difficulty", "refused", "who", "when", "slot"].forEach(function (k) { setRadio(k, d[k]); });
      ["refusedReason", "postcode", "firstName", "phone", "email"].forEach(function (k) {
        if (d[k]) document.getElementById(k).value = d[k];
      });
      maxStep = d.maxStep || 0;
      if (d.photoThumb) { photoThumb = d.photoThumb; showPreview(); }
    }
    /* Landing-page tile can preselect the stair shape: ?shape=winders */
    var qs = new URLSearchParams(window.location.search);
    var shape = qs.get("shape");
    if (shape && RF.LABELS.shape[shape]) {
      setRadio("shape", shape);
      maxStep = Math.max(maxStep, 1);
    }
    syncReason();
  }

  /* ---------- Errors ---------- */
  function setErr(id, msg, inputId) {
    var el = form.querySelector('[data-err="' + id + '"]');
    if (el) el.textContent = msg || "";
    if (inputId) {
      var input = document.getElementById(inputId);
      if (input) {
        if (msg) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    }
  }
  function clearErrors() {
    form.querySelectorAll("[data-err]").forEach(function (e) { e.textContent = ""; });
    form.querySelectorAll("[aria-invalid]").forEach(function (e) { e.removeAttribute("aria-invalid"); });
    formError.textContent = "";
  }

  /* ---------- Validation per step ---------- */
  function validate(n) {
    clearErrors();
    var d = readForm();
    if (n === 1 && !d.shape) { setErr("1", "Pick the closest shape to continue."); return false; }
    if (n === 2 && !d.difficulty) { setErr("2", "Pick the main difficulty to continue."); return false; }
    if (n === 3 && !d.refused) { setErr("3", "Pick one to continue."); return false; }
    if (n === 4) {
      if (!d.who || !d.when) { setErr("4", "Answer both questions to continue."); return false; }
    }
    if (n === 5) {
      var pc = RF.validatePostcode(d.postcode);
      if (!pc.ok) { setErr("postcode", "Enter a full UK postcode, for example G12 8QQ.", "postcode"); document.getElementById("postcode").focus(); return false; }
    }
    if (n === 6) {
      var bad = false;
      if (!d.firstName) { setErr("firstName", "Enter your first name.", "firstName"); bad = true; }
      var ph = RF.validatePhone(d.phone);
      if (!ph.ok) { setErr("phone", "Enter a UK phone number, for example 07700 900123 or 0141 496 0123.", "phone"); bad = true; }
      if (!RF.validateEmail(d.email)) { setErr("email", "That email doesn't look right. Check it or leave it blank.", "email"); bad = true; }
      if (!document.getElementById("consent").checked) { setErr("consent", "Tick the box to agree, or we can't pass your details on."); bad = true; }
      if (bad) {
        var first = form.querySelector("[aria-invalid='true']") || document.getElementById("consent");
        if (first && first.focus) first.focus();
        return false;
      }
    }
    return true;
  }

  /* ---------- Navigation ---------- */
  function show(n, moveFocus) {
    current = n;
    steps.forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== n; });
    stepLabel.textContent = "Question " + n + " of " + TOTAL;
    var pct = Math.round((n / (TOTAL + 1)) * 100);
    fill.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", pct);
    backBtn.hidden = n === 1;
    nextBtn.textContent = n === TOTAL ? "Send my details" : "Continue";
    document.title = "Question " + n + " of " + TOTAL + " | Check your stairs";
    window.scrollTo(0, 0);
    if (moveFocus) {
      var h = steps[n - 1].querySelector("h1");
      if (h) h.focus({ preventScroll: true });
    }
  }

  function stepFromHash() {
    var m = /^#q([1-6])$/.exec(window.location.hash);
    var n = m ? Number(m[1]) : null;
    if (!n) n = Math.min(maxStep + 1, TOTAL);
    return Math.min(n, maxStep + 1, TOTAL) || 1;
  }

  function go(n) {
    if (window.location.hash === "#q" + n) show(n, true);
    else window.location.hash = "#q" + n;
  }

  window.addEventListener("hashchange", function () { clearErrors(); show(stepFromHash(), true); });

  nextBtn.addEventListener("click", function () {
    if (submitting) return;
    if (!validate(current)) return;
    maxStep = Math.max(maxStep, current);
    save();
    if (current === TOTAL) submit();
    else go(current + 1);
  });
  backBtn.addEventListener("click", function () { if (current > 1) go(current - 1); });

  /* Enter in a text field moves on instead of submitting the form */
  form.addEventListener("submit", function (e) { e.preventDefault(); nextBtn.click(); });

  /* ---------- Conditional reason box ---------- */
  function syncReason() {
    var r = checked("refused");
    reasonField.hidden = !(r === "yes" || r === "maybe");
  }
  form.addEventListener("change", function (e) {
    if (e.target.name === "refused") syncReason();
    clearErrors();
    save();
  });
  form.addEventListener("input", function () { save(); });

  /* ---------- Photo: shrink on the device, keep only a small JPEG ---------- */
  function showPreview() {
    previewImg.src = photoThumb;
    preview.hidden = false;
    uploadText.textContent = "Choose a different photo";
  }
  function clearPhoto() {
    photoThumb = "";
    photoInput.value = "";
    preview.hidden = true;
    previewImg.removeAttribute("src");
    uploadText.textContent = "Add a photo";
    save();
  }
  document.getElementById("photoRemove").addEventListener("click", function () { clearPhoto(); uploadBtn.querySelector("input").focus(); });

  photoInput.addEventListener("change", function () {
    setErr("photo", "");
    var f = photoInput.files && photoInput.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErr("photo", "That file isn't a photo. Choose a JPG or PNG, or skip this."); photoInput.value = ""; return; }
    var url = URL.createObjectURL(f);
    var img = new Image();
    img.onload = function () {
      var max = 640, w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, max / Math.max(w, h));
      var cv = document.createElement("canvas");
      cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      try { photoThumb = cv.toDataURL("image/jpeg", 0.7); } catch (e) { photoThumb = ""; }
      URL.revokeObjectURL(url);
      if (photoThumb) { showPreview(); save(); }
      else setErr("photo", "We couldn't read that photo. Try another, or skip this.");
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      setErr("photo", "We couldn't read that photo. Try another, or skip this.");
    };
    img.src = url;
  });

  /* ---------- Submit ---------- */
  function submit() {
    var d = readForm();
    var thanks = "../thank-you/";

    /* Spam trap tripped: look like success, store nothing */
    if (d.website) { window.location.href = thanks; return; }

    var ph = RF.validatePhone(d.phone);
    if (C.blockDuplicates && RF.leads.hasPhone(ph.normalised)) {
      formError.textContent = "We already have an enquiry from this number, so there's no need to send it again. The installer will be in touch.";
      return;
    }

    submitting = true;
    nextBtn.disabled = true;
    nextBtn.textContent = "Sending";

    var attr = RF.captureAttribution();
    var answers = {
      shape: d.shape, difficulty: d.difficulty, refused: d.refused, refusedReason: d.refusedReason,
      who: d.who, when: d.when, postcode: d.postcode, slot: d.slot === "any" ? "" : d.slot
    };
    var lead = RF.buildLead(answers, { firstName: d.firstName, phone: d.phone, email: d.email }, photoThumb, attr, false);

    /* Keep a local copy. If the browser refuses (private mode), carry on: the email is what matters. */
    var saved = RF.leads.add(lead);

    try { sessionStorage.removeItem(C.storagePrefix + "quiz"); } catch (e) {}
    var target = thanks + "?id=" + encodeURIComponent(lead.id);
    var go = function () { window.location.href = target; };

    /* The lead is already safe in this browser. Wait for the email attempt (it times out by
       itself), record the outcome on the lead, then show the thank-you page either way. */
    RF.deliver(lead).then(function (res) {
      if (saved) RF.leads.update(lead.id, { delivery: res });
      go();
    }, go);
  }

  /* ---------- Boot ---------- */
  restore();
  show(stepFromHash(), false);
  if (!/^#q[1-6]$/.test(window.location.hash)) {
    history.replaceState(null, "", window.location.pathname + window.location.search + "#q" + current);
  }
})();
