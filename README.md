# BiriyaniNation

A pickup-only ordering app for a single cloud kitchen, built to run on
about **₹10–150 of AWS a month**.

Ported from `App_design/BiriyaniNation-app.html` — the dark/gold visual
system, Instrument Serif display type and Manrope UI type all carry over
to the shipped app.

```
backend/     AWS Lambda + DynamoDB + S3/CloudFront (SAM)
mobile/      Expo React Native app for iOS and Android
admin/       Single-file kitchen dashboard (menu, prices, orders)
docs/        Deployment, OTP setup, costs, store submission
App_design/  The original design file
```

---

## What changed from the design

Everything you asked for, and the reasons where a choice was involved.

**Removed**

| Removed | Why |
|---|---|
| Delivery mode | Pickup-only throughout — no delivery fee, no delivery/pickup toggle |
| Location access screen | The app never asks for location; the permission is blocked in `app.json` |
| Out-of-range screen | There is no range when the customer comes to you |
| Live tracking (map, rider, ETA) | No rider to track |
| Name field at sign-up | The number is the account |
| Google sign-in | OTP only |

**Replaced**

The tracking screen became an **order screen** built around what a pickup
customer actually needs: a large **pickup code** to show at the counter,
a four-step prep bar (Order in → Dum on → Ready → Collected), the
address with a Maps link, and a call button. It polls while the order is
live and stops the moment it is collected or the app is backgrounded.

**Added**

- OTP sign-in over **WhatsApp or SMS**, pluggable per environment
- **Remote config** — names, prices, photos, hours, promos, payment
  methods, all editable after launch with no rebuild
- A **customer list** — every verified number becomes a customer record,
  queryable and exportable as CSV
- **Server-authoritative pricing** — the client sends ids and quantities,
  never money
- **Account deletion** and an **FSSAI licence** field, both store requirements
- A **kitchen admin panel** for the menu and the day's orders

---

## Quick start

```bash
# Backend
cd backend && npm install && npm test
sam build && sam deploy --guided
./scripts/setup-secrets.sh prod

# Admin panel — paste the ApiUrl from the deploy output
open ../admin/index.html

# App
cd ../mobile && npm install
# put the ApiUrl into eas.json, then:
npx expo start
```

Full walkthrough: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

---

## The four documents

| Read this | When |
|---|---|
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Getting it running, start to finish |
| [OTP_SETUP.md](docs/OTP_SETUP.md) | WhatsApp vs SMS, and the TRAI DLT problem |
| [COSTS.md](docs/COSTS.md) | What each piece costs, and the traps that don't |
| [STORE_SUBMISSION.md](docs/STORE_SUBMISSION.md) | App Store and Play Store, and how not to get rejected |

---

## Changing things after launch

This was the main design constraint, so it is worth being explicit about
what costs what:

| Change | How | Time |
|---|---|---|
| Price, dish, photo, hours, promo, sold-out | Admin panel | Instant |
| Open or close the counter | Admin panel toggle | Instant |
| UI or logic fix | `eas update --branch production` | ~2 min |
| New permission, native module, version bump | New build + review | 1–3 days |

Almost everything a kitchen wants to change is in the first two rows.

---

## Architecture

```
  Expo app  ──HTTPS──▶  API Gateway (HTTP API)
                              │
                              ▼
                        Lambda (ARM64, one function, 33 KB)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         DynamoDB      SSM Parameter    WhatsApp Cloud API
      (single table,      Store           or SNS SMS
       on-demand)      (free secrets)
              
  Dish photos:  S3 ──▶ CloudFront ──▶ app
```

One Lambda serves every route. At this traffic level that is both cheaper
and faster than splitting it — one warm container handles everything, so
cold starts are rare.

### Data model

One DynamoDB table:

```
USER#<phone>  / PROFILE          the customer (this is the registered list)
USER#<phone>  / ORDER#<ts>       their order history
OTP#<phone>   / CHALLENGE        hashed code, self-deletes via TTL
RATE#<phone>  / <hour>           send throttle, self-deletes via TTL
ORDER#<id>    / META             the order
CONFIG        / CURRENT          menu, prices, photos, store settings
COUNTER       / ORDER            daily order-number sequence

gsi1:  ORDERS#<date>     → the kitchen's day view
       CUSTOMERS#<date>  → who registered that day
```

---

## Security

- OTP codes are stored **hashed** (HMAC-SHA256, per-code salt), never in
  plaintext, and deleted on use
- 5 codes per number per hour, 30-second resend cooldown, 5 wrong guesses
  then lockout, 5-minute expiry
- Session tokens are HMAC-SHA256 JWTs signed with a key generated at
  setup and held in SSM Parameter Store; they last 90 days
- **Prices are computed server-side from the server's menu.** A tampered
  client cannot buy a mutton family pack for ₹1 — covered by tests
- One customer cannot read another's order by guessing an id
- Admin routes are gated on a phone allowlist baked into the stack
- The app requests **no location permission at all**, and Android
  explicitly blocks it

---

## Tests

```bash
cd backend && npm test
```

41 tests covering the parts where a bug costs money or lets someone in:
cart pricing and promo rules, tampering rejection, phone normalisation,
IST opening hours (including a past-midnight close), OTP generation and
hashing, and pickup-code generation.

---

## Known gaps

Honest list of what is not built:

- **No push notifications.** "Your order is ready" is currently a poll
  while the app is open. Adding Expo push is a few hours and stays free.
- **No payment gateway.** Pay-at-counter and UPI intent only — both cost
  0% in fees, which is deliberate. A gateway slots into the checkout
  screen if you later want automatic reconciliation.
- **Referral codes are issued but not redeemed.** Every customer gets a
  code and the share flow works; crediting the referrer when a friend's
  first order is collected still needs writing.
- **The admin panel has no kitchen-display mode.** It is a dashboard, not
  a always-on order screen.
- **Party enquiries go to WhatsApp**, not into a table.
