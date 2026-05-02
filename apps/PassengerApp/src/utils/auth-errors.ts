export const getAuthErrorMessage = (error: any): string => {
  if (!error) {
    return 'auth.loginFailed';
  }

  switch (error?.code) {
    case 'INVALID_CREDENTIALS': {
      return 'auth.invalidCredentials';
    }
    case 'USER_NOT_FOUND': {
      return 'auth.userNotFound';
    }
    case 'TOO_MANY_REQUESTS': {
      return 'auth.tooManyAttempts';
    }
    case 'EMAIL_NOT_VERIFIED':
    case 'UNVERIFIED_EMAIL': {
      return 'auth.emailNotVerified';
    }
    case 'ACCOUNT_LOCKED': {
      return 'auth.accountLocked';
    }
    default: {
      return error?.message || 'auth.loginFailed';
    }
  }
};
