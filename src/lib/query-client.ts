import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`[Query] ${JSON.stringify(query.queryKey)} 실패`, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(`[Mutation] ${mutation.options.mutationKey ?? "unknown"} 실패`, error);
    },
  }),
});
