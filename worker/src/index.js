const RAZORPAY_SIGNATURE_HEADER = "x-razorpay-signature";

export default {
  async fetch(request, env) {
    try {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }

      const rawBody = await request.text();
      const signature = request.headers.get(RAZORPAY_SIGNATURE_HEADER);

      if (!signature || !(await isValidRazorpaySignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET))) {
        return json({ error: "Invalid signature" }, 400);
      }

      let event;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }

      if (!isSuccessfulPaymentEvent(event)) {
        return json({ received: true, ignored: true });
      }

      const customerEmail = findCustomerEmail(event);
      if (!customerEmail) {
        return json({ error: "Paid event did not include a customer email" }, 422);
      }

      const paymentId = findPaymentId(event);
      const calendarInvite = buildCalendarInvite(env, paymentId || crypto.randomUUID(), customerEmail);

      await sendCalendarEmail(env, customerEmail, calendarInvite);

      return json({ received: true, inviteSent: true });
    } catch (error) {
      return json({ error: error.message || "Webhook failed" }, 500);
    }
  }
};

function isSuccessfulPaymentEvent(event) {
  const eventName = String(event?.event || "");
  const paymentStatus = event?.payload?.payment?.entity?.status;
  const paymentLinkStatus = event?.payload?.payment_link?.entity?.status;

  return (
    eventName === "payment.captured" ||
    eventName === "payment_link.paid" ||
    paymentStatus === "captured" ||
    paymentLinkStatus === "paid"
  );
}

function findCustomerEmail(event) {
  return (
    event?.payload?.payment?.entity?.email ||
    event?.payload?.payment?.entity?.notes?.email ||
    event?.payload?.payment_link?.entity?.customer?.email ||
    event?.payload?.payment_link?.entity?.email ||
    event?.payload?.order?.entity?.notes?.email ||
    null
  );
}

function findPaymentId(event) {
  return (
    event?.payload?.payment?.entity?.id ||
    event?.payload?.payment_link?.entity?.id ||
    event?.payload?.order?.entity?.id ||
    null
  );
}

async function isValidRazorpaySignature(rawBody, signature, secret) {
  if (!secret) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = toHex(digest);

  return timingSafeEqual(expected, signature);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

function buildCalendarInvite(env, id, attendeeEmail) {
  const title = env.EVENT_TITLE || "Yin For Yoga Session";
  const location = env.EVENT_LOCATION || "Online";
  const description = env.EVENT_DESCRIPTION || "Thank you for booking your Yin For Yoga session.";
  const start = toIcsDate(env.EVENT_START_ISO);
  const end = toIcsDate(env.EVENT_END_ISO);
  const stamp = toIcsDate(new Date().toISOString());
  const uid = `${sanitizeIcsText(id)}@yinforyoga`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yin For Yoga//Payment Calendar Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${attendeeEmail}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function toIcsDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid event date: ${value}`);
  }

  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function sanitizeIcsText(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function sendCalendarEmail(env, to, calendarInvite) {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to,
      subject: `Your calendar invite: ${env.EVENT_TITLE || "Yin For Yoga Session"}`,
      html: buildEmailHtml(env),
      attachments: [
        {
          filename: "yinforyoga-session.ics",
          content: base64Encode(calendarInvite)
        }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend failed: ${response.status} ${detail}`);
  }
}

function base64Encode(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function buildEmailHtml(env) {
  return `
    <p>Thank you for your payment.</p>
    <p>Your Yin For Yoga calendar invite is attached to this email.</p>
    <p><strong>Session:</strong> ${escapeHtml(env.EVENT_TITLE || "Yin For Yoga Session")}</p>
    <p><strong>Location:</strong> ${escapeHtml(env.EVENT_LOCATION || "Online")}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
