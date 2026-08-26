# Deploying BiriyaniNation

Three things get deployed, in this order:

1. **Backend** — AWS Lambda + DynamoDB + S3/CloudFront, in your own AWS account
2. **Admin panel** — a single HTML file you open in a browser
3. **Mobile app** — built by EAS, submitted to the App Store and Play Store

Budget for the whole thing: **~₹100–400 a month in AWS**, plus the one-off
store fees (₹2,100 Google, ₹8,300/year Apple). See [COSTS.md](COSTS.md).

---

## Before you start

Install these once:

```bash
brew install awscli aws-sam-cli node        # macOS
npm install -g eas-cli
aws configure                               # your AWS access keys, region ap-south-1
```

Use **ap-south-1 (Mumbai)** as your region — lowest latency for Bhubaneswar
customers and the cheapest sensible choice for an Indian business.

---

## 1. Backend

### 1.1 Deploy the stack

```bash
cd backend
npm install
sam build
sam deploy --guided
```

Answer the prompts:

| Prompt | Answer |
|---|---|
| Stack Name | `biriyani-nation` |
| AWS Region | `ap-south-1` |
| Parameter Stage | `prod` |
| Parameter OtpChannel | `whatsapp` (see [OTP_SETUP.md](OTP_SETUP.md)) |
| Parameter AdminPhones | your mobile, e.g. `+919876543210` |
| Confirm changes before deploy | `N` |
| Allow SAM CLI IAM role creation | `Y` |
| Disable rollback | `N` |
| Save arguments to samconfig.toml | `Y` |

Deployment takes about 5 minutes, mostly CloudFront. When it finishes you get:

```
ApiUrl      https://abc123.execute-api.ap-south-1.amazonaws.com/prod
MediaUrl    https://d1234abcd.cloudfront.net
TableName   biriyani-nation-prod
MediaBucket biriyani-nation-media-prod-123456789012
```

**Write down `ApiUrl`** — you need it in two more places.

> `AdminPhones` is what makes a number a kitchen admin. Get it wrong and
> you cannot open the admin panel. You can change it later with
> `sam deploy --parameter-overrides AdminPhones=+919876543210`.

### 1.2 Create the secrets

```bash
./scripts/setup-secrets.sh prod
```

This generates the JWT signing key automatically and prompts for your
WhatsApp credentials. It uses **SSM Parameter Store (Standard tier)**,
which is free — Secrets Manager would cost $0.40 per secret per month.

### 1.3 Seed the menu (optional)

The API already serves the default menu, so the app works immediately.
Running this just materialises it in DynamoDB so the admin panel starts
from a stored copy:

```bash
node scripts/seed-config.mjs biriyani-nation-prod
```

### 1.4 Check it works

```bash
curl https://YOUR-API-URL/health
# {"ok":true}

curl https://YOUR-API-URL/config | head -c 400
# the menu as JSON
```

---

## 2. Admin panel

No deployment needed — it is one file.

```bash
open admin/index.html
```

Paste your `ApiUrl`, enter the mobile number you set as `AdminPhones`,
verify the OTP, and you are in. From here you can:

- change dish names, descriptions, prices and photos
- mark dishes sold out
- open and close the counter
- change the promo code and tax rate
- work through today's orders (placed → cooking → ready → collected)
- export the customer list as CSV

**Every change is live in the app on next launch. No rebuild, no store review.**

If you want the panel on a URL instead of a local file, drop it in an S3
bucket with static hosting — about ₹5/month. Do not make the bucket
public without a password in front of it; the API still requires an admin
OTP, but there is no reason to advertise the panel.

### Uploading dish photos

```bash
./scripts/upload-image.sh ~/Desktop/chicken.jpg dishes/chicken.jpg
```

It prints a key like `dishes/chicken.jpg`. Paste that into the dish's
**Photo** field in the admin panel. The app resolves it through
CloudFront automatically.

Shoot photos at **1200×1500** (4:5 portrait), compress to under 200 KB.
Free tool: [squoosh.app](https://squoosh.app).

---

## 3. Mobile app

### 3.1 Point the app at your backend

Edit `mobile/eas.json` and replace all three `REPLACE...` URLs with your
`ApiUrl`.

### 3.2 Create the EAS project

```bash
cd mobile
npm install
eas login                 # free Expo account
eas init                  # prints a project ID
```

Put that project ID into `mobile/app.json` in **both** places that say
`REPLACE_WITH_EAS_PROJECT_ID`.

### 3.3 App icons

Placeholder icons using the BN monogram are **already in
`mobile/assets/`**, so the project builds as-is. Replace them with your
real branding before you submit to the stores:

| File | Size | Notes |
|---|---|---|
| `icon.png` | 1024×1024 | no transparency, no rounded corners — the OS masks it |
| `adaptive-icon.png` | 1024×1024 | logo inside the safe middle 66% |
| `splash.png` | 1284×2778 | logo centred on `#0B0906` |

Same for `mobile/assets/hero-biriyani.jpg` — it is the low-resolution
image from the design file. Shoot a real one and either replace the file
or, better, upload it and set it as the **Hero image** in the admin
panel, so you can change it again later without a rebuild.

### 3.4 Test on your own phone first

```bash
eas build --profile preview --platform android
```

Install the APK it gives you and place a real order end to end. Do this
before you touch the stores.

### 3.5 Production builds

```bash
eas build --profile production --platform android   # .aab for Play
eas build --profile production --platform ios       # .ipa for App Store
```

iOS needs a paid Apple Developer account; EAS walks you through the
certificates.

### 3.6 Submit

See [STORE_SUBMISSION.md](STORE_SUBMISSION.md) — that is the part with
the most rejections, so it has its own guide.

---

## Updating after launch

There are three kinds of change, and they cost very different amounts of
effort:

| What changed | How to ship it | How long |
|---|---|---|
| Price, dish, photo, hours, promo | Admin panel | Instant |
| JS/UI change | `eas update --branch production` | ~2 minutes |
| Native change, new permission, version bump | New build + store review | 1–3 days |

Most of what a kitchen wants to change is in the first row, which is the
whole point of the remote config.

**Over-the-air updates** (`eas update`) let you fix a UI bug without a
store review. Both stores permit this for JavaScript-only changes.

---

## Watching costs

```bash
# What the API is doing
sam logs -n ApiFunction --stack-name biriyani-nation --tail

# A billing alarm so nothing surprises you
aws budgets create-budget --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget '{"BudgetName":"biriyani-nation","BudgetLimit":{"Amount":"10","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}'
```

Set the budget on day one. It is the cheapest insurance there is.

---

## Tearing it down

```bash
aws s3 rm s3://biriyani-nation-media-prod-ACCOUNTID --recursive
sam delete --stack-name biriyani-nation
```

DynamoDB has point-in-time recovery on, so take a backup first if the
order history matters to you.
