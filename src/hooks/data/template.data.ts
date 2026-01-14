import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TemplateService,
  type TemplateResponse,
} from "@/services/template.service";

export type TemplateFilter = {
  fileName?: string; // "" => ?fileName=
  type: string; // "" => ?type=
  page: number; // 1-based
  size: number;
  sortBy?: string;
  totalRecord?: number;
};

// LIST
export function useTemplateList(filter: TemplateFilter, enabled = true) {
  return useQuery<TemplateResponse>({
    queryKey: ["templates", filter],
    queryFn: () => {
      const params: any = {
        page: filter.page,
        size: filter.size,
        sortBy: filter.sortBy ?? "",
        totalRecord: filter.totalRecord ?? 0,
        type: filter.type ?? "", // "" -> ?type=
        fileName: filter.fileName ?? "", // "" -> ?fileName=
      };
      return TemplateService.getAll(params as any);
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}

// ADD
export function useAddTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { files: File[]; type: string }) =>
      TemplateService.addTemplate(args.files, args.type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

// DELETE
export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { type: string; id: string | number }) =>
      TemplateService.deleteTemplate(args.type, args.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

// DOWNLOAD
export function useTemplateDownload() {
  return async (name: string, downloadAs?: string) => {
    const blob = await TemplateService.downloadFile(name);
    const url = URL.createObjectURL(blob as any);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadAs || name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
}
