import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DocumentRecordService } from "@/services/document-record.service";
import { CategoryService } from "@/services/category-service";
import { queryKeys } from "@/definitions";
import { ToastUtils } from "@/utils/toast.utils";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
};

export const useGetHstlContainDocId = (
  documentId?: string | null,
  docType: string = "VAN_BAN_DEN"
) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentRecord.hstl, documentId, docType],
    queryFn: () =>
      DocumentRecordService.getHstlContainDocId(documentId!, docType),
    enabled: !!documentId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetListFolder = (type?: string, enabled = true) => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentRecord.listFolder, type],
    queryFn: () => DocumentRecordService.getListFolder(type),
    enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetListByFolderIdNew = (
  folderId: string | number | "",
  enabled = true
) => {
  return useQuery<any>({
    queryKey: [queryKeys.documentRecord.listByFolderIdNew, folderId],
    queryFn: () => DocumentRecordService.getListByFolderIdNew(String(folderId)),
    enabled,
    ...COMMON_QUERY_OPTS,
  });
};
export const useGetListFont = (page: number) => {
  return useQuery({
    queryKey: [
      queryKeys.documentRecord.root,
      queryKeys.documentRecord.fontList,
      page,
    ],
    queryFn: () => DocumentRecordService.getListFont(page),
    enabled: page > 0,
    ...COMMON_QUERY_OPTS,
  });
};
export const useAddFont = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: any) => DocumentRecordService.AddFont(params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          queryKeys.documentRecord.root,
          queryKeys.documentRecord.fontList,
        ],
      });
      ToastUtils.success("", "Thêm phông thành công");
    },

    onError: () => {
      ToastUtils.error("", "Thêm phông thất bại");
    },
  });
};
export const useUpdateFont = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: any) => DocumentRecordService.updateFont(params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          queryKeys.documentRecord.root,
          queryKeys.documentRecord.fontList,
        ],
      });
      ToastUtils.success("", "Cập nhật phông thành công");
    },

    onError: () => {
      ToastUtils.error("", "Cập nhật phông thất bại");
    },
  });
};
export const useDeleteFont = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DocumentRecordService.DeleteFont(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          queryKeys.documentRecord.root,
          queryKeys.documentRecord.fontList,
        ],
      });
      ToastUtils.success("", "Xóa phông thành công");
    },

    onError: () => {
      ToastUtils.error("", "Xóa phông thất bại");
    },
  });
};

export const useGetDetailFont = (id: string) => {
  return useQuery({
    queryKey: [
      queryKeys.documentRecord.root,
      queryKeys.documentRecord.fontDetail,
      id,
    ],
    queryFn: () => DocumentRecordService.getDetailFont(id),
    enabled: !!id,
    ...COMMON_QUERY_OPTS,
  });
};

export const useDoLoadHSCQ = (
  tabIndex: number,
  searchParams: Record<string, any>,
  enabled = true
) => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.loadHSCQ, tabIndex, searchParams],
    queryFn: () => DocumentRecordService.doLoadHSCQ(tabIndex, searchParams),
    enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetAllOrgAndSub = (orgId: string | number, enabled = true) => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.allOrgAndSub, orgId],
    queryFn: () => DocumentRecordService.getAllOrgAndSub(orgId),
    enabled: !!orgId && enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetListHSCV = (tab: number, page: number, size: number) => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.hscv, tab, page, size],
    queryFn: () => DocumentRecordService.doLoadHSCV(tab, page, size),
    enabled: true,
    ...COMMON_QUERY_OPTS,
  });
};

export const useCreateWorkProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, approverId }: { data: any; approverId: string }) =>
      DocumentRecordService.doCreateFolder(data, approverId),

    onSuccess: (result, { data, approverId }) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listRootFolder],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.dataDetailByFolderId],
        refetchType: "active",
      });

      queryClient.refetchQueries({
        queryKey: [queryKeys.documentRecord.listRootFolder],
        type: "active",
      });

      ToastUtils.success("", "Tạo hồ sơ công việc thành công");
    },

    onError: (error) => {
      console.error("Lỗi tạo hồ sơ:", error);
      ToastUtils.error("", "Tạo hồ sơ công việc thất bại");
    },
  });
};

export const useUpdateWorkProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, approverId }: { data: any; approverId: string }) =>
      DocumentRecordService.doUpdateFolder(data, approverId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.hscv],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.dataDetailByFolderId],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listRootFolder],
        refetchType: "active",
      });
      ToastUtils.success("", "Cập nhật hồ sơ công việc thành công");
    },

    onError: () => {
      ToastUtils.error("", "Cập nhật hồ sơ công việc thất bại");
    },
  });
};

