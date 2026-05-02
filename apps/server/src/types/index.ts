import type { Agency, Session, User } from '@repo/database';

export type UserModel = User;
export type SessionModel = Session;
export type UserSessionModel = {
  session: Session;
  user: UserModel;
};
export type AgencyModel = Agency;

export const VerificationTokenType = {
  EMAIL_CHANGE: 'email_change',
  EMAIL_CHANGE_VERIFICATION: 'email_change_verification',
  EMAIL_VERIFICATION: 'email_verification',
  INVITATION: 'invitation',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
} as const;

export type VerificationTokenType = (typeof VerificationTokenType)[keyof typeof VerificationTokenType];
