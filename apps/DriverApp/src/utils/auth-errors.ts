import i18n from '@/i18n';

export const getAuthErrorMessage = (error: any): string => {
  if (!error) {
    return i18n.t('auth.errors.LOGIN_FAILED');
  }

  // Map error codes to translation keys
  const errorKey = (() => {
    switch (error?.code) {
      case 'INVALID_CREDENTIALS':
        return 'INVALID_CREDENTIALS';
      case 'USER_NOT_FOUND':
        return 'USER_NOT_FOUND';
      case 'TOO_MANY_REQUESTS':
        return 'TOO_MANY_REQUESTS';
      case 'EMAIL_NOT_VERIFIED':
      case 'UNVERIFIED_EMAIL':
        return 'EMAIL_NOT_VERIFIED';
      case 'ACCOUNT_LOCKED':
        return 'ACCOUNT_LOCKED';
      default:
        return null;
    }
  })();

  // If we have a mapped error key, use it
  if (errorKey) {
    return i18n.t(`auth.errors.${errorKey}`);
  }

  // If error has a message, use it directly
  if (error?.message) {
    return error.message;
  }

  // Fallback to default error message
  return i18n.t('auth.errors.default');
};
