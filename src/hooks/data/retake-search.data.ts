import { useQuery } from "@tanstack/react-query";
import { RetakeService } from "@/services/retake.service";
import { queryKeys } from "@/definitions/constants/queryKey.constants";

export const useGetDocumentIn = (page: number = 1, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.retake.document_in, page],
    queryFn: async () => {
      return await RetakeService.getDocumentIn({ page });
    },
    enabled: enabled,
  });
};

export const useGetDocumentOut = (
  page: number = 1,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.retake.document_out, page],
    queryFn: async () => {
      return await RetakeService.getDocumentOut({ page });
    },
    enabled: enabled,
  });
};

export const useRetakeSearchQuery = (
  searchParams: {
    text?: string;
    numberOrSign?: string;
    preview?: string;
    docTypeId?: string;
    orgName?: string;
    userEnter?: string;
    startIssued?: string;
    endIssued?: string;
    sortBy?: string;
    direction?: string;
    size?: number;
    page?: number;
    retaked?: boolean;
  },
  tab: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["retake-search", searchParams, tab],
    queryFn: async () => {
      if (tab === "canRetake") {
        return await RetakeService.doBasicSearchDocumentIn(searchParams);
      } else if (tab === "retook") {
        return await RetakeService.doBasicSearchRetookDocumentIn(searchParams);
      }

      throw new Error("Invalid tab");
    },
    enabled: enabled && !!searchParams,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });
};

export const useRetakeAdvancedSearchQuery = (
  searchParams: {
    numberOrSign?: string;
    preview?: string;
    docTypeId?: string;
    orgName?: string;
    userEnter?: string;
    startIssued?: string;
    endIssued?: string;
    sortBy?: string;
    direction?: string;
    size?: number;
    page?: number;
    retaked?: boolean;
  },
  tab: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["retake-advanced-search", searchParams, tab],
    queryFn: async () => {
      if (tab === "canRetake") {
        return await RetakeService.doAdvancedSearchDocumentIn(searchParams);
      } else if (tab === "retook") {
        return await RetakeService.doAdvancedSearchReTookDocumentIn(
          searchParams
        );
      }

      throw new Error("Invalid tab");
    },
    enabled: enabled && !!searchParams,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });
};

// Retake Out Search Queries
export const useRetakeOutSearchQuery = (
  searchParams: {
    q?: string;
    numberOrSign?: string;
    preview?: string;
    orgIssuedName?: string;
    numberArrival?: string;
    startIssued?: string;
    endIssued?: string;
    sortBy?: string;
    direction?: string;
    size?: number;
    page?: number;
    retaked?: boolean;
  },
  tab: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["retake-out-search", searchParams, tab],
    queryFn: async () => {
      if (tab === "canRetake") {
        return await RetakeService.doBasicSearchDocumentOut(searchParams);
      } else if (tab === "retook") {
        return await RetakeService.doBasicSearchRetookDocumentOut(searchParams);
      }

      throw new Error("Invalid tab");
    },
    enabled: enabled && !!searchParams,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });
};

export const useRetakeOutAdvancedSearchQuery = (
  searchParams: {
    numberOrSign?: string;
    preview?: string;
    orgIssuedName?: string;
    numberArrival?: string;
    startIssued?: string;
    endIssued?: string;
    sortBy?: string;
    direction?: string;
    size?: number;
    page?: number;
    retaked?: boolean;
  },
  tab: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["retake-out-advanced-search", searchParams, tab],
    queryFn: async () => {
      if (tab === "canRetake") {
        return await RetakeService.doAdvancedSearchDocumentOut(searchParams);
      } else if (tab === "retook") {
        return await RetakeService.doAdvancedSearchRetookDocumentOut(
          searchParams
        );
      }

      throw new Error("Invalid tab");
    },
    enabled: enabled && !!searchParams,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });
};
