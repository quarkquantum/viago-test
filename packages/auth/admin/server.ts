import { prisma } from '@repo/database';
import { resend } from '@repo/email';
import { EmailOtpTemplate, ResetPasswordEmailTemplate } from '@repo/email/emails';
import { AgencyStatus, SystemRoles } from '@repo/shared/constants';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin, createAuthMiddleware, customSession, emailOTP, openAPI, twoFactor } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';
import { TRUSTED_ORIGINS } from '../constants';

// Runtime environment reader (not baked at build time)
const getEnv = (key: string) => process.env[key];
const getNodeEnv = () => getEnv('NODE_ENV') || 'development';
const getCookieDomain = () => getEnv('NEXT_PUBLIC_COOKIE_DOMAIN') || '.velora-viago.com';
const getApiUrl = () => getEnv('NEXT_PUBLIC_API_URL') || 'http://localhost:3000';
const getBetterAuthSecret = () => getEnv('BETTER_AUTH_SECRET') || '';

// Create access control with admin permissions
const statement = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statement);

// Create roles with full admin permissions
const adminRole = ac.newRole({
  ...adminAc.statements,
});

const superAdminRole = ac.newRole({
  ...adminAc.statements,
});

const supportRole = ac.newRole({
  ...adminAc.statements,
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  advanced: {
    crossSubDomainCookies: {
      // In production, use the main domain for cross-subdomain cookies
      // In development, use localhost
      domain: getNodeEnv() === 'production' 
        ? getCookieDomain()
        : getEnv('NEXT_PUBLIC_COOKIE_DOMAIN'),
      enabled: true,
    },
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      sameSite: getNodeEnv() === 'production' ? 'none' : 'lax',
      // Ensure cookies are accessible across subdomains in production
      ...(getNodeEnv() === 'production' && { 
        secure: true,
        domain: getCookieDomain(),
      }),
    },
    useSecureCookies: getNodeEnv() === 'production',
  },
  basePath: '/api/admin/auth',
  baseURL: getApiUrl(),
  secret: getBetterAuthSecret(),
  trustedOrigins: TRUSTED_ORIGINS,
  user: {
    fields: {
      name: 'fullName',
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Allow admin plugin endpoints (like createUser) to bypass checks
      // These are authenticated at the API level via middleware
      if (
        ['/session', '/get-session', '/sign-out'].includes(ctx.path) ||
        ctx.path.startsWith('/two-factor') ||
        ctx.path.startsWith('/email-otp') ||
        ctx.path.startsWith('/admin')
      ) {
        return;
      }

      // Get email from request body
      let email: string | undefined;
      if (ctx.body && typeof ctx.body === 'object') {
        email = ctx.body.email;
      }

      if (ctx.path === '/sign-in/email' || ctx.path === '/sign-up/email') {
        // For sign-in/sign-up paths, validate admin role
        if (!email) {
          throw new APIError('BAD_REQUEST', { message: 'api.auth.email_required' });
        }

        // Check if user exists and is an admin
        const user = await prisma.user.findFirst({
          where: { email },
          select: {
            id: true,
            email: true,
            role: true,
          },
        });

        // User doesn't exist or is not an admin
        if (!user) {
          throw new APIError('FORBIDDEN', {
            message: 'api.auth.no_account_found',
          });
        }

        // if (user.role !== SystemRoles.ADMIN) {
        //   throw new APIError('FORBIDDEN', {
        //     message: 'api.auth.unauthorized_access',
        //   });
        // }

        return; // Allow sign-in/sign-up to proceed
      }

      // if (!ctx.context.session?.user.id) {
      //   throw new APIError('FORBIDDEN', {
      //     message: 'api.auth.unauthorized_access',
      //   });
      // }
    }),
  },
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
    autoSignIn: true,
    disableSignUp: keys().DISABLE_SIGNUP,
    resetPasswordTokenExpiresIn: 10 * 60, // 10 minutes
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 32,
    sendResetPassword: async ({ user, url }) => {
      const username = user.name || user.email.split('@')[0] || 'User';
      await resend.emails.send({
        from: keys().RESEND_FROM as string,
        react: ResetPasswordEmailTemplate({
          resetLink: url,
          username,
        }),
        subject: 'Reset your Viago password',
        to: [user.email],
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: false,
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const userData = await prisma.user.findUnique({
        select: {
          agencies: {
            select: {
              name: true,
              slug: true,
              status: true,
            },
            where: {
              status: AgencyStatus.ACTIVE,
            },
          },
          email: true,
          emailVerified: true,
          fullName: true,
          id: true,
          image: true,
          profile: true,
        },
        where: { id: user.id, role: SystemRoles.ADMIN },
      });
      return {
        session,
        user: userData,
      };
    }),
    admin({
      ac,
      roles: {
        [SystemRoles.ADMIN]: adminRole,
        [SystemRoles.SUPER_ADMIN]: superAdminRole,
        [SystemRoles.SUPPORT]: supportRole,
      },
      schema: {
        session: {
          fields: {
            impersonatedBy: 'impersonatorId',
          },
        },
      },
    }),

    emailOTP({
      overrideDefaultEmailVerification: false,
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

        try {
          const { data, error } = await resend.emails.send({
            from: keys().RESEND_FROM as string,
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
            throw new Error('Failed to send verification email');
          }
        } catch (error) {
          console.error('Failed to send verification email:', error);
          if (keys().NODE_ENV === 'development') {
            console.warn(`[DEV] Failed to send email to ${email}, but proceeding because we are in development mode.`);
            return;
          }
          throw new Error('Failed to send verification email');
        }
      },
    }),
    twoFactor({
      otpOptions: {
        sendOTP: async ({ otp, user }) => {
          const username = user?.name || user?.email.split('@')[0] || 'User ';

          try {
            if (keys().NODE_ENV === 'development') {
              console.log(`[DEV] OTP for ${user?.email}: ${otp}`);
            }
            console.log(otp);
            await resend.emails.send({
              from: keys().RESEND_FROM as string,
              react: EmailOtpTemplate({
                expiresInMinutes: 5,
                otpCode: otp,
                username,
              }),
              subject: 'Your Viago 2FA Code',
              to: [user.email],
            });
          } catch (error) {
            console.error('Failed to send 2FA email:', error);
            if (keys().NODE_ENV === 'development') {
              console.warn(
                `[DEV] Failed to send email to ${user.email}, but proceeding because we are in development mode.`
              );
              return;
            }
            throw new Error('Failed to send 2FA email');
          }
        },
      },
    }),
    // Generic
    openAPI(),
    nextCookies(), // This always the last plugin in array
  ],
});
