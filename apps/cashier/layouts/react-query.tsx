// In Next.js, this file would be called: app/providers.jsx
'use client';

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // Above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important so we don't re-make a new client if React
  // Suspends during the initial render. This may not be needed if we
  // Have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

import { ProgressProvider } from '@bprogress/next/app';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

type Props = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: Props) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       Have a suspense boundary between this and the code that may
  //       Suspend because React will throw away the client on the initial
  //       Render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <ProgressProvider color="#168039" height="4px" options={{ showSpinner: false }} shallowRouting>
          {children}
        </ProgressProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
