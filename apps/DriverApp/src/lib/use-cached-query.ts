import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNetwork } from '@/contexts/network-context';
import { readCache, writeCache } from './offline-cache';

export function useCachedQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError, TData, QueryKey>
) {
  const { isOffline } = useNetwork();
  const cached = options.queryKey ? readCache<TData>(options.queryKey) : undefined;

  const query = useQuery<TData, TError, TData, QueryKey>({
    ...options,
    placeholderData: cached,
  });

  useEffect(() => {
    if (query.isFetched && !query.isPlaceholderData && query.data && options.queryKey) {
      writeCache(options.queryKey, query.data);
    }
  }, [query.isFetched, query.isPlaceholderData, query.data, options.queryKey]);

  return {
    ...query,
    isStale: query.isPlaceholderData && isOffline,
  };
}
