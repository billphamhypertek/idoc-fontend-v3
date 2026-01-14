"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SelectCustom from "@/components/common/SelectCustom";
import { X } from "lucide-react";
import { CustomDatePicker } from "@/components/ui/calendar";
import { useGetCategoryWithCode } from "@/hooks/data/task.data";
import { Constant } from "@/definitions/constants/constant";
import { getUserInfo } from "@/utils/token.utils";
import {
  useGetListListTaskAssigner,
  useUpdateDeclareTask,
} from "@/hooks/data/taskv2.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { formatDateYMD } from "@/utils/datetime.utils";
import { listJobSchema, ListJobFormData } from "@/schemas/list-job.schema";

interface ListJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
  onSuccess?: () => void;
  isViewMode?: boolean;
}

export default function ListJobModal({
  open,
  onOpenChange,
  editData,
  onSuccess,
  isViewMode = false,
}: ListJobModalProps) {
  const userInfo = JSON.parse(getUserInfo() || "{}");
  const { data: complexityData } = useGetCategoryWithCode(
    Constant.CATEGORY_TYPE_CODE.LEVEL_OF_COMPLEXITY
  );

  const { data: jobAssignerList } = useGetListListTaskAssigner();

  const updateMutation = useUpdateDeclareTask();

  const form = useForm<ListJobFormData>({
    resolver: zodResolver(listJobSchema),
    mode: "onChange",
    defaultValues: {
      taskName: "",
      description: "",
      complexityId: null,
      assignerId: null,
      handlerId: null,
      startDate: "",
      endDate: "",
    },
  });

  const startDate = form.watch("startDate");

  const toInputDate = (value?: string | number | Date | null) => {
    if (!value) return "";
    return formatDateYMD(new Date(value));
  };

  const getComplexityIdFromName = (name?: string | null) => {
    if (!name || !complexityData) return null;
    const found = complexityData.find((item: any) => item.name === name);
    return found ? Number(found.id) : null;
  };

  const getAssignerIdFromName = (name?: string | null) => {
    if (!name || !jobAssignerList) return null;
    const found = jobAssignerList.find((item: any) => item.fullName === name);
    return found ? Number(found.id) : null;
  };

  useEffect(() => {
    if (open && editData) {
      const complexityId =
        editData.complexityId ??
        getComplexityIdFromName(editData.complexityName);
      const assignerId =
        editData.assignerId ?? getAssignerIdFromName(editData.assignerName);

      form.reset({
        taskName: editData.taskName || "",
        description: editData.description || "",
        complexityId: complexityId,
        assignerId: assignerId,
        handlerId: userInfo.id || null,
        startDate: toInputDate(editData.startDate),
        endDate: toInputDate(editData.endDate),
      });
    }
  }, [open, editData, form, complexityData, jobAssignerList]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: ListJobFormData) => {
    try {
      const dataToSend = {
        taskName: data.taskName,
        description: data.description,
        complexityId: data.complexityId,
        startDate: data.startDate,
        endDate: data.endDate,
        assignerId: data.assignerId,
        handlerId: userInfo.id || null,
      };

      if (editData?.id) {
        await updateMutation.mutateAsync({
          id: editData.id,
          data: dataToSend,
        });
        ToastUtils.success("Cập nhật công việc thành công.");
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi cập nhật công việc.");
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] flex flex-col [&>button]:hidden px-6 py-4"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {isViewMode ? "Chi tiết công việc" : "Sửa công việc"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 px-2">
              <FormField
                control={form.control}
                name="taskName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên công việc <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tên công việc"
                        maxLength={1000}
                        disabled={isViewMode}
                        className={
                          isViewMode
                            ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mô tả <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập mô tả công việc"
                        rows={3}
                        maxLength={1000}
                        disabled={isViewMode}
                        className={
                          isViewMode
                            ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="complexityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mức độ phức tạp <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SelectCustom
                          options={[
                            { label: "--- Chọn ---", value: "all" },
                            ...(complexityData?.map((item: any) => ({
                              label: item.name,
                              value: String(item.id),
                            })) || []),
                          ]}
                          value={field.value?.toString() || ""}
                          onChange={(value) => {
                            if (value === "all" || value === "" || !value) {
                              field.onChange(null);
                            } else {
                              field.onChange(Number(value));
                            }
                          }}
                          placeholder="--- Chọn ---"
                          contentClassName="w-[var(--radix-select-trigger-width)]"
                          disabled={isViewMode}
                          className={
                            isViewMode
                              ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Người giao <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={
                            editData?.assignerName ||
                            jobAssignerList?.find(
                              (item: any) => item.id === field.value
                            )?.fullName ||
                            ""
                          }
                          disabled
                          className="bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ngày giao việc <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date) => {
                            field.onChange(toInputDate(date));
                          }}
                          placeholder="dd/mm/yyyy"
                          readOnly={isViewMode}
                          className={
                            isViewMode
                              ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hạn xử lý <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          selected={field.value ? new Date(field.value) : null}
                          onChange={(date) => {
                            field.onChange(toInputDate(date));
                          }}
                          placeholder="dd/mm/yyyy"
                          min={startDate || undefined}
                          readOnly={isViewMode}
                          className={
                            isViewMode
                              ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>
                  Người tạo <span className="text-red-500">*</span>
                </FormLabel>
                <Input
                  value={editData?.creatorName || ""}
                  disabled
                  className="bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-4 border-t flex-shrink-0 mt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              {!isViewMode && (
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={updateMutation.isPending}
                >
                  Cập nhật
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
