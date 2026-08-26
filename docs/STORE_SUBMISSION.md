# Getting into the App Store and Play Store

This is where most first-time launches stall. Everything below is either
a hard requirement or a known rejection cause.

---

## Both stores need these first

### 1. A privacy policy on a public URL

Non-negotiable. You collect phone numbers, so you need one.

Free generator: [app-privacy-policy-generator.firebaseapp.com](https://app-privacy-policy-generator.firebaseapp.com)

It must say, honestly:

- you collect **mobile numbers** for account creation and order updates
- you collect **order history** to show past orders and run the coin scheme
- you do **not** collect location (this app genuinely does not — say so)
- data lives on **AWS servers in India**
- how someone deletes their account (give an email address and answer it)

Host it free on GitHub Pages, Notion, or a Google Site.

### 2. Account deletion — already built

Both stores require in-app account deletion for any app with accounts,
and Apple enforces it strictly.

This is **already implemented**: `DELETE /me` on the backend, and a
"Delete my account" row at the bottom of the profile screen. It removes
the profile, coins and order pointers, and anonymises the orders
themselves (the kitchen keeps its sales records, as Indian tax rules
require, but nothing in them points back to a person).

Test it once before you submit, and mention it in your privacy policy.

### 3. FSSAI licence number — already wired

You are selling food in India, so your FSSAI number has to be visible.
There is a **FSSAI licence no.** field in the admin panel under *Store*;
fill it in and it appears on the profile screen. Leave it blank and the
row simply does not render — so **do not leave it blank**. Have the
certificate itself ready too; Play's food-and-drink category sometimes
asks.

---

## Google Play

**Cost:** ₹2,100 once. **Review time:** 1–7 days for a new developer.

### Setup

1. Register at [play.google.com/console](https://play.google.com/console).
2. New developer accounts must complete **identity verification** — this
   alone can take a few days, so start it now, before the app is ready.
3. If you registered as an **organisation**, you need a D-U-N-S number
   (free, ~2 weeks). **Registering as an individual avoids this** and is
   fine for a single kitchen.

### Store listing

| Field | Notes |
|---|---|
| App name | `BiriyaniNation` (30 chars max) |
| Short description | 80 chars — "Dum biriyani from our Patia kitchen. Order ahead, collect hot." |
| Full description | 4,000 chars — mention **pickup only**, plainly |
| Screenshots | 2–8, min 1080px. Home, menu, dish, cart, order code |
| Feature graphic | 1024×500 |
| Icon | 512×512 |
| Category | Food & Drink |
| Content rating | Fill the questionnaire — you will get "Everyone" |

### Data safety form

Answer it truthfully; mismatches with your actual app cause rejection.

| Question | Answer |
|---|---|
| Collects personal info | **Yes** — phone number |
| Why | Account management, app functionality |
| Encrypted in transit | **Yes** |
| Can users request deletion | **Yes** (once you have built it) |
| Collects location | **No** |
| Shares data with third parties | **No** |

### Release path

Do not go straight to production:

```
Internal testing  →  Closed testing  →  Production
   (you)              (20 friends)       (everyone)
```

Google now requires most new personal developer accounts to run a
**closed test with at least 12 testers for 14 continuous days** before
production access. **Plan for this — it is two weeks of calendar time.**
Organisation accounts are usually exempt.

```bash
cd mobile
eas build --profile production --platform android
eas submit --platform android
```

---

## Apple App Store

**Cost:** ₹8,300/year. **Review time:** usually 24–48 hours.

### Setup

1. Enrol at [developer.apple.com/programs](https://developer.apple.com/programs).
2. Individual enrolment is faster; organisation needs a D-U-N-S number.
3. Create the app in App Store Connect. Bundle ID: `in.biriyanination.app`.

### The rejection that matters: Guideline 4.2

Apple rejects apps that are "just a website in a wrapper" or that have
minimal functionality. **This app is a real React Native app, not a web
view**, which is most of the battle. To be safe:

- Fill the menu with **real photos of your food** before submitting.
  Placeholder images are a common rejection.
- Make sure a reviewer can complete a whole order.
- The counter must be **open** during review, or set generous
  `openTime`/`closeTime` while you are in review — a reviewer who hits
  "Counter closed" cannot test the app and will reject it.

### Demo account — you will be rejected without this

Your app needs an OTP to get past the first screen. A reviewer in
California cannot receive an Indian SMS. In **App Review Information**, give:

```
Sign-in required: Yes
Phone: 9876543210
Code: 123456
Notes: This is a pickup-only ordering app for a single cloud kitchen
       in Bhubaneswar, India. Sign-in is by one-time code. The test
       number above accepts the fixed code 123456. There is no
       delivery feature and the app does not request location access.
```

To make that work, add a test-number bypass in `handleVerifyOtp`:

```ts
// App Store / Play review bypass. The number is not a real customer.
const REVIEW_PHONE = '+919876543210';
const REVIEW_CODE  = '123456';
if (phone === REVIEW_PHONE && code === REVIEW_CODE) {
  const user = await upsertUser(phone);
  return ok({ token: await signToken(phone), user: publicUser(user), admin: false });
}
```

Keep the number one you control, and **never list it in `AdminPhones`**.

### Privacy nutrition label

| Data | Collected | Linked to user | Used for tracking |
|---|---|---|---|
| Phone number | Yes | Yes | No |
| Purchase history | Yes | Yes | No |
| Location | **No** | — | — |

### Encryption question

`app.json` already sets `usesNonExemptEncryption: false`. Correct — you
only use HTTPS, which is exempt.

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

---

## Pre-submission checklist

Work through this before you press submit:

- [ ] Real dish photos uploaded, no placeholders
- [ ] App icon and splash replaced with real branding (defaults are the BN monogram)
- [ ] Privacy policy live on a public URL
- [ ] Account deletion tested (profile → Delete my account)
- [ ] FSSAI number filled in via the admin panel
- [ ] Review demo number + fixed code working
- [ ] `AdminPhones` set to your number, and the admin panel opens
- [ ] Counter open (or hours widened) for the review window
- [ ] Placed a real end-to-end order on a physical device
- [ ] Store description says **pickup only** — do not imply delivery
- [ ] Billing alarm set on AWS
- [ ] `EXPO_PUBLIC_API_URL` points at prod in `eas.json`
- [ ] No OTP-logging debug line left in the backend

---

## Realistic timeline

| Week | What happens |
|---|---|
| 1 | Deploy backend, upload real photos, test on your own phone |
| 2 | Apple/Google account verification, privacy policy, account deletion |
| 3 | Internal testing, fix what real customers trip over |
| 4–5 | Play closed test (14 days, 12 testers) — runs in the background |
| 5 | Submit to Apple; usually approved in 48 hours |
| 6 | Play production |

**Start the developer account registrations first.** They are the long
pole, and they need nothing from the code.
