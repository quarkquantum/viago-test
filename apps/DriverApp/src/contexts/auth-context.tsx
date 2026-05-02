import type { auth } from '@repo/auth/driver/server';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { driverAuthClient } from '@/auth/client';
import { registerFcmToken } from '@/utils/fcm';

// Infer types directly from your auth server
type SessionData = typeof auth.$Infer.Session;
type User = SessionData['user'];
type Session = SessionData['session'];

type LoginParams = {
  email: string;
  password: string;
};

type VerifyEmailParams = {
  email: string;
  otp: string;
  type?: 'sign-in' | 'forget-password' | 'email-verification';
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (params: VerifyEmailParams) => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await driverAuthClient.getSession();

        if (error || !data) {
          setUser(null);
          setSession(null);
        } else {
          setUser(data.user);
          setSession(data.session);
          registerFcmToken();
        }
      } catch (error) {
        console.error('Failed to load session', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async ({ email, password }: LoginParams): Promise<void> => {
    const { data, error } = await driverAuthClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (error || !data?.user) {
      throw error ?? new Error('Login failed');
    }

    setUser(data.user);

    const { data: sessionData } = await driverAuthClient.getSession();
    setSession(sessionData?.session ?? null);

    registerFcmToken();
  };

  const verifyEmail = async ({ email, otp }: VerifyEmailParams) => {
    const { data, error } = await driverAuthClient.emailOtp.verifyEmail({ email, otp });

    if (error) {
      throw new Error(error.message || 'OTP validation failed');
    }

    // Refresh the session to get updated user data (including emailVerified status)
    const { data: sessionData } = await driverAuthClient.getSession();
    if (sessionData?.user) {
      setUser(sessionData.user);
    }
    if (sessionData?.session) {
      setSession(sessionData.session);
    }

    registerFcmToken();

    return data;
  };

  // Logout
  const logout = async () => {
    await driverAuthClient.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ loading, login, logout, session, user, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
