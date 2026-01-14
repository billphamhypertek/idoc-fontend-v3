"use client";

import { useState, useEffect } from "react";
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
import {
  selfDeclareTaskSchema,
  SelfDeclareFormData,
} from "@/schemas/self-declare.schema";
import {
  useGetCategoryWithCode,
  useGetJobAssignerList,
} from "@/hooks/data/task.data";
import { Constant } from "@/definitions/constants/constant";
import { getUserInfo } from "@/utils/token.utils";
import { CustomDatePicker } from "@/components/ui/calendar";
import {
  useGetListListTaskAssigner,
  useCreateDeclareTask,
  useUpdateDeclareTask,
} from "@/hooks/data/taskv2.data";
import { useGetUserByOrgId } from "@/hooks/data/watch-list.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { formatDateYMD } from "@/utils/datetime.utils";

interface SelfDeclareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
  onSuccess?: () => void;
}

export default function SelfDeclareModal({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: SelfDeclareModalProps) {
  const userInfo = JSON.parse(getUserInfo() || "{}");
  const { data: complexityData } = useGetCategoryWithCode(
    Constant.CATEGORY_TYPE_CODE.LEVEL_OF_COMPLEXITY
  );

  const { data: jobAssignerList } = useGetListListTaskAssigner();
  const { data: userHandlerList } = useGetUserByOrgId(userInfo.org);

  const createMutation = useCreateDeclareTask();
  const updateMutation = useUpdateDeclareTask();

  const form = useForm<SelfDeclareFormData>({
    resolver: zodResolver(selfDeclareTaskSchema),
    mode: "onChange", // Validate khi onChange
    defaultValues: {
      taskName: "",
      description: "",
      complexityId: null,
      assignerId: null,
      handlerId: userInfo.id || null,
      startDate: "",
      endDate: "",
    },
  });

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
        handlerId: editData.handlerId || userInfo.id || null,
        startDate: toInputDate(editData.startDate),
        endDate: toInputDate(editData.endDate),
      });
    } else if (open && !editData) {
      form.reset({
        taskName: "",
        description: "",
        complexityId: null,
        assignerId: null,
        handlerId: userInfo.id || null,
        startDate: "",
        endDate: "",
      });
    }
  }, [open, editData, form, userInfo.id, complexityData, jobAssignerList]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: SelfDeclareFormData) => {
    try {
      const dataToSend = {
        taskName: data.taskName,
        description: data.description,
        complexityId: data.complexityId,
        startDate: data.startDate,
        endDate: data.endDate,
        assignerId: data.assignerId,
        handlerId: data.handlerId,
      };

      if (editData?.id) {
        await updateMutation.mutateAsync({
          id: editData.id,
          data: dataToSend,
        });
        ToastUtils.success("Cập nhật công việc thành công.");
      } else {
        await createMutation.mutateAsync(dataToSend);
        ToastUtils.success("Tạo công việc thành công.");
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      ToastUtils.error(
        editData?.id
          ? "Có lỗi xảy ra khi cập nhật công việc."
          : "Có lỗi xảy ra khi tạo công việc."
      );
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {editData?.id ? "Sửa công việc" : "Tự Khai Công Việc"}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tên công việc */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Mức độ phức tạp */}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Người giao */}
              <FormField
                control={form.control}
                name="assignerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Người giao <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SelectCustom
                        options={[
                          { label: "--- Chọn người giao ---", value: "all" },
                          ...(jobAssignerList?.map((item: any) => ({
                            label: item.fullName + " --- " + item.positionName,
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
                        placeholder="--- Chọn người giao ---"
                        contentClassName="w-[var(--radix-select-trigger-width)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Ngày giao việc */}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hạn xử lý */}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Người thực hiện */}
            <FormField
              control={form.control}
              name="handlerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Người thực hiện <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <SelectCustom
                      options={[
                        {
                          label: "-- Chọn người thực hiện --",
                          value: "all",
                        },
                        ...(userHandlerList?.map((item: any) => ({
                          label: item.fullName,
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
                      placeholder="-- Chọn người thực hiện --"
                      contentClassName="w-[var(--radix-select-trigger-width)]"
                      //disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editData?.id ? "Cập nhật" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
