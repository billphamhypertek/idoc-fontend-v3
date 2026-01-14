"use client";

import { handleError } from "@/utils/common.utils";
import {
  isServer,
  QueryCache,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode } from "react";

function makeQueryClient() {
  const queryCache = new QueryCache({
    onError: (error) => {
      console.error("Global query error:", error);
      handleError(error);
    },
  });

  const mutationCache = new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error("Global mutation error:", error);
      if (mutation?.meta?.skipGlobalErrorHandler) {
        return;
      }
      handleError(error);
    },
  });

  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // tránh spam retry
      },
    },
    queryCache,
    mutationCache,
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function getBrowserQueryClient() {
  return browserQueryClient;
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
