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
import SelectCustom from "@/components/common/SelectCustom";
import { Save, X } from "lucide-react";
import {
  calendarRoomSchema,
  CalendarRoomFormData,
} from "@/schemas/calendar-room.schema";
import { useAddRoomAction } from "@/hooks/data/calendar.actions";
import { useListOrgRoom } from "@/hooks/data/calendar.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";

interface CalendarRoomAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditRoom?: boolean;
  roomData?: {
    id?: number;
    name?: string;
    addressId?: number | null;
    address?: string;
    meetingAddress?: any;
    quantity?: number;
    acreage?: number;
    description?: string;
  };
}

interface OrgRoom {
  id: number;
  address: string;
}

export default function CalendarRoomAdd({
  open,
  onOpenChange,
  isEditRoom = false,
  roomData,
}: CalendarRoomAddProps) {
  const addRoomMutation = useAddRoomAction();

  const params = new URLSearchParams({ text: "" });
  const { data: orgRoomData = [] } = useListOrgRoom(params.toString());

  const form = useForm<CalendarRoomFormData>({
    resolver: zodResolver(calendarRoomSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      addressId: null,
      quantity: undefined,
      acreage: undefined,
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (roomData) {
        form.reset({
          name: roomData.name || "",
          addressId: roomData.addressId ?? null,
          quantity: roomData.quantity,
          acreage: roomData.acreage,
          description: roomData.description || "",
        });
      } else {
        form.reset({
          name: "",
          addressId: null,
          quantity: undefined,
          acreage: undefined,
          description: "",
        });
      }
    }
  }, [open, roomData, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: CalendarRoomFormData) => {
    try {
      const addressIdValue =
        typeof data.addressId === "string"
          ? data.addressId
            ? Number(data.addressId)
            : null
          : (data.addressId ?? null);

      const dataToSend: any = {
        name: data.name.trim(),
        addressId: addressIdValue,
        quantity: data.quantity ?? undefined,
        acreage: data.acreage ?? undefined,
        description: data.description?.trim() || "",
      };

      if (isEditRoom && roomData?.id) {
        dataToSend.id = roomData.id;
      }

      await addRoomMutation.mutateAsync(dataToSend);

      ToastUtils.success(
        isEditRoom
          ? "Cập nhật phòng họp thành công!"
          : "Thêm mới phòng họp thành công!"
      );

      handleClose();
    } catch (error) {
      handleError(error);
    }
  };

  const addressOptions = [
    { label: "-- Chọn địa điểm --", value: "all" },
    ...(orgRoomData || []).map((org: OrgRoom) => ({
      label: org.address,
      value: String(org.id),
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl [&>button]:hidden px-6 py-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <DialogTitle className="text-2xl font-semibold">
            {isEditRoom ? "Cập nhật phòng họp" : "Thêm mới phòng họp"}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Tên phòng họp<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      maxLength={100}
                      placeholder="Tên phòng họp"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Địa điểm
                  </FormLabel>
                  <FormControl>
                    <SelectCustom
                      options={addressOptions}
                      value={
                        field.value !== null && field.value !== undefined
                          ? String(field.value)
                          : ""
                      }
                      onChange={(value) => {
                        if (value === "" || !value) {
                          field.onChange(null);
                        } else {
                          field.onChange(Number(value));
                        }
                      }}
                      placeholder="-- Chọn địa điểm --"
                      contentClassName="w-[var(--radix-select-trigger-width)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Số người
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      step="1"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue =
                          value === "" ? undefined : Number(value);
                        if (numValue === undefined || numValue >= 1) {
                          field.onChange(numValue);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "-" ||
                          e.key === "+" ||
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "."
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Số người"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acreage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Diện tích
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0.01"
                      step="any"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue =
                          value === "" ? undefined : Number(value);
                        if (numValue === undefined || numValue >= 0.01) {
                          field.onChange(numValue);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "-" ||
                          e.key === "+" ||
                          e.key === "e" ||
                          e.key === "E"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Diện tích"
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
                  <FormLabel className="text-sm font-semibold">Mô tả</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      maxLength={500}
                      placeholder="Mô tả"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={addRoomMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {addRoomMutation.isPending ? "Đang lưu..." : "Lưu"}
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
