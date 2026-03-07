export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, options: { statusCode: number; code: string; cause?: unknown }) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.statusCode = options.statusCode;
    this.code = options.code;
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, {
      statusCode: 404,
      code: `${resource.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`,
    });
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, { statusCode: 401, code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, { statusCode: 403, code: 'FORBIDDEN' });
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): AppError {
    return new AppError(message, { statusCode: 400, code });
  }

  static conflict(message: string, code = 'CONFLICT'): AppError {
    return new AppError(message, { statusCode: 409, code });
  }
}
