export type ApiErrorKind =
  | 'network'
  | 'unauthenticated'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    public status: number | null,
    public code: string | null,
    public correlationId: string | null,
    public fieldErrors: Record<string, string> | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  switch (status) {
    case 400:
      return 'validation';
    case 401:
      return 'unauthenticated';
    case 403:
      return 'forbidden';
    case 404:
      return 'notFound';
    case 409:
    case 422:
      return 'conflict';
    default:
      return status >= 500 ? 'server' : 'unknown';
  }
}
