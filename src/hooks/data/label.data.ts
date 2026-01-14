import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label, LabelService } from "@/services/label.service";
import { queryKeys } from "@/definitions";

export const useListTagUnpageQuery = () => {
  return useQuery({
    queryKey: [queryKeys.tags.unpage],
    queryFn: () => LabelService.listTagUnpage(),
  });
};

export const useSearchTagQuery = (text: string) => {
  return useQuery({
    queryKey: [queryKeys.tags.search, text],
    queryFn: () => LabelService.searchTag(text),
    enabled: !!text && text.trim().length > 0,
  });
};

export const useListObjectQuery = (
  tagId: string | null,
  page: number,
  keyword: string,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: [queryKeys.objects.root, tagId, page, keyword, pageSize],
    queryFn: () => {
      if (!tagId) throw new Error("Tag ID is required");
      return LabelService.listObject(tagId, page, keyword, pageSize);
    },
    enabled: !!tagId,
  });
};

export const useAddTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: string) => LabelService.addTag(value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tags.unpage] });
    },
  });
};

export const useUpdateTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tag: Label) => LabelService.updateTag(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tags.unpage] });
    },
  });
};

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => LabelService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.tags.unpage] });
    },
  });
};

export const useRemoveObjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tagId,
      objId,
      type,
    }: {
      tagId: string;
      objId: string;
      type: string;
    }) => LabelService.removeObject(tagId, objId, type),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.objects.root, variables.tagId],
      });
    },
  });
};

export const useAssignTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tag: any) => LabelService.assignTag(tag),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.objects.root, variables.tagId],
      });
    },
  });
};

export const useListObjectByDocId = (
  documentId?: string | null,
  page: number = 1,
  keyword: string = "",
  pageSize?: number,
  type: string = "VAN_BAN_DEN"
) => {
  return useQuery({
    queryKey: [
      queryKeys.objects.root,
      "byDocId",
      documentId,
      page,
      keyword,
      pageSize,
      type,
    ],
    queryFn: () =>
      LabelService.listObject(documentId!, page, keyword, pageSize, type),
    enabled: !!documentId,
  });
};

export const useListObjectTagQuery = (
  documentId?: string | null,
  type: string = "VAN_BAN_DEN"
) => {
  return useQuery({
    queryKey: [queryKeys.objects.root, "byDocId", documentId, type],
    queryFn: () => LabelService.listObjectTag(documentId!, type),
    enabled: !!documentId,
  });
};
