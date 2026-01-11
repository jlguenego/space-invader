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

export type ApiOkBody<T extends Record<string, unknown>> = {
  ok: true;
} & T;

export type ApiClientErrorKind = 'network' | 'http' | 'parse' | 'unexpected';

export class ApiClientError extends Error {
  public readonly kind: ApiClientErrorKind;
  public readonly status?: number;
  public readonly url?: string;
  public readonly apiErrorCode?: ApiErrorCode;
  public readonly apiErrorMessage?: string;

  constructor(options: {
    kind: ApiClientErrorKind;
    message: string;
    status?: number;
    url?: string;
    apiErrorCode?: ApiErrorCode;
    apiErrorMessage?: string;
    cause?: unknown;
  }) {
    super(options.message);
    this.name = 'ApiClientError';
    this.kind = options.kind;
    this.status = options.status;
    this.url = options.url;
    this.apiErrorCode = options.apiErrorCode;
    this.apiErrorMessage = options.apiErrorMessage;

    // In runtimes that support it.
    if ('cause' in Error.prototype) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.cause = options.cause;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value)) return false;
  if (value.ok !== false) return false;

  const error = value.error;
  if (!isRecord(error)) return false;
  if (typeof error.code !== 'string') return false;
  if (typeof error.message !== 'string') return false;

  return true;
}

function normalizeApiPath(path: string): string {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = normalizeApiPath(path);

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    throw new ApiClientError({
      kind: 'network',
      message: 'Network error',
      url,
      cause,
    });
  }

  const status = response.status;

  let text: string;
  try {
    text = await response.text();
  } catch (cause) {
    throw new ApiClientError({
      kind: 'unexpected',
      message: 'Unable to read response',
      status,
      url,
      cause,
    });
  }

  let parsed: unknown;
  try {
    parsed = text.length === 0 ? null : JSON.parse(text);
  } catch (cause) {
    throw new ApiClientError({
      kind: 'parse',
      message: 'Invalid JSON response',
      status,
      url,
      cause,
    });
  }

  if (isApiErrorBody(parsed)) {
    throw new ApiClientError({
      kind: 'http',
      message: parsed.error.message,
      status,
      url,
      apiErrorCode: parsed.error.code,
      apiErrorMessage: parsed.error.message,
    });
  }

  if (!response.ok) {
    throw new ApiClientError({
      kind: 'http',
      message: `HTTP ${status}`,
      status,
      url,
    });
  }

  return parsed as T;
}
