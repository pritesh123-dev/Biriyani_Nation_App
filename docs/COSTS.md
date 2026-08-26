# What this actually costs

Everything below is priced for **ap-south-1 (Mumbai)** and assumes a
single cloud kitchen. Rupee figures use ₹84 to the dollar.

---

## Monthly AWS bill

### At 50 orders a day (~1,500/month)

| Service | Usage | Cost |
|---|---|---|
| Lambda | ~25k requests, 512 MB, ARM | **₹0** (free tier: 1M req/mo) |
| API Gateway HTTP API | 25k requests | **₹0** (free tier: 1M/mo for 12 months, then ~₹2) |
| DynamoDB on-demand | ~60k reads, 15k writes | **₹0** (free tier: 25 RCU/WCU) |
| S3 | 50 MB of dish photos | **₹0.10** |
| CloudFront | ~2 GB out | **₹0** (free tier: 1 TB/mo) |
| CloudWatch Logs | ~200 MB, 14-day retention | **₹8** |
| SSM Parameter Store | 3 standard parameters | **₹0** |
| **Total** | | **≈ ₹10/month** |

### At 300 orders a day (~9,000/month)

| Service | Cost |
|---|---|
| Lambda | ₹0 (still inside free tier) |
| API Gateway | ₹15 |
| DynamoDB | ₹40 |
| S3 + CloudFront | ₹25 |
| CloudWatch Logs | ₹45 |
| **Total** | **≈ ₹125/month** |

### At 1,000 orders a day (~30,000/month)

Roughly **₹450/month**. You would be doing ₹90 lakh a year in revenue at
that point, so the infrastructure is 0.06% of turnover.

---

## OTP delivery — the real variable cost

This is the one line that scales with sign-ins, not orders.

| Channel | Per message | 500 sign-ins/mo | 5,000 sign-ins/mo |
|---|---|---|---|
| WhatsApp Cloud API | ₹0.11–0.14 | **₹0** (1,000 free) | ₹560 |
| AWS SNS SMS | ₹0.20–0.25 | ₹110 | ₹1,125 |
| MSG91 / Fast2SMS | ₹0.12–0.18 | ₹75 | ₹750 |

Sign-ins are not orders. A returning customer stays signed in for **90
days**, so a kitchen with 2,000 regulars sends far fewer OTPs than you
would guess.

---

## One-off and yearly

| Item | Cost | Notes |
|---|---|---|
| Google Play Developer | **₹2,100 once** | lifetime |
| Apple Developer Program | **₹8,300/year** | mandatory to stay on the App Store |
| Expo EAS | **₹0** | free tier: 30 builds/month, plenty |
| Domain (optional) | ₹800/year | only if you want a website |
| **Year one, Android only** | **₹2,100 + ~₹150** | |
| **Year one, both stores** | **₹10,400 + ~₹150** | |

---

## Payment processing — where the money actually goes

This dwarfs every hosting cost, which is why the app defaults to pay at
counter.

| Method | Fee | On ₹1,00,000/month |
|---|---|---|
| **Pay at counter** | **0%** | **₹0** |
| **UPI intent** (app opens their UPI app) | **0%** | **₹0** |
| Razorpay / PayU UPI | ~2% + GST | ₹2,360 |
| Razorpay cards | ~2–3% + GST | ₹2,360–3,540 |

The app ships with pay-at-counter and UPI intent only. Both cost you
nothing. **You do not need a payment gateway to launch**, and for a
pickup kitchen you may never need one — the customer is standing in front
of you when they pay.

If you later want in-app card payments with automatic reconciliation, add
Razorpay; the checkout screen is already structured so a third method
slots in.

---

## Realistic first-year total

**Android-only launch, 50 orders/day, WhatsApp OTP:**

```
Play Developer account       ₹2,100  (once)
AWS, 12 months                 ₹150
WhatsApp OTP                     ₹0  (inside free tier)
Payment fees                     ₹0  (counter + UPI)
                             ───────
Year one                     ₹2,250
```

**Both stores, 300 orders/day:**

```
Play + Apple               ₹10,400
AWS, 12 months              ₹1,500
WhatsApp OTP                  ₹800
                            ───────
Year one                   ₹12,700
```

---

## How the build keeps it this low

These were deliberate choices, not accidents:

- **HTTP API, not REST API** — $1.00 per million requests instead of $3.50
- **Lambda on ARM64 (Graviton)** — 20% cheaper than x86, same speed
- **One Lambda for every route** — one warm container serves everything,
  so cold starts are rare and there is nothing idling
- **33 KB bundle** — hand-rolled JWT instead of `jsonwebtoken`, which
  keeps cold starts short (short cold starts are most of what a
  low-traffic app pays for)
- **DynamoDB on-demand** — ₹0 when nobody is ordering, no provisioned
  capacity to forget about
- **SSM Parameter Store, not Secrets Manager** — free instead of ₹34 per
  secret per month
- **14-day log retention** — CloudWatch Logs is the classic silent cost;
  capped here on purpose
- **CloudFront PriceClass_100** — the cheapest tier that still serves
  India well
- **ETag on `/config`** — a phone that already has the current menu
  downloads nothing

---

## Things that would blow the budget

Watch for these:

| Trap | Cost | Avoid by |
|---|---|---|
| Log retention set to "Never expire" | grows forever | already capped at 14 days |
| A polling loop left running | millions of requests | order screen stops polling when collected or backgrounded |
| DynamoDB provisioned mode | ~₹800/mo idle | template uses on-demand |
| NAT Gateway | **₹2,700/mo** | never put Lambda in a VPC unless you must |
| Secrets Manager | ₹34/secret/mo | using SSM instead |
| Payment gateway before you need one | 2% of everything | counter + UPI at launch |

Set the billing alarm from [DEPLOYMENT.md](DEPLOYMENT.md) on day one.
