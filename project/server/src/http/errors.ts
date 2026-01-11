export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL_ERROR';

export type ApiErrorBody = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type ApiOkBody<T> = {
  ok: true;
} & T;

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;

  constructor(options: { status: number; code: ApiErrorCode; message: string }) {
    super(options.message);
    this.name = 'AppError';
    this.status = options.status;
    this.code = options.code;
  }
}

export function toApiErrorBody(options: { code: ApiErrorCode; message: string }): ApiErrorBody {
  return {
    ok: false,
    error: {
      code: options.code,
      message: options.message,
    },
  };
}
