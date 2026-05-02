import { prisma } from '@repo/database';
import { resend } from '@repo/email';
import { EmailOtpTemplate } from '@repo/email/emails';
import { SystemRoles } from '@repo/shared/constants';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, customSession, emailOTP, openAPI } from 'better-auth/plugins';
import { keys } from '../keys';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      sameSite: 'none',
    },
    useSecureCookies: keys().NODE_ENV === 'production',
  },
  basePath: '/api/driver/auth',
  baseURL: keys().NEXT_PUBLIC_API_URL,
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => {
          // Extract firstName, lastName, and phoneNumber from the request body
          // Better Auth passes the original request body in context
          const body = context?.body;
          const firstName = body?.firstName as string | undefined;
          const lastName = body?.lastName as string | undefined;
          const phoneNumber = body?.phoneNumber as string | undefined;

          // Create profile with the additional fields
          await prisma.profile.create({
            data: {
              firstName: firstName?.trim() || undefined,
              lastName: lastName?.trim() || undefined,
              phoneNumber: phoneNumber?.trim() || undefined,
              userId: user.id,
            },
          });
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    disableSignUp: keys().DISABLE_SIGNUP,
    resetPasswordTokenExpiresIn: 10 * 60, // 10 minutes
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 32,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendOnSignIn: true,
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const userData = await prisma.user.findUnique({
        select: {
          email: true,
          emailVerified: true,
          fullName: true,
          id: true,
          image: true,
          profile: true,
          agencyMemberships: {
            where: {
              role: { name: SystemRoles.DRIVER },
            },
            include: {
              agency: true,
            },
          },
        },
        where: { id: user.id },
      });
      return {
        session,
        user: userData,
      };
    }),
    admin({
      // adminRoles: [SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN, SystemRoles.SUPPORT],
      defaultRole: SystemRoles.USER,
      schema: {
        session: {
          fields: {
            impersonatedBy: 'impersonatorId',
          },
        },
      },
    }),

    emailOTP({
      overrideDefaultEmailVerification: true,
      expiresIn: 10 * 60, // 10 minutes

      sendVerificationOTP: async ({ email, otp, type }) => {
        // Get user info for email context
        const user = await prisma.user.findUnique({
          select: { fullName: true },
          where: { email },
        });

        const username = user?.fullName || email.split('@')[0];

        let subject: string;
        if (type === 'email-verification') {
          subject = 'Verify your Viago email address';
        } else if (type === 'sign-in') {
          subject = 'Your Viago sign-in code';
        } else {
          subject = 'Reset your Viago password';
        }

        // Ensure we don't send emails in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`📧 Email verification OTP for ${email}: ${otp}`);
          return;
        }

        try {
          if (keys().NODE_ENV === 'development') {
            console.log(`[DEV] OTP for ${email}: ${otp}`);
          }

          const { data, error } = await resend.emails.send({
            from: keys().RESEND_FROM,
            react: EmailOtpTemplate({
              expiresInMinutes: 10,
              otpCode: otp,
              username: username || 'User', // OTP expires in 10 minutes
            }),
            subject,
            to: [email],
          });

          console.log(data, error);

          if (error) {
            if (keys().NODE_ENV === 'development') {
              console.warn(
                `[DEV] Failed to send email to ${email}, but proceeding because we are in development mode.`
              );
              return;
            }
            throw new Error('Failed to send verification email');
          }
        } catch (error) {
          if (keys().NODE_ENV === 'development') {
            console.warn(
              `[DEV] Failed to send email to ${email}, but proceeding because we are in development mode. Error: ${error}`
            );
            return;
          }
          throw new Error('Failed to send verification email');
        }
      },
    }),
    // Generic
    openAPI(),
  ],
  secret: keys().BETTER_AUTH_SECRET,
  // trustedOrigins: TRUSTED_ORIGINS,
  user: {
    fields: {
      name: 'fullName',
    },
  },
});
