import type { InfiniteData, QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNetwork } from '@/contexts/network-context';
import { readCache, writeCache } from './offline-cache';

export function useCachedInfiniteQuery<TData = unknown, TError = Error>(
  options: UseInfiniteQueryOptions<TData, TError, InfiniteData<TData>, TData, QueryKey, number>
) {
  const { isOffline } = useNetwork();
  const cached = options.queryKey ? readCache<InfiniteData<TData>>(options.queryKey) : undefined;

  const query = useInfiniteQuery<TData, TError, InfiniteData<TData>, QueryKey, number>({
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
