export type Locale = 'en' | 'fr';

type Translations = {
  [key: string]: string | Translations;
};

const base: Record<Locale, Translations> = {
  en: {
    common: {
      copyright: '© {year} Viago',
      hiUser: 'Hi {user}!',
    },
    emailOtp: {
      almostThere: 'Almost there! Just one more step.',
      codeExpires: 'This code expires in {minutes} minutes',
      codeLabel: 'VERIFICATION CODE',
      dontShare: "Don't share this code with anyone",
      enterCode: 'Enter this code to verify your account',
      heading: 'Verify Your Email',
      ignoreIf: "If you didn't request this, ignore this email",
      important: 'Important',
      needHelp: 'Need help? Contact support.',
      preview: 'Your Viago verification code: {code}',
      welcome: 'Welcome to Viago! Use the verification code above to complete your registration.',
    },
    resetPassword: {
      buttonLabel: 'Reset Password',
      explanation: 'We received a request to reset your password. Click the button below to proceed.',
      heading: 'Reset Your Password',
      linkExplanation: "If the button above doesn't work, copy and paste the following link into your browser:",
      preview: 'Hi {user}, here is your password reset link.',
    },
    temporaryCredentials: {
      emailLabel: 'Email',
      explanation: 'Here are your temporary login credentials.',
      firstLogin: 'At your first login, you will be required to set a new password.',
      heading: 'Your Temporary Credentials',
      passwordLabel: 'Temporary Password',
      preview: 'Hi {user}, here are your temporary credentials.',
    },
  },
  fr: {
    common: {
      copyright: '© {year} Viago',
      hiUser: 'Bonjour {user} !',
    },
    resetPassword: {
      buttonLabel: 'Réinitialiser le mot de passe',
      explanation: 'Nous avons reçu une demande de réinitialisation de votre mot de passe.',
      heading: 'Réinitialiser votre mot de passe',
      linkExplanation: "Si le bouton ne fonctionne pas, copiez-collez le lien suivant dans votre navigateur :",
      preview: 'Bonjour {user}, voici votre lien de réinitialisation.',
    },
    temporaryCredentials: {
      emailLabel: 'Email',
      explanation: 'Voici vos identifiants de connexion temporaires.',
      firstLogin: 'À la première connexion, vous devrez définir un nouveau mot de passe.',
      heading: 'Vos identifiants temporaires',
      passwordLabel: 'Mot de passe temporaire',
      preview: 'Bonjour {user}, voici vos identifiants temporaires.',
    },
  },
};

const dirMap: Record<Locale, 'ltr' | 'rtl'> = { en: 'ltr', fr: 'ltr' };

export function direction(locale: Locale) {
  return dirMap[locale];
}

function get(obj: Translations, path: string): string | undefined {
  let current: unknown = obj;
  for (const segment of path.split('.')) {
    if (current && typeof current === 'object' && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const raw = get(base[locale], key) ?? get(base.en, key) ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? `{${v}}`));
}

export const i18n = { direction, t };
