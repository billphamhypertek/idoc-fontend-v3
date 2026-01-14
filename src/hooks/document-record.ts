import { useMutation, useQuery } from "@tanstack/react-query";
import { DocumentRecordService } from "@/services/document-record.service";
import type {
  Heading,
  RawTreeNode,
  SearchInitData,
} from "@/definitions/types/document-record";
import { queryKeys } from "@/definitions/constants/queryKey.constants";

export function useHeadingSearchInit() {
  return useQuery<SearchInitData>({
    queryKey: [queryKeys.documentRecord.headingInit],
    queryFn: () => DocumentRecordService.getSearchInit(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeadingFolderTree(params: Record<string, string>) {
  return useQuery<RawTreeNode[]>({
    queryKey: [queryKeys.documentRecord.headingTree, params],
    queryFn: () => DocumentRecordService.getHeadingFolderTree(params),
    enabled: true,
  });
}

export function useHeadingCrud() {
  const add = useMutation({
    mutationFn: (payload: Heading) => DocumentRecordService.addHeading(payload),
  });
  const edit = useMutation({
    mutationFn: (payload: Partial<Heading> & { id: string | number }) =>
      DocumentRecordService.editHeading(payload),
  });
  const remove = useMutation({
    mutationFn: (id: string) => DocumentRecordService.deleteHeading(id),
  });

  return { add, edit, remove };
}
