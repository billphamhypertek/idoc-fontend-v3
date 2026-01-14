"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Save, X } from "lucide-react";
import { useAddTagMutation } from "@/hooks/data/label.data";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTag: (tag: any) => void;
}

export default function AddTagModal({
  isOpen,
  onClose,
  onAddTag,
}: AddTagModalProps) {
  const [tagName, setTagName] = useState("");
  const addTagMutation = useAddTagMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      try {
        const newTag = await addTagMutation.mutateAsync(tagName.trim());
        if (newTag) {
          ToastUtils.success("Thêm nhãn thành công");
          onAddTag(newTag);
          setTagName("");
          onClose();
        }
      } catch (error) {
        ToastUtils.error("Lỗi khi thêm nhãn");
      }
    }
  };

  const handleClose = () => {
    setTagName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm mới nhãn</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 whitespace-nowrap flex-shrink-0">
              <Label htmlFor="tagName" className="text-md font-medium">
                Tên nhãn:{" "}
              </Label>
              <Input
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Nhập tên nhãn"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-600"
              onClick={handleSubmit}
              disabled={addTagMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {addTagMutation.isPending ? "Đang tạo..." : "Lưu lại"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addTagMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
