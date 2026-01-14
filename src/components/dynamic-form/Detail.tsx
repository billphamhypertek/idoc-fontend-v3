"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import DigitalSign from "@/components/common/DigitalSign";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import type { FormField, FormRow } from "@/components/form-config/types";
import {
  CompleteButton,
  RecallButton,
  RejectButton,
  TransferHandler,
} from "@/components/room-request";
import { CalendarReviewButton } from "@/components/room-request/CalendarReviewButton";
import { TrackingButton } from "@/components/room-request/TrackingButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { PdfSignType } from "@/definitions/enums/common.enum";
import { Column } from "@/definitions/types/table.type";
import {
  useDownloadAttachmentQuery,
  useUploadFileAfterSignAppendix,
} from "@/hooks/data/form-dynamic.data";
import { useGetFormConfigDetailQuery } from "@/hooks/data/form-config.data";
import {
  useGetValueDynamicDetail,
  useUpdateValueDynamic,
} from "@/hooks/data/value-dynamic.data";
import useAuthStore from "@/stores/auth.store";
import {
  findIdByRouterPathSafe,
  isVerifierPDFOrDocx,
  saveFile,
} from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, Edit, Eye, Undo2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SignAppendixButton } from "@/components/room-request/SignAppendixButton";

const DocumentViewer = dynamic(
  () => import("@/components/common/DocumentViewer"),
  {
    ssr: false,
  }
);

// Convert API fields to FormRow structure
const convertApiFieldsToRows = (fields: any[]): FormRow[] => {
  const rows: FormRow[] = [];

  // Group fields by orderNumber
  const fieldsByOrderNumber: { [key: number]: any[] } = {};

  fields.forEach((field) => {
    const orderNumber = field.orderNumber || 1;
    if (!fieldsByOrderNumber[orderNumber]) {
      fieldsByOrderNumber[orderNumber] = [];
    }
    fieldsByOrderNumber[orderNumber].push(field);
  });

  // Convert each group to a row
  Object.keys(fieldsByOrderNumber)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((orderNumber) => {
      const fieldsInGroup = fieldsByOrderNumber[parseInt(orderNumber)];

      const formFields: FormField[] = fieldsInGroup.map((field) => {
        const inputWidth =
          typeof field.inputWidth === "string"
            ? parseFloat(field.inputWidth)
            : field.inputWidth || 100;

        // Parse JSON strings for complex fields
        let parsedOptions = field.options;
        if (field.options && typeof field.options === "string") {
          try {
            parsedOptions = JSON.parse(field.options);
          } catch (e) {
            console.warn("Failed to parse options for field:", field.name);
            parsedOptions = [];
          }
        }

        let parsedFieldConfig = field.fieldConfig;
        if (field.fieldConfig && typeof field.fieldConfig === "string") {
          try {
            parsedFieldConfig = JSON.parse(field.fieldConfig);
          } catch (e) {
            console.warn("Failed to parse fieldConfig for field:", field.name);
            parsedFieldConfig = {};
          }
        }

        return {
          id: field.id?.toString() || field.name,
          type: field.dataType as any,
          title: field.title,
          name: field.name,
          placeholder: field.placeholder,
          description: field.description,
          required: field.required,
          hidden: field.hidden,
          readonly: false,
          inputWidth: inputWidth,
          maxLength: field.maxLength,
          min: field.min,
          max: field.max,
          dateFormat: field.dateFormat,
          disableDates: field.disableDates || [],
          options: parsedOptions,
          apiId: field.apiId,
          allowMultiple: field.allowMultiple,
          acceptedTypes: field.acceptedTypes,
          linkText: field.linkText,
          linkUrl: field.linkUrl,
          linkTarget: field.linkTarget,
          fieldConfig: parsedFieldConfig,
          isSearch: field.isSearch,
          showOnList: field.showOnList,
          unique: field.unique,
          css: field.css,
          orderNumber: field.orderNumber,
          formDynamicId: field.formDynamicId,
          api: field.api,
        } as FormField;
      });

      const row: FormRow = {
        id: `row-${orderNumber}`,
        fields: formFields,
      };

      rows.push(row);
    });

  return rows;
};

interface IProps {
  type: string;
  pageType?: string;
}

