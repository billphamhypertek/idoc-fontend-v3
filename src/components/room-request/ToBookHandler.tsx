import { ArrowRight, BookCheck, ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImportDocBook, useInBookType } from "@/hooks/data/document-in.data";
import { ToastUtils } from "@/utils/toast.utils";

interface Props {
  selectedItemId: number | null;
  onSuccess?: () => void;
  className?: string;
}

const initInBookData = {
  bookId: "",
  numberInBook: "",
  numberOrSign: "",
};

export const ToBookHandler = ({ selectedItemId, onSuccess }: Props) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [inBookData, setInBookData] = useState(initInBookData);
  const importBookMutation = useImportDocBook();

  const handleInBookSubmit = () => {
    if (inBookData.bookId === "") {
      ToastUtils.banChuaChonSoVanBan();
    }
    if (
      inBookData.bookId !== "" &&
      (inBookData.numberInBook === "" || inBookData.numberOrSign === "")
    ) {
      ToastUtils.banChuaChonSoKyHieu();
    }
    const fd = new FormData();

    fd.append("docId", String(selectedItemId));
    fd.append("bookId", String(inBookData.bookId));
    fd.append("numberInBook", String(inBookData.numberInBook));
    fd.append("numberOrSign", inBookData.numberOrSign);
    importBookMutation.mutate(fd, {
      onSuccess: () => {
        console.log("Vào sổ thành công");
        setDialogOpen(false);
        setInBookData(initInBookData);
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        console.error("Lỗi vào sổ:", err);
      },
    });
  };
  const handleInBookCancel = () => {
    setDialogOpen(false);
    setInBookData(initInBookData);
  };
  const { data: bookTypeData } = useInBookType();
  return (
    <>
      <Button
        variant="outline"
        className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white"
        onClick={() => setDialogOpen(true)}
      >
        <BookCheck className="w-4 h-4 mr-1" />
        Vào sổ
      </Button>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setInBookData(initInBookData);
          }
        }}
      >
        <CustomDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Vào sổ văn bản
                </DialogTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleInBookCancel}
                  className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Hủy
                </Button>
                <Button
                  onClick={handleInBookSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Cập nhật
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Sổ văn bản */}
            <div className="flex items-center gap-2">
              <Label className="w-32 text-sm font-semibold text-gray-900">
                Sổ văn bản
              </Label>
              <Select
                value={inBookData.bookId} // this holds the id (string)
                onValueChange={(value) => {
                  const selected = bookTypeData?.find(
                    (b) => String(b.id) === value
                  );
                  setInBookData({
                    bookId: value,
                    numberInBook: String((selected?.currentNumber ?? 0) + 1),
                    numberOrSign: selected?.numberOrSign ?? "",
                  });
                }}
              >
                <SelectTrigger className="h-9 flex-1 bg-background">
                  <SelectValue placeholder="-- Chọn --">
                    {
                      bookTypeData?.find(
                        (b) => String(b.id) === inBookData.bookId
                      )?.name
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {bookTypeData?.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Số/ký hiệu */}
            <div className="flex items-center gap-2">
              <Label className="w-32 text-sm font-semibold text-gray-900">
                Số/ký hiệu
              </Label>
              <div className="flex flex-1 gap-2">
                <Input
                  className="flex-1 rounded border px-3 py-2"
                  type="text"
                  placeholder="Số"
                  value={inBookData.numberInBook}
                  onChange={(e) =>
                    setInBookData((p) => ({
                      ...p,
                      numberInBook: e.target.value,
                    }))
                  }
                />
                <Input
                  className="flex-1 rounded border px-3 py-2"
                  type="text"
                  placeholder="Ký hiệu"
                  maxLength={200}
                  value={inBookData.numberOrSign}
                  onChange={(e) =>
                    setInBookData((p) => ({
                      ...p,
                      numberOrSign: e.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>
    </>
  );
};
