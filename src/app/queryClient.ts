import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../lib/errors/ApiError';

// One instance, module scope (R.3.16).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const kind = error instanceof ApiError ? error.kind : 'unknown';
        return (kind === 'network' || kind === 'server') && failureCount < 2; // R.3.13
      },
      retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
      refetchOnWindowFocus: false, // ERP data is not a live feed; focus refetch is noise
      refetchOnReconnect: true,
    },
    mutations: { retry: false },
  },
});
