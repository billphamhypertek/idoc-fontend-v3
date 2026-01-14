"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SelectCustom from "@/components/common/SelectCustom";
import OrgTreeSelect from "@/components/dashboard/OrgTreeSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Constant } from "@/definitions/constants/constant";
import {
  regularTaskSchema,
  type RegularFormData,
} from "@/schemas/regular.schema";
import {
  useGetCategoryWithCode,
  useCreateRegular,
  useUpdateRegular,
} from "@/hooks/data/task.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import type { OrgTreeNode } from "@/definitions/types/orgunit.type";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegularModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any;
  onSuccess?: () => void;
}

export default function RegularModal({
  open,
  onOpenChange,
  task,
  onSuccess,
}: RegularModalProps) {
  const { data: complexityData } = useGetCategoryWithCode(
    Constant.CATEGORY_TYPE_CODE.LEVEL_OF_COMPLEXITY
  );

  const createMutation = useCreateRegular();
  const updateMutation = useUpdateRegular();

  const complexityOptions = useMemo(() => {
    return [
      { label: "--- Chọn ---", value: "null" },
      ...(complexityData?.map((item: any) => ({
        label: item.name,
        value: String(item.id),
      })) || []),
    ];
  }, [complexityData]);

  const form = useForm<RegularFormData>({
    resolver: zodResolver(regularTaskSchema),
    defaultValues: {
      taskName: "",
      complexityId: null,
      orgIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (task && task.regularTaskId) {
        form.reset({
          taskName: task.taskName || "",
          complexityId: task.complexityId ? String(task.complexityId) : null,
          orgIds: task.orgIds ? task.orgIds.map(String) : [],
        });
      } else {
        form.reset({
          taskName: "",
          complexityId: null,
          orgIds: [],
        });
      }
    }
  }, [open, task, form]);

  const onSubmit = async (data: RegularFormData) => {
    try {
      const orgIds = data.orgIds.map(Number);
      const payload = {
        regularTaskId: task?.regularTaskId || null,
        taskName: data.taskName.trim(),
        complexityId: Number(data.complexityId),
        orgIds: orgIds,
      };

      if (task?.regularTaskId) {
        await updateMutation.mutateAsync(payload);
        ToastUtils.success("Lưu lại thành công", "Thành công");
      } else {
        await createMutation.mutateAsync(payload);
        ToastUtils.success("Lưu lại thành công", "Thành công");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      handleError(error);
      ToastUtils.error("Có lỗi xảy ra", "Lỗi");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold border-b pb-4">
            Công việc thường xuyên
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            {/* Task Name */}
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                  <FormLabel
                    className={cn(
                      "text-right self-start pt-3 font-semibold text-black"
                    )}
                  >
                    Công việc thường xuyên{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tên công việc"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            {/* Complexity */}
            <FormField
              control={form.control}
              name="complexityId"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                  <FormLabel
                    className={cn(
                      "text-right self-start pt-3 font-semibold text-black"
                    )}
                  >
                    Mức độ phức tạp <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <SelectCustom
                        options={complexityOptions}
                        value={field.value || "null"}
                        onChange={(value) => {
                          const val = Array.isArray(value) ? value[0] : value;
                          field.onChange(
                            val === "null" || val === null ? null : val
                          );
                        }}
                        placeholder="Chọn mức độ phức tạp"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            {/* Organization */}
            <FormField
              control={form.control}
              name="orgIds"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                  <FormLabel
                    className={cn(
                      "text-right self-start pt-3 font-semibold text-black"
                    )}
                  >
                    Đơn vị <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <OrgTreeSelect
                        value={field.value.length > 0 ? field.value : null}
                        onChange={(nodes: OrgTreeNode | OrgTreeNode[]) => {
                          if (Array.isArray(nodes)) {
                            const orgIds = nodes.map((n) => n.id);
                            field.onChange(orgIds);
                          }
                        }}
                        placeholder="Chọn đơn vị"
                        className="!border-gray-300 focus:border-gray-100 focus:ring-0 h-9 text-sm [&_span]:text-black [&_span]:font-normal [&_svg]:text-black"
                        showCheckbox={true}
                        disabled={isLoading}
                        height="35vh"
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="bg-white border text-black hover:bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Đóng
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
