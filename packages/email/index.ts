import { Resend } from 'resend';
import { EmailOtpTemplate } from './emails/email-otp';
import { keys } from './keys';

export const resend = new Resend(keys().RESEND_TOKEN);

export const sendOtpEmail = async ({
  to,
  username,
  otpCode,
  expiresInMinutes = 10,
}: {
  to: string;
  username: string;
  otpCode: string;
  expiresInMinutes?: number;
}) => {
  const { RESEND_FROM } = keys();

  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    react: EmailOtpTemplate({
      expiresInMinutes,
      locale: 'en',
      otpCode,
      username,
    }),
    subject: `Your verification code: ${otpCode}`,
    to: [to],
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};
