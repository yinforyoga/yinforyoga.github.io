# Yin For Yoga Payment Webhook

This Cloudflare Worker receives Razorpay payment webhooks, verifies the webhook
signature, and emails the customer a calendar invite through Resend.

## Configure

Update the non-secret event values in `wrangler.toml`:

- `EVENT_TITLE`
- `EVENT_LOCATION`
- `EVENT_DESCRIPTION`
- `EVENT_START_ISO`
- `EVENT_END_ISO`
- `EMAIL_FROM`

Use ISO dates with timezone offsets, for example:

```txt
2026-06-01T07:00:00+05:30
```

Set secrets in Cloudflare:

```bash
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
```

## Deploy

From this folder:

```bash
npx wrangler deploy
```

After deployment, copy the Worker URL and add it in Razorpay as a webhook URL.
Subscribe it to successful payment events such as:

- `payment.captured`
- `payment_link.paid`

## Notes

- The invite is sent only after Razorpay sends a signed successful-payment
  webhook.
- The Worker looks for the customer email in common Razorpay payload locations:
  payment email, payment notes, payment link customer email, or order notes.
- The `EMAIL_FROM` domain must be verified in Resend before live sending.
