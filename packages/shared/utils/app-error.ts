type ServerErrorData = {
  details?: unknown;
  params?: Record<string, string | number>;
  message?: string;
  type?: string;
  status?: number;
  severity?: string;
  entityType?: string;
  logId?: string;
  path?: string;
  method?: string;
  timestamp?: string;
  userId?: string;
};

export class ApiError extends Error {
  details?: unknown;
  params?: Record<string, string | number>;
  status: number;
  key: string;
  type?: string;
  severity?: string;
  entityType?: string;
  logId?: string;
  path?: string;
  method?: string;
  timestamp?: string;
  userId?: string;

  constructor(error: unknown) {
    super();
    this.name = 'ApiError';
    this.status = 500;
    this.key = 'generic';

    if (error instanceof Error && 'key' in error) {
      this.handleApiError(error as ApiError);
    } else if (error && typeof error === 'object' && 'status' in error && 'type' in error) {
      this.handleServerError(error as ServerErrorData);
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      this.status = 0;
      this.key = 'network';
      this.message = 'Network error occurred';
    } else {
      this.handleGenericError(error);
    }
  }

  static async handleResponse(response: Response) {
    const error = new ApiError(response);
    error.status = response.status;

    try {
      const errorData = await response.json();
      if (errorData.type && errorData.message) {
        error.message = errorData.message;
        error.key = error.mapServerErrorTypeToKey(errorData.type);
        error.type = errorData.type;
        error.severity = errorData.severity;
        error.details = errorData.details;
        error.params = errorData.params;
        error.entityType = errorData.entityType;
        error.logId = errorData.logId;
        error.path = errorData.path;
        error.method = errorData.method;
        error.timestamp = errorData.timestamp;
        error.userId = errorData.userId;
        // console.log(this.message);
      }

      if (errorData.message) {
        // Fallback for other error formats
        error.message = errorData.message;
      }
      // console.log(errorData);
    } catch {
      // If can't parse JSON, use status-based mapping
      error.key = error.mapStatusToKey(response.status);
    }
    return error;
  }

  private handleApiError(error: ApiError) {
    this.message = error.message;
    this.status = error.status;
    this.key = error.key;
    this.type = error.type;
    this.severity = error.severity;
    this.details = error.details;
    this.params = error.params;
    this.entityType = error.entityType;
    this.logId = error.logId;
    this.path = error.path;
    this.method = error.method;
    this.timestamp = error.timestamp;
    this.userId = error.userId;
  }

  private handleServerError(errorData: ServerErrorData) {
    this.message = errorData.message || 'Server error';
    this.status = errorData.status || 500;
    this.key = this.mapServerErrorTypeToKey(errorData.type || 'system:unexpected');
    this.type = errorData.type;
    this.severity = errorData.severity;
    this.details = errorData.details;
    this.params = errorData.params;
    this.entityType = errorData.entityType;
    this.logId = errorData.logId;
    this.path = errorData.path;
    this.method = errorData.method;
    this.timestamp = errorData.timestamp;
    this.userId = errorData.userId;
  }

  private handleGenericError(error: unknown) {
    if (error instanceof Error) {
      this.message = error.message;
    }
    this.key = 'generic';
  }

  private mapServerErrorTypeToKey(errorType: string): string {
    if (errorType.startsWith('http:')) {
      return errorType.split(':')[1] || 'generic';
    }
    if (errorType.startsWith('auth:')) {
      return errorType.split(':')[1] || 'unauthorized';
    }
    if (errorType.startsWith('validation:')) {
      return 'bad_request';
    }
    if (errorType.startsWith('database:')) {
      return errorType.split(':')[1] === 'not_found' ? 'not_found' : 'server';
    }
    if (errorType.startsWith('business:')) {
      return 'bad_request';
    }
    return 'generic';
  }

  private mapStatusToKey(status: number): string {
    switch (status) {
      case 400:
        return 'bad_request';
      case 401:
        return 'unauthorized';
      case 403:
        return 'forbidden';
      case 404:
        return 'not_found';
      case 409:
        return 'conflict';
      case 429:
        return 'too_many_requests';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'server';
      default:
        return 'generic';
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      key: this.key,
      type: this.type,
      severity: this.severity,
      details: this.details,
      params: this.params,
      entityType: this.entityType,
      logId: this.logId,
      path: this.path,
      method: this.method,
      timestamp: this.timestamp,
    };
  }
}
