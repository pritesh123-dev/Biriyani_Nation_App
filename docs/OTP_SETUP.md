# OTP delivery: WhatsApp or SMS

Your app signs people in with a one-time code. Getting that code onto an
Indian phone is the single most regulated part of this build, so read this
before you promise yourself a launch date.

**Short version: start with WhatsApp.** SMS to Indian numbers needs TRAI
DLT registration, which takes one to two weeks and costs more per message.

---

## Option A — WhatsApp Cloud API (recommended)

**Cost:** roughly **₹0.11–0.14 per authentication conversation**, and Meta
gives you **1,000 free service conversations a month**. At 300 sign-ins a
month you pay nothing.

**Setup time:** an afternoon, if your business documents are ready.

### Steps

1. Create a [Meta Business account](https://business.facebook.com).
2. In [Meta for Developers](https://developers.facebook.com), create an
   app of type **Business**, then add the **WhatsApp** product.
3. Add a phone number. It must **not** already be on WhatsApp or
   WhatsApp Business — get a fresh SIM if you have to.
4. Verify your business (PAN, GST or shop licence, address proof).
   Unverified apps are capped at 250 conversations a day.
5. Create an **AUTHENTICATION** message template:

   | Field | Value |
   |---|---|
   | Name | `biriyani_otp` |
   | Category | Authentication |
   | Language | English |
   | Body | `{{1}} is your verification code.` |
   | Button | Copy code, `{{1}}` |

   Meta usually approves authentication templates within an hour.

6. Generate a **permanent** access token (System User → Add Assets →
   generate token with `whatsapp_business_messaging`). The temporary
   24-hour token in the dashboard is for testing only.

7. Feed both values in:

   ```bash
   cd backend && ./scripts/setup-secrets.sh prod
   ```

8. Deploy with `OtpChannel=whatsapp` (the default).

### Gotchas

- The template name in Meta must exactly match `WHATSAPP_TEMPLATE`
  (defaults to `biriyani_otp`).
- The code appears **twice** in the API call — once in the body, once in
  the button. That is what makes one-tap autofill work. The code already
  does this.
- If a customer has no WhatsApp, they cannot sign in. Offer SMS as well
  once DLT clears (`OtpChannel=both` shows the customer a choice).

---

## Option B — SMS through AWS SNS

**Cost:** about **₹0.20–0.25 per SMS**, plus DLT registration fees.

**Setup time:** one to two weeks, because of TRAI.

### Why it takes so long

Indian law (TRAI's TCCCPR) requires every commercial SMS sender to
register on a **DLT platform** — a blockchain registry run by the telecom
operators. Unregistered messages are dropped silently by the carriers.
You will not get an error; the SMS simply never arrives.

### Steps

1. Register your business on any operator's DLT portal — Jio, Airtel, VI
   and BSNL all run one and they share data. Jio's is usually fastest.
   You need PAN, GST and a letterhead authorisation.
2. Get an **Entity ID** (a long number tied to your business).
3. Register a **Header** (sender ID) — 6 characters, e.g. `BRYNTN`.
4. Register a **Template**. It must match your message **character for
   character**, with `{#var#}` where the code goes:

   ```
   {#var#} is your BiriyaniNation verification code. Valid for 5 minutes. Do not share it with anyone.
   ```

   That is exactly what `backend/src/lib/otp-sender.ts` sends. If you
   change the wording, change it in both places.
5. Get your **Template ID**.
6. In the AWS console, go to **SNS → Text messaging** and:
   - move out of the SMS sandbox (raise a support ticket)
   - set the account spend limit to something sane, like $20/month
   - register your sender ID
7. Add the DLT values to the Lambda environment:

   ```bash
   sam deploy --parameter-overrides \
     "Stage=prod OtpChannel=sms" 
   ```

   and set `DLT_ENTITY_ID`, `DLT_TEMPLATE_ID` and `SMS_SENDER_ID` in
   `template.yaml` under the function's `Environment.Variables`.

### Cheaper alternative

Indian SMS aggregators — **MSG91**, **Fast2SMS**, **2Factor** — handle DLT
for you and often work out cheaper than SNS (₹0.12–0.18 per SMS). To use
one, add a branch in `sendSms()` in `backend/src/lib/otp-sender.ts`; the
function is already isolated behind the `Channel` interface for exactly
this reason.

---

## Which to run

The `OtpChannel` stack parameter takes:

| Value | Behaviour |
|---|---|
| `whatsapp` | Everyone gets WhatsApp. The app hides the channel picker. |
| `sms` | Everyone gets SMS. |
| `both` | The customer picks on the sign-in screen. |

Change it any time with `sam deploy --parameter-overrides OtpChannel=both`.

---

## Testing without spending money

While developing, comment out the `sendOtp()` call in
`handleRequestOtp` and log the code instead:

```ts
console.log('OTP for', phone, 'is', code);   // DEV ONLY — never ship this
```

Read it from `sam logs -n ApiFunction --tail`.

**Delete that line before you deploy to production.** A logged OTP is a
logged credential, and CloudWatch logs are readable by anyone with
console access.

---

## Rate limits already in place

The backend defends itself without any configuration:

| Limit | Value | Where |
|---|---|---|
| Codes per number per hour | 5 | `OTP_SENDS_PER_HOUR` |
| Seconds between codes | 30 | `OTP_RESEND_COOLDOWN` |
| Wrong guesses before lockout | 5 | `OTP_MAX_ATTEMPTS` |
| Code lifetime | 5 minutes | `OTP_TTL_SECONDS` |

Codes are stored **hashed** (HMAC-SHA256 with a per-code salt), never in
plaintext, and are deleted the moment they are used. These are in
`backend/src/handlers/api.ts` if you want to tune them.
