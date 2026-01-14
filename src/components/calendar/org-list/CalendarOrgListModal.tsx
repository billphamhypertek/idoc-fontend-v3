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
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import {
  useAddOrgAction,
  useUpdateOrgAction,
} from "@/hooks/data/calendar.actions";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { z } from "zod";

interface CalendarOrgListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditOrg?: boolean;
  orgData?: {
    id?: number;
    address?: string;
  };
}

const orgSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, "Địa điểm không được để trống")
    .max(255, "Địa điểm không được vượt quá 255 ký tự"),
});

export default function CalendarOrgListModal({
  open,
  onOpenChange,
  isEditOrg = false,
  orgData,
}: CalendarOrgListModalProps) {
  const addOrgMutation = useAddOrgAction();
  const updateOrgMutation = useUpdateOrgAction();

  const form = useForm<{ address: string }>({
    resolver: zodResolver(orgSchema),
    mode: "onChange",
    defaultValues: {
      address: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (orgData) {
        form.reset({
          address: orgData.address || "",
        });
      } else {
        form.reset({
          address: "",
        });
      }
    }
  }, [open, orgData, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: { address: string }) => {
    try {
      const payload = { address: data.address.trim() };

      if (isEditOrg && orgData?.id) {
        await updateOrgMutation.mutateAsync({
          id: orgData.id,
          body: payload,
        } as any);
        ToastUtils.success("Cập nhật địa điểm phòng họp thành công!");
      } else {
        await addOrgMutation.mutateAsync(payload);
        ToastUtils.success("Thêm mới địa điểm phòng họp thành công!");
      }
      handleClose();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl [&>button]:hidden px-6 py-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <DialogTitle className="text-2xl font-semibold">
            {isEditOrg
              ? "Cập nhật địa điểm phòng họp"
              : "Thêm mới địa điểm phòng họp"}
          </DialogTitle>
          <Button
            variant="outline"
            onClick={handleClose}
            className="items-center border-none hover:bg-transparent shadow-none outline-none"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Địa điểm
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      maxLength={255}
                      placeholder="Nhập địa điểm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  addOrgMutation.isPending || updateOrgMutation.isPending
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {addOrgMutation.isPending || updateOrgMutation.isPending
                  ? "Đang lưu..."
                  : "Lưu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Đóng
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
