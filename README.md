# rfstairlifts: funnel prototype (draft v1)

A static, build-free prototype of the Project Codex funnel, ready for GitHub Pages. Two entry pages feed one six-question quiz. Every answer is scored against the draft lead spec and routed. Leads are stored in the visitor's own browser, so nothing is sent anywhere until you choose to wire it up.

## Put it on GitHub Pages

1. Create a new GitHub repository (private is fine on paid plans; Pages on free plans needs a public repo).
2. Upload everything in this folder to the repo root, keeping `.nojekyll`. Or from a terminal:
   ```
   git init && git add . && git commit -m "Funnel prototype v1"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. In the repo, go to **Settings > Pages**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, then save.
4. After a minute the site is at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

All links are relative, so it works at that sub-path and on a custom domain later. To preview locally, run `python3 -m http.server` in this folder and open `http://localhost:8000`.

## What is in it

| Path | What it is |
| --- | --- |
| `/` | Prototype index: links to every page |
| `/stairlifts/` | Google landing page. First quiz question sits in the hero, tiles pass the chosen shape to the quiz |
| `/stairlifts/refused/` | Meta landing page: shorter, situation-led, no health assumptions |
| `/stairlifts/check/` | The six-question quiz |
| `/stairlifts/thank-you/` | Thank-you page. The message changes with where the lead was routed. `generate_lead` event fires here |
| `/demo/leads/` | Buyer view: counts by stream, sample leads, CSV export |
| `/demo/lead/?id=...` | One lead as the buyer sees it, with accept and reject |
| `assets/js/config.js` | **Everything you will want to change** (brand, buyer, coverage, consent wording, endpoint) |
| `assets/js/core.js` | Validation, scoring and routing, attribution capture, lead storage |

The site follows the one-authority-site decision: each future product gets its own folder next to `/stairlifts/`.

## What works for real

- Six-question quiz with keyboard and screen-reader friendly radios, Back button support, and answers kept if someone goes back.
- UK phone check (mobile and landline, accepts +44), UK postcode check, optional email check.
- Spam trap (hidden field; a filled one looks like success but stores nothing).
- Duplicate blocking by phone number (this browser only; a real version needs a server).
- Click-ID and UTM capture (`gclid`, `gbraid`, `wbraid`, `fbclid`, `utm_*`) carried from the landing page into each lead.
- Tiering from the codex: four tests (stairs, area, timing, evidence), Tier A = 4, B = 3, C = fewer, Standard kept separate. Routing: premium (A/B in area), Tier C stream, Standard stream, waiting list (out of area).
- Consent logging: each lead stores the consent wording, version and time.
- Optional photo, shrunk on the device to a small JPEG.
- The SMS code screen from the canvas is gone, as decided.

## What is placeholder

Anything in yellow brackets: phone number, hours, installer name and credentials, survey terms, install photos, company and ICO details, privacy and cookie pages, funding guide link. Coverage is set to the Central Belt (`G, ML, PA, KA, FK, EH, KY`) purely as a test region: replace it with the friend's real coverage in `config.js`.

## Try it

1. Open `/stairlifts/`, pick a shape, finish the quiz.
2. Read the thank-you page, then follow the prototype panel to the buyer's lead sheet.
3. Try a postcode outside coverage (for example M1 1AE) to see the waiting-list outcome, and "No difficulty, first enquiry" to see Standard.
4. Open `/demo/leads/` and press **Add sample leads** to see every tier at once.
5. Test attribution: add `?gclid=test&utm_term=refused%20stairlift` to the Google page URL, then complete the quiz.

## Sending leads somewhere

Set `endpoint` in `config.js` to an HTTPS URL that accepts a JSON POST (Formspree, a Google Apps Script, a Supabase edge function). The lead is sent without the photo. Note that anything put on a public GitHub Pages site, including the endpoint address, is visible to visitors, so protect it with server-side rate limits and validation.

## Before this is anything but a prototype

- [ ] Remove the prototype banner (`prototypeBanner: false`), `noindex` meta tags and `robots.txt` when you are ready to be found.
- [ ] Replace local storage with a real lead store, and move duplicate blocking and tiering server-side so they cannot be bypassed.
- [ ] Privacy notice, cookie consent (gate Google Ads and Meta tags on it) and ICO registration. Have the consent wording and buyer terms reviewed by a solicitor or data protection adviser.
- [ ] Confirm the retention period for leads outside any buyer's area (the thank-you page says "limited time").
- [ ] Real trust content: credentials, install photos, response times. Delete any claim you cannot back up.
- [ ] Clear the brand name, then change `brand` in `config.js` and the page titles.
- [ ] Wire conversion tracking to the `generate_lead` event on the thank-you page, and send the buyer's sales outcomes back so ads optimise towards real customers.

## Licences

Atkinson Hyperlegible is self-hosted from the Fontsource package under the SIL Open Font Licence (see `assets/fonts/LICENSE.txt`), so visitors' browsers make no request to Google Fonts.

Not legal or tax advice.
