import type { auth } from '@repo/auth/app/server';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { appAuthClient } from '@/auth/client';
import { registerFcmToken } from '@/utils/fcm';

// Infer types directly from your auth server
type SessionData = typeof auth.$Infer.Session;
type User = SessionData['user'];
type Session = SessionData['session'];

type LoginParams = {
  email: string;
  password: string;
};

type RegisterParams = {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phoneNumber?: string;
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
  register: (params: RegisterParams) => Promise<any>;
  logout: () => Promise<void>;
  verifyEmail: (params: VerifyEmailParams) => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(undefined);
  const [session, setSession] = useState<Session | null>(undefined);
  const [loading, setLoading] = useState(true);

  // Load existing session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await appAuthClient.getSession();
        if (!data || error) {
          setUser(undefined);
          setSession(undefined);
        } else {
          setUser(data.user ?? undefined);
          setSession(data.session ?? undefined);
        }
      } catch (error) {
        console.error('Failed to load session', error);
        setUser(undefined);
        setSession(undefined);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async ({ email, password }: LoginParams): Promise<void> => {
    const { data, error } = await appAuthClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (error || !data?.user) {
      throw error ?? new Error('Login failed');
    }

    setUser(data.user);

    const { data: sessionData } = await appAuthClient.getSession();
    setSession(sessionData?.session ?? undefined);

    registerFcmToken();
  };

  const register = async ({ email, password, firstname, lastname, phoneNumber }: RegisterParams) => {
    const { data, error } = await appAuthClient.signUp.email({
      email,
      firstName: firstname,
      lastName: lastname,
      name: `${firstname} ${lastname}`,
      password,
      phoneNumber,
    } as any);

    if (error || !data) {
      throw new Error(error?.message || 'Registration failed');
    }

    return data;
  };

  const verifyEmail = async ({ email, otp }: VerifyEmailParams) => {
    const { data, error } = await appAuthClient.emailOtp.verifyEmail({ email, otp });

    if (error) {
      throw new Error(error.message || 'OTP validation failed');
    }

    // Refresh the session to get updated user data (including emailVerified status)
    const { data: sessionData } = await appAuthClient.getSession();
    if (sessionData?.user) {
      setUser(sessionData.user);
    }
    if (sessionData?.session) {
      setSession(sessionData.session);
    }

    return data;
  };

  // Logout
  const logout = async () => {
    await appAuthClient.signOut();
    setUser(undefined);
    setSession(undefined);
  };

  return (
    <AuthContext.Provider value={{ loading, login, logout, register, session, user, verifyEmail }}>
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