export default function RequestDetailPage({ type, pageType }: IProps) {
  const params = useParams<{
    id: string;
    typeId: string;
  }>();
  const { user: userInfo } = useAuthStore();
  const id = params?.id || "";
  const typeId = params?.typeId || "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const modules = useMemo(() => {
    if (typeof window === "undefined") return [];
    const allModules = localStorage.getItem(STORAGE_KEYS.MODULES);
    return allModules ? JSON.parse(allModules) : [];
  }, []);
  const moduleId = findIdByRouterPathSafe(modules, pathname || "");

  const formLabel = useMemo(() => {
    const findModuleById = (moduleList: any[], id: number): any => {
      for (const m of moduleList) {
        if (m.id === id) return m;
        if (m.subModule && m.subModule.length > 0) {
          const found = findModuleById(m.subModule, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (!moduleId) return "Quản lý workflow";
    const currentModule = findModuleById(modules, moduleId);
    if (currentModule?.parentId) {
      const parentModule = findModuleById(modules, currentModule.parentId);
      return parentModule?.name?.trim() || "Quản lý workflow";
    }
    return currentModule?.name?.trim() || "Quản lý workflow";
  }, [modules, moduleId]);

  // Fetch form schema and detail data
  const { data: detailRequest } = useGetValueDynamicDetail(Number(id));
  const checkInfo = detailRequest?.data?.checkInfo || {};
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { data: formDetail } = useGetFormConfigDetailQuery(
    Number(checkInfo?.checkUpdate?.formId || 0)
  );
  const [apiFields, setApiFields] = useState<FormRow[]>([]);
  // Convert API fields to rows
  useEffect(() => {
    if (detailRequest?.data?.formDynamic?.fields) {
      const rows = convertApiFieldsToRows(
        detailRequest?.data?.formDynamic?.fields
      );
      setApiFields(rows);
    }
  }, [detailRequest?.data?.formDynamic?.fields]);

  const processDefaultValues = (data: any, fields?: any[]) => {
    if (!data) return {};

    const values: Record<string, any> = { ...data };

    const fieldsToUse = fields;

    if (!Array.isArray(fieldsToUse)) return values;

    fieldsToUse.forEach((field: any) => {
      if (field.dataType !== "TABLE" || !values[field.name]) return;

      const tableValue = values[field.name];

      // Parse tableColumns
      let tableColumns: any[] = [];
      if (field.fieldConfig) {
        try {
          const parsed =
            typeof field.fieldConfig === "string"
              ? JSON.parse(field.fieldConfig)
              : field.fieldConfig;
          tableColumns = parsed?.tableColumns || [];
        } catch (e) {
          console.warn("Parse table fieldConfig failed", e);
        }
      }

      const normalizeRow = (row: any) => {
        const newRow: any = {};

        Object.keys(row).forEach((key) => {
          const value = row[key];

          // ✅ QUY TẮC SỐ 1: server trả array → giữ nguyên
          if (Array.isArray(value)) {
            newRow[key] = value;
            return;
          }

          // checkbox
          if (value === true || value === false) {
            newRow[key] = value;
            return;
          }

          // fallback: scalar → convert thành array
          newRow[key] = value !== undefined && value !== null ? [value] : [];
        });

        return newRow;
      };

      if (Array.isArray(tableValue)) {
        values[field.name] = {
          rows: tableValue.map(normalizeRow),
        };
      } else if (tableValue?.rows) {
        values[field.name] = {
          rows: tableValue.rows.map(normalizeRow),
        };
      }
    });

    return values;
  };

  const defaultValues = useMemo(() => {
    const values = processDefaultValues(
      detailRequest?.data?.data,
      detailRequest?.data?.formDynamic?.fields
    );
    return values;
  }, [
    detailRequest?.data?.data,
    detailRequest?.data?.attachment,
    detailRequest?.data?.formDynamic?.fields,
  ]);

  const updateFormRows = useMemo(() => {
    if (formDetail?.fields) {
      return convertApiFieldsToRows(formDetail.fields);
    }
    return [];
  }, [formDetail?.fields]);

  const updateDefaultValues = useMemo(() => {
    return processDefaultValues(detailRequest?.data?.data, formDetail?.fields);
  }, [detailRequest?.data?.data, formDetail?.fields]);

  const updateMutation = useUpdateValueDynamic();
  const processColumnValue = (colValue: any, columnType?: string) => {
    if (columnType === "checkbox") {
      return Boolean(colValue);
    } else {
      return Array.isArray(colValue) ? colValue : [colValue || ""];
    }
  };

  const handleTransferSuccess = async () => {
    await router.back();
    ToastUtils.success("Chuyển xử lý phiếu thành công");
  };
  const handleRecallSuccess = async () => {
    await router.back();
    ToastUtils.success("Thu hồi phiếu thành công");
  };
  const handleRejectSuccess = async () => {
    await router.back();
    ToastUtils.success("Từ chối phiếu thành công");
  };
  const handleCompleteSuccess = async () => {
    await router.back();

    ToastUtils.success("Hoàn thành phiếu thành công");
  };
  const handleCalendarReviewSuccess = async () => {
    await router.back();
    ToastUtils.success("Duyệt lịch phiếu thành công");
  };
  const handleSignAppendixSuccess = async () => {
    uploadAfterSign.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.valueDynamic.detail, Number(id)],
        });

        ToastUtils.success("Ký xác nhận thành công");
      },
    });
  };
  const headerComponent = useMemo(() => {
    return (
      <BreadcrumbNavigation
        items={[
          {
            href: `/request/${typeId}/${pageType}`,
            label: formLabel,
          },
        ]}
        currentPage="Chi tiết phiếu xin"
      />
    );
  }, [pageType, formLabel, typeId]);

  const goToUpdate = () => {
    router.push(`/request/${typeId}/${pageType}/update/${id}`);
  };
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("");
  const downloadAttachmentMutation =
    useDownloadAttachmentQuery(downloadFileName);
  const uploadAfterSign = useUploadFileAfterSignAppendix(id);

  // Prepare files for DocumentViewer
  const pdfFiles = useMemo(
    () =>
      detailRequest?.data?.attachment
        ?.filter((att: any) => isVerifierPDFOrDocx(att))
        .map((att: any) => ({
          id: att.id,
          name: att.name,
          displayName: att.displayName,
          sign: att.sign,
          _timestamp: Date.now(),
          fileType: "vehicle" as const,
        })) || [],
    [detailRequest?.data?.attachment]
  );
  const pdfFilesKey = useMemo(() => {
    return pdfFiles.map((f: any) => `${f.id}-${f._timestamp}`).join(",");
  }, [pdfFiles]);

  useEffect(() => {
    if (pdfFiles && pdfFiles.length > 0) {
      const current = selectedFile
        ? pdfFiles.find((f: any) => f.name === selectedFile.name)
        : null;
      if (current) {
        if (current !== selectedFile) setSelectedFile(current);
      } else {
        setSelectedFile(pdfFiles[0]);
      }
    }
  }, [pdfFiles]);
  const handleDownloadFile = async (file: any) => {
    try {
      const fileName = file ? file.name : "";
      if (fileName) {
        setDownloadFileName(fileName);
        setTimeout(() => {
          downloadAttachmentMutation.mutate(undefined, {
            onSuccess: (data) => {
              saveFile(fileName, data);
            },
            onError: (error) => {
              console.error("Download error:", error);
              ToastUtils.error("Tải file thất bại");
            },
          });
        }, 0);
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(
    null
  );
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyFormRows, setHistoryFormRows] = useState<FormRow[]>([]);

  const handleViewHistory = (item: any) => {
    setSelectedHistoryItem(item);
    if (item.formDynamic?.fields) {
      const rows = convertApiFieldsToRows(item.formDynamic.fields);
      setHistoryFormRows(rows);
    }
    setIsHistoryDialogOpen(true);
  };

  const handleFileChange = (file: any) => {
    setSelectedFile(file);
  };

  const historyColumns: Column<any>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (_, index) => index + 1,
        className: "w-[50px] text-center",
      },
      {
        header: "Tên form",
        accessor: (item) => item.formDynamic?.name || "Form cập nhật",
      },
      {
        header: "Thao tác",
        type: "actions",
        className: "w-[100px]",
        renderActions: (item) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewHistory(item)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    []
  );
  // const isLead = userInfo?.roles === "LEAD" ?? false;
  const isLead = false;
  const notAllowedSignType = isLead
    ? [PdfSignType.COMMENT, PdfSignType.ISSUED, PdfSignType.COPY]
    : [
        PdfSignType.APPENDIX,
        PdfSignType.COMMENT,
        PdfSignType.ISSUED,
        PdfSignType.COPY,
      ];

  const fileColumns: Column<any>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (_: any, index: number) => index + 1,
        className: "w-[60px] text-center",
      },
      {
        header: "Tên file",
        accessor: (item: any) => (
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => handleFileChange(item)}
          >
            {item.displayName || item.name}
          </button>
        ),
      },
      {
        header: "Ký số",
        className: "w-[120px] text-center",
        accessor: (file) => {
          return checkInfo?.checkSign ? (
            <DigitalSign
              fileId={file.id}
              fileName={file.name}
              skips={notAllowedSignType}
              docNumber={"001"} //temp hardcode
              attachmentType={Constant.ATTACHMENT_DOWNLOAD_TYPE.DYNAMIC_FORM}
              callback={async () => {
                // Invalidate detail query when digital sign succeeds
                await queryClient.invalidateQueries({
                  queryKey: [queryKeys.valueDynamic.detail, Number(id)],
                });
                ToastUtils.success("Ký số thành công");
              }}
            />
          ) : null;
        },
      },
      {
        header: "Thao tác",
        type: "actions",
        className: "w-[120px] text-center",
        renderActions: (item: any) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadFile(item)}
          >
            <DownloadIcon className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    [id, checkInfo]
  );

  const handleSubmit = async (values: Record<string, any>) => {
    console.log("Dynamic form submit:", values);

    try {
      const dynamicFormId = checkInfo?.checkUpdate?.formId;

      if (!dynamicFormId) {
        ToastUtils.error("Không tìm thấy ID của form");
        return;
      }

      const dataObject: Record<string, any> = {};
      const originalData = detailRequest?.data?.data || {};

      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File || value instanceof FileList) {
          return;
        }
        if (typeof value === "object" && value instanceof File) {
          return;
        } else if (
          typeof value === "object" &&
          value !== null &&
          value.rows &&
          Array.isArray(value.rows)
        ) {
          const field = formDetail?.fields?.find((f: any) => f.name === key);
          if (field && field.dataType === "TABLE") {
            let tableColumns: any[] = [];
            if (field.fieldConfig) {
              try {
                const parsedConfig =
                  typeof field.fieldConfig === "string"
                    ? JSON.parse(field.fieldConfig)
                    : field.fieldConfig;
                tableColumns = parsedConfig?.tableColumns || [];
              } catch (e) {
                console.warn("Failed to parse table fieldConfig:", e);
              }
            }

            const convertedRows = value.rows.map((row: any) => {
              const newRow: any = {};

              Object.entries(row).forEach(([rowKey, colValue]) => {
                const isNumericKey = !isNaN(Number(rowKey));

                if (isNumericKey && tableColumns.length > 0) {
                  const colIndex = Number(rowKey);
                  const column = tableColumns[colIndex];
                  if (column && column.name) {
                    newRow[column.name] = processColumnValue(
                      colValue,
                      column.type
                    );
                  }
                } else {
                  const column = tableColumns.find(
                    (col: any) => col.name === rowKey
                  );
                  newRow[rowKey] = processColumnValue(colValue, column?.type);
                }
              });

              return newRow;
            });
            dataObject[key] = convertedRows;
          } else {
            dataObject[key] = value;
          }
        } else if (Array.isArray(value)) {
          dataObject[key] = value;
        } else if (typeof value === "object" && value !== null && value.name) {
          dataObject[key] = originalData[key] || value.name;
        } else if (value === null || value === undefined) {
          dataObject[key] = value;
        } else {
          dataObject[key] = value || null;
        }
      });

      Object.entries(originalData).forEach(([key, value]) => {
        if (!(key in dataObject) && Array.isArray(value)) {
          const field = formDetail?.fields?.find((f: any) => f.name === key);
          if (field && field.dataType === "FILE") {
            dataObject[key] = value;
          }
        }
      });

      await updateMutation.mutateAsync({
        id: Number(id),
        formId: Number(dynamicFormId),
        data: dataObject,
      });
      ToastUtils.success("Cập nhật thành công");
      setIsUpdateDialogOpen(false);
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.valueDynamic.detail, Number(id)],
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      ToastUtils.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  return (
    <div className="pl-4 pr-4 space-y-4">
      {headerComponent}
      <div className="flex justify-end gap-2">
        <TrackingButton trackingId={Number(id)} />
        {checkInfo.checkUpdate && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-9 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-blue-600 disabled:bg-gray-400 disabled:text-white disabled:border-gray-400"
            onClick={() => {
              if (checkInfo.checkUpdate?.formId) {
                setIsUpdateDialogOpen(true);
              } else {
                goToUpdate();
              }
            }}
          >
            <Edit className="w-4 h-4" />
            {checkInfo.checkUpdate?.nameButton || "Sửa phiếu"}
          </Button>
        )}
        {checkInfo?.checkTransfer && (
          <TransferHandler
            selectedItemId={Number(id) || null}
            currentNode={checkInfo.nodeId}
            formType={type}
            disabled={false}
            onSuccess={handleTransferSuccess}
            formId={detailRequest?.data?.formDynamic?.id}
          />
        )}

        {checkInfo?.checkRecall && (
          <RecallButton
            valueIds={[Number(id)]}
            disabled={false}
            onSuccess={handleRecallSuccess}
          />
        )}

        {checkInfo?.checkReject && (
          <RejectButton
            valueIds={[Number(id)]}
            disabled={false}
            onSuccess={handleRejectSuccess}
          />
        )}
        {checkInfo?.checkCalendarReview && (
          <CalendarReviewButton
            valueIds={[Number(id)]}
            onSuccess={handleCalendarReviewSuccess}
          />
        )}
        {checkInfo?.checkAppendix && (
          <SignAppendixButton
            callback={handleSignAppendixSuccess}
            file={pdfFiles[0]}
          />
        )}

        {checkInfo?.checkDone && (
          <CompleteButton
            valueIds={[Number(id)]}
            disabled={false}
            onSuccess={handleCompleteSuccess}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 h-9 px-2 text-xs"
          onClick={() => router.back()}
        >
          <Undo2 className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {detailRequest?.data?.name ||
              detailRequest?.data?.formDynamic?.name ||
              "Chi tiết"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicForm
            rows={apiFields}
            onSubmit={() => {}}
            defaultValues={defaultValues}
            viewOnly={true}
            isSubmitting={false}
            submitButtonText="Cập nhật"
            showActionButtons={false}
          />
        </CardContent>
      </Card>

      {/* Attachments */}
      {pdfFiles && pdfFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Tài liệu đính kèm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={fileColumns}
              dataSource={pdfFiles}
              showPagination={false}
            />
          </CardContent>
        </Card>
      )}

      {selectedFile?.id && pdfFiles && pdfFiles.length > 0 && (
        <DocumentViewer
          key={`${selectedFile.id}-${pdfFilesKey}`}
          files={pdfFiles}
          selectedFile={selectedFile}
          documentTitle="Tài liệu đính kèm"
          handleDownloadFile={handleDownloadFile}
          onFileChange={handleFileChange}
          fileType={Constant.ATTACHMENT_DOWNLOAD_TYPE.DYNAMIC_FORM}
        />
      )}

      {/* History Card */}
      {/* {detailRequest?.data?.historyDynamics &&
        detailRequest.data.historyDynamics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Lịch sử cập nhật
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table
                columns={historyColumns}
                dataSource={detailRequest.data.historyDynamics}
                showPagination={true}
                itemsPerPage={5}
              />
            </CardContent>
          </Card>
        )} */}

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedHistoryItem?.formDynamic?.name || "Chi tiết lịch sử"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DynamicForm
              rows={historyFormRows}
              onSubmit={() => {}}
              defaultValues={selectedHistoryItem?.data || {}}
              viewOnly={true}
              isSubmitting={false}
              submitButtonText="Đóng"
              showActionButtons={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {checkInfo.checkUpdate?.nameButton || "Cập nhật"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DynamicForm
              rows={updateFormRows}
              onSubmit={handleSubmit}
              defaultValues={updateDefaultValues}
              isSubmitting={updateMutation.isPending}
              submitButtonText="Cập nhật"
              showActionButtons={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
