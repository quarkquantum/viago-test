import { logger } from '@repo/logger';
import client from 'twilio';
import { env } from '@/env';

type SendSMSParams = {
  to: string;
  body: string;
  from?: string;
};

type SendWhatsAppParams = {
  to: string;
  body: string;
  from?: string;
};

export const twilioClient = client(env.TWILIO_API_KEY_SID, env.TWILIO_API_SECRET_KEY, {
  accountSid: env.TWILIO_ACCOUNT_SID,
  scheduling: 'fifo',
});

/**
 * Send an SMS message via Twilio
 * @param to - Recipient phone number in E.164 format (e.g., +1234567890)
 * @param body - Message content
 * @param from - Sender phone number (defaults to env.TWILIO_PHONE_NUMBER)
 * @returns Promise with the message SID
 */
export async function sendSMS({ to, body, from }: SendSMSParams) {
  try {
    const message = await twilioClient.messages.create({
      body,
      to,
      from: from || env.TWILIO_SMS_FROM,
    });

    logger.info(`SMS sent successfully. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    logger.error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw new Error(`SMS sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send a WhatsApp message via Twilio
 * @param to - Recipient phone number in E.164 format with 'whatsapp:' prefix (e.g., whatsapp:+1234567890)
 * @param body - Message content
 * @param from - Sender WhatsApp number (defaults to env.TWILIO_WHATSAPP_NUMBER with 'whatsapp:' prefix)
 * @returns Promise with the message SID
 */
export async function sendWhatsApp({ to, body, from }: SendWhatsAppParams) {
  try {
    // Ensure 'whatsapp:' prefix is present
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = from
      ? from.startsWith('whatsapp:')
        ? from
        : `whatsapp:${from}`
      : `whatsapp:${env.TWILIO_WHATSAPP_FROM}`;

    const message = await twilioClient.messages.create({
      body,
      to: formattedTo,
      from: formattedFrom,
    });

    logger.info(`WhatsApp message sent successfully. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    logger.error(`Failed to send WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw new Error(`WhatsApp sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
