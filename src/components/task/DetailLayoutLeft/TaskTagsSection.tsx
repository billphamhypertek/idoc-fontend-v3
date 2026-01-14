"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/mutil-select";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import {
  useListTagUnpageQuery,
  useAddTagMutation,
  useAssignTagMutation,
  useRemoveObjectMutation,
  useListObjectTagQuery,
} from "@/hooks/data/label.data";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/utils/common.utils";
import AddTagModal from "./AddTagModal";
import { ToastUtils } from "@/utils/toast.utils";

interface TaskTagsSectionProps {
  data: any;
  isEditing: boolean;
  checkUserAssign: () => boolean;
  form: UseFormReturn<any>;
}

export default function TaskTagsSection({
  data,
  isEditing,
  checkUserAssign,
  form,
}: TaskTagsSectionProps) {
  const { id } = useParams() as { id: string };
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [localSelectedTags, setLocalSelectedTags] = useState<any[]>([]);

  const taskId = id ? parseInt(id as string) : 0;

  const { data: tagList } = useListTagUnpageQuery();
  const { data: objectTags } = useListObjectTagQuery(
    taskId.toString(),
    "GIAO_VIEC"
  );
  const assignTagMutation = useAssignTagMutation();
  const removeObjectMutation = useRemoveObjectMutation();

  const tagOptions = useMemo(() => {
    if (!tagList) return [];
    return tagList.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
    }));
  }, [tagList]);

  const handleTagSelect = async (item: any) => {
    try {
      const tag = {
        objId: taskId,
        tagId: item.id,
        type: "GIAO_VIEC",
      };
      await assignTagMutation.mutateAsync(tag);
      ToastUtils.success("Gán nhãn thành công");
    } catch (error) {
      ToastUtils.error("Gán nhãn thất bại");
      handleError(error);
    }
  };

  const handleTagDeselect = async (item: any) => {
    try {
      await removeObjectMutation.mutateAsync({
        tagId: item.id,
        objId: taskId.toString(),
        type: "GIAO_VIEC",
      });
      ToastUtils.success("Hủy gán nhãn thành công");
    } catch (error) {
      ToastUtils.error("Hủy gán nhãn thất bại");
      handleError(error);
    }
  };

  const handleAddTag = async (newTag: any) => {
    try {
      // Update local state immediately
      setLocalSelectedTags((prev) => [...prev, newTag]);
      form.setValue("tags", [...localSelectedTags, newTag]);

      // Assign tag to task
      await handleTagSelect(newTag);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (objectTags) {
      setSelectedTags(objectTags);
      setLocalSelectedTags(objectTags);
      form.setValue("tags", objectTags);
    }
  }, [objectTags, form]);

  const canEdit = isEditing && checkUserAssign();

  return (
    <div className="col-span-full">
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <div className="flex items-center whitespace-nowrap flex-shrink-0 gap-2">
              <FormLabel className="text-md font-bold">Gắn nhãn</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddTagModalOpen(true)}
                className="p-1 h-6 w-6 text-white hover:text-white hover:bg-green-500 rounded-full bg-green-500"
                title="Thêm mới nhãn"
              >
                <Plus className="w-4 h-4" />
              </Button>
              :
            </div>
            <FormControl className="flex-1">
              <MultiSelect
                options={tagOptions}
                value={localSelectedTags}
                onChange={(items) => {
                  if (items.length > localSelectedTags.length) {
                    const newItem = items.find(
                      (item) => !localSelectedTags.some((s) => s.id === item.id)
                    );
                    if (newItem) handleTagSelect(newItem);
                  } else {
                    const removedItem = localSelectedTags.find(
                      (item) => !items.some((i) => i.id === item.id)
                    );
                    if (removedItem) handleTagDeselect(removedItem);
                  }

                  setLocalSelectedTags(items);
                  field.onChange(items);
                }}
                placeholder="Chọn gán nhãn"
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* AddTag Modal */}
      <AddTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onAddTag={handleAddTag}
      />
    </div>
  );
}
