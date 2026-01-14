"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  DeclarePhongFormData,
  declarePhongSchema,
} from "@/schemas/declare-phong.schema";
import { useGetCategoryWithCode } from "@/hooks/data/task.data";
import { Constant } from "@/definitions/constants/constant";
import { getUserInfo } from "@/utils/token.utils";
import {
  useCreateDeclareTask,
  useCreateDepartmentTask,
  useDetailDepartmentTask,
  useUpdateDeclareTask,
  useUpdateDepartmentTask,
} from "@/hooks/data/taskv2.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { formatDateYMD } from "@/utils/datetime.utils";

interface DeclarePhongModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
  isPermission?: boolean;
  activeTab?: string;
  openedFromRowClick?: boolean;
}

const toInputDate = (value?: string | number | Date | null) => {
  if (!value) return "";
  return formatDateYMD(new Date(value));
};

export default function DeclarePhongModal({
  open,
  onOpenChange,
  editData,
  isPermission = false,
  activeTab = "NEW",
  openedFromRowClick = false,
}: DeclarePhongModalProps) {
  const userInfo = JSON.parse(getUserInfo() || "{}");
  const isReadOnly = editData?.id
    ? activeTab !== "NEW" || openedFromRowClick
    : false;

  const { data: complexityData } = useGetCategoryWithCode(
    Constant.CATEGORY_TYPE_CODE.LEVEL_OF_COMPLEXITY
  );

  const { data: detailDepartmentTask } = useDetailDepartmentTask(
    editData?.id,
    !!editData?.id
  );

  const createDepartmentTaskMutation = useCreateDepartmentTask();
  const updateDepartmentTaskMutation = useUpdateDepartmentTask();

  const form = useForm<DeclarePhongFormData>({
    resolver: zodResolver(declarePhongSchema),
    mode: "onChange",
    defaultValues: {
      taskName: "",
      complexityId: null,
      startDate: "",
      deadline: "",
      endDate: "",
      actualStartDate: "",
      actualEndDate: "",
      completeDate: "",
      extendDeadline: "",
      result: "",
    },
  });

  const startDate = form.watch("startDate");

  const getComplexityIdFromName = (name?: string | null) => {
    if (!name || !complexityData) return null;
    const found = complexityData.find((item: any) => item.name === name);
    return found ? Number(found.id) : null;
  };

  useEffect(() => {
    if (open && editData) {
      form.reset({
        taskName: detailDepartmentTask?.taskName || "",
        complexityId:
          detailDepartmentTask?.complexityId ??
          getComplexityIdFromName(detailDepartmentTask?.complexityName),
        startDate: toInputDate(detailDepartmentTask?.startDate),
        deadline: toInputDate(detailDepartmentTask?.deadline),
        endDate: toInputDate(detailDepartmentTask?.endDate),
        actualStartDate: toInputDate(detailDepartmentTask?.actualStartDate),
        actualEndDate: toInputDate(detailDepartmentTask?.actualEndDate),
        completeDate: toInputDate(detailDepartmentTask?.completeDate),
        extendDeadline: toInputDate(detailDepartmentTask?.extendDeadline),
        result: detailDepartmentTask?.result || "",
      });
    } else if (open && !editData) {
      form.reset({
        taskName: "",
        complexityId: null,
        startDate: "",
        deadline: "",
        endDate: "",
        actualStartDate: "",
        actualEndDate: "",
        completeDate: "",
        extendDeadline: "",
        result: "",
      });
    }
  }, [
    open,
    editData,
    form,
    userInfo?.id,
    complexityData,
    detailDepartmentTask,
  ]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: DeclarePhongFormData) => {
    try {
      const payload: any = {
        taskName: data.taskName,
        complexityId: data.complexityId,
        startDate: data.startDate,
        deadline: data.deadline,
        endDate: data.endDate || null,
        actualStartDate: data.actualStartDate || null,
        actualEndDate: data.actualEndDate || null,
        completeDate: data.completeDate || null,
        extendDeadline: data.extendDeadline || null,
        result: data.result,
      };

      if (editData?.id) {
        payload.id = editData.id;
      }

      if (editData?.id) {
        await updateDepartmentTaskMutation.mutateAsync(payload);
        ToastUtils.success("Cập nhật công việc thành công.");
      } else {
        await createDepartmentTaskMutation.mutateAsync(payload);
        ToastUtils.success("Tạo công việc thành công.");
      }

      handleClose();
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
        className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {editData?.id ? "Sửa công việc phòng" : "Khai báo công việc phòng"}
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
                      disabled={isReadOnly}
                      className={`${isReadOnly ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Thời gian giao <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <CustomDatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => {
                          field.onChange(toInputDate(date));
                        }}
                        placeholder="dd/mm/yyyy"
                        readOnly={isReadOnly}
                        className={`${isReadOnly ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
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
                        readOnly={isReadOnly}
                        className={`${isReadOnly ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
                        min={startDate || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Kết quả thực hiện <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Kết quả thực hiện"
                      maxLength={1000}
                      disabled={isReadOnly}
                      className={`${isReadOnly ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
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
                        disabled={isReadOnly}
                        className={`${isReadOnly ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
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
                name="extendDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gia hạn nhiệm vụ</FormLabel>
                    <FormControl>
                      <CustomDatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => {
                          field.onChange(toInputDate(date));
                        }}
                        placeholder="dd/mm/yyyy"
                        readOnly={!isPermission || isReadOnly}
                        className={`${!isPermission || isReadOnly ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ngày hoàn thành <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <CustomDatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => {
                          field.onChange(toInputDate(date));
                        }}
                        placeholder="dd/mm/yyyy"
                        readOnly={isReadOnly}
                        className={`${isReadOnly ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
                        min={startDate || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Đóng
              </Button>
              {!isReadOnly && (
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={
                    createDepartmentTaskMutation.isPending ||
                    updateDepartmentTaskMutation.isPending
                  }
                >
                  {editData?.id ? "Cập nhật" : "Lưu"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
