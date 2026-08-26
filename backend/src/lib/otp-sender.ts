import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { getSecret } from './auth.js';

const sns = new SNSClient({});

export type Channel = 'whatsapp' | 'sms';

/**
 * Two providers, one interface. Which one runs is config, not code, so you
 * can switch after launch without shipping an app update.
 *
 * WhatsApp (Meta Cloud API) is the cheap path in India: authentication
 * templates run roughly ₹0.11–0.13 per delivered conversation and Meta
 * gives 1,000 free service conversations a month. It needs a Meta Business
 * account and an approved AUTHENTICATION template.
 *
 * SMS via SNS is the fallback. Sending to Indian numbers requires TRAI DLT
 * registration (entity ID + header + template) — see docs/OTP_SETUP.md.
 * Until DLT clears, keep OTP_CHANNEL=whatsapp.
 */
export async function sendOtp(phone: string, code: string, channel: Channel): Promise<void> {
  if (channel === 'whatsapp') return sendWhatsApp(phone, code);
  return sendSms(phone, code);
}

async function sendWhatsApp(phone: string, code: string): Promise<void> {
  const token = await getSecret('whatsapp-token');
  const phoneNumberId = await getSecret('whatsapp-phone-id');
  const template = process.env.WHATSAPP_TEMPLATE || 'biriyani_otp';

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''),
        type: 'template',
        template: {
          name: template,
          language: { code: 'en' },
          components: [
            { type: 'body', parameters: [{ type: 'text', text: code }] },
            // Meta requires the code to be repeated in the button component
            // for one-tap autofill on AUTHENTICATION templates.
            {
              type: 'button', sub_type: 'url', index: '0',
              parameters: [{ type: 'text', text: code }],
            },
          ],
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${body}`);
  }
}

async function sendSms(phone: string, code: string): Promise<void> {
  // Message text must match a DLT-approved template exactly, or Indian
  // carriers silently drop it.
  const senderId = process.env.SMS_SENDER_ID || 'BRYNTN';
  await sns.send(new PublishCommand({
    PhoneNumber: phone,
    Message: `${code} is your BiriyaniNation verification code. Valid for 5 minutes. Do not share it with anyone.`,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType':   { DataType: 'String', StringValue: 'Transactional' },
      'AWS.SNS.SMS.SenderID':  { DataType: 'String', StringValue: senderId },
      // Required by SNS for India-bound traffic once DLT is registered.
      ...(process.env.DLT_ENTITY_ID && {
        'AWS.MM.SMS.EntityId':   { DataType: 'String', StringValue: process.env.DLT_ENTITY_ID },
      }),
      ...(process.env.DLT_TEMPLATE_ID && {
        'AWS.MM.SMS.TemplateId': { DataType: 'String', StringValue: process.env.DLT_TEMPLATE_ID },
      }),
    },
  }));
}
