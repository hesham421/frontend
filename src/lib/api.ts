// Centralized API Client Layer
export { apiClient, http, type RequestOptions } from './http/client';
export { refreshOnce } from './http/refreshQueue';
export { ApiError, kindFromStatus, type ApiErrorKind } from './errors/ApiError';
export { mapApiError } from './errors/mapApiError';
export { SEC_ERRORS, secErrorMessage, type SecErrorId } from './errors/secErrors';