export const useGetHeadingTree = () => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.headingTree],
    queryFn: () => DocumentRecordService.getHeadingTree(),
    enabled: true,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetMaintenancePeriods = () => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.maintenancePeriods],
    queryFn: () => CategoryService.getCategoriesByCode("THHS"),
    enabled: true,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetApprovers = () => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.approvers],
    queryFn: () =>
      DocumentRecordService.getUsersByOrgWithAuthority("2", "DUYET_HOSO"),
    enabled: true,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetListVBByFolderId = (
  folderId: string,
  size: number = 10,
  page: number = 1,
  enabled = true
) => {
  return useQuery<any>({
    queryKey: [queryKeys.documentRecord.listVB, folderId, size, page],
    queryFn: () =>
      DocumentRecordService.doLoadFullDetailFolder(folderId, size, page),
    enabled: enabled && !!folderId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetAllDocuments = (page: number = 0, enabled = true) => {
  return useQuery<any>({
    queryKey: [queryKeys.documentRecord.allDocuments, page],
    queryFn: () => DocumentRecordService.getAllDocuments(page),
    enabled: enabled && page >= 0,
    ...COMMON_QUERY_OPTS,
  });
};

export const useAddDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, document }: { folderId: string; document: any }) =>
      DocumentRecordService.doAddDocument(folderId, document),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listVB],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.hscv],
      });
      ToastUtils.success("", "Thêm tài liệu thành công");
    },

    onError: () => {
      ToastUtils.error("", "Thêm tài liệu thất bại");
    },
  });
};

export const useAddDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      documents,
    }: {
      folderId: string;
      documents: any[];
    }) => DocumentRecordService.doAddDocuments(folderId, documents),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listVB],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.hscv],
      });
      ToastUtils.success("", "Thêm tài liệu thành công");
    },

    onError: () => {
      ToastUtils.error("", "Thêm tài liệu thất bại");
    },
  });
};

export const useAddExistingDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      documentId,
    }: {
      folderId: string;
      documentId: string;
    }) => DocumentRecordService.doAddExistingDocument(folderId, documentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listVB],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.hscv],
      });
      ToastUtils.success("", "Thêm tài liệu thành công");
    },

    onError: () => {
      ToastUtils.error("", "Thêm tài liệu thất bại");
    },
  });
};

export const useDeleteWorkProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      id,
      iconType,
    }: {
      folderId: string;
      id: string;
      iconType: string;
    }) => DocumentRecordService.doDelete(folderId, id, iconType),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.hscv],
      });
      ToastUtils.success("", "Xoá hồ sơ thành công!");
    },

    onError: () => {
      ToastUtils.error("", "Xóa hồ sơ thất bại");
    },
  });
};

export const useListRootFolder = (type?: string) => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.listRootFolder, type],
    queryFn: () => DocumentRecordService.getListFolder(type),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
};

export const useDataDetailByFolderId = (
  folderId: string,
  enabled = true,
  type?: string
) => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.dataDetailByFolderId, folderId, type],
    queryFn: () => {
      return DocumentRecordService.getDataDetailByFolderId(folderId, type);
    },
    enabled: enabled,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetListShare = (folderId: string, enabled = true) => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.listShare, folderId],
    queryFn: () => DocumentRecordService.getListShare(folderId),
    enabled: enabled && !!folderId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetFolderDetailById = (folderId: string, enabled = true) => {
  return useQuery({
    queryKey: [queryKeys.documentRecord.folderDetailById, folderId],
    queryFn: () => DocumentRecordService.getFolderDetailById(folderId),
    enabled: enabled && !!folderId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useFinishHSCV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) =>
      DocumentRecordService.doFinishHSCV(folderId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.hscv],
      });
      ToastUtils.success("", "Hồ sơ chuyển sang xét duyệt thành công!");
    },

    onError: () => {
      ToastUtils.error("", "Kết thúc hồ sơ thất bại");
    },
  });
};

export const useAddShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      shareData: {
        folderId: string;
        userId: string;
        permission: string;
      }[]
    ) => DocumentRecordService.addShare(shareData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listShare],
      });
      ToastUtils.success("", "Chia sẻ tài liệu thành công");
    },

    onError: () => {
      ToastUtils.error("", "Chia sẻ tài liệu thất bại");
    },
  });
};

export const useStopShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => DocumentRecordService.stopShare(folderId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listShare],
      });
      ToastUtils.success("", "Dừng chia sẻ thành công");
    },

    onError: () => {
      ToastUtils.error("", "Dừng chia sẻ thất bại");
    },
  });
};

export const useSendToHSCV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      userId,
      maintenance,
    }: {
      folderId: string;
      userId: string;
      maintenance: string;
    }) => DocumentRecordService.sendToHSCV(folderId, userId, maintenance),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.dataDetailByFolderId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentRecord.listRootFolder],
      });
      ToastUtils.success("", "Di chuyển sang HSCV thành công");
    },

    onError: () => {
      ToastUtils.error("", "Di chuyển sang HSCV thất bại");
    },
  });
};
