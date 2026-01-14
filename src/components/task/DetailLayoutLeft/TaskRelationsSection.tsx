"use client";

import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Table } from "@/components/ui/table";
import SelectionModal from "./SelectionModal";
import { ProgressBar } from "@react-pdf-viewer/core";

interface TaskRelationsSectionProps {
  data: any;
  isEditing: boolean;
  checkUserAssign: () => boolean;
  form: UseFormReturn<any>;
  UserInfo: any;
  isV2?: boolean;
}

export default function TaskRelationsSection({
  data,
  isEditing,
  checkUserAssign,
  form,
  UserInfo,
  isV2 = false,
}: TaskRelationsSectionProps) {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectionModalType, setSelectionModalType] = useState("");
  const [selectionModalTitle, setSelectionModalTitle] = useState("");
  const [selectedParent, setSelectedParent] = useState<any>(null);

  const watchedSubtasks = form.watch("subTasks") || [];
  const watchedRelatedTasks = form.watch("taskRelateds") || [];

  const canEdit = isEditing && checkUserAssign();

  const parentColumns = [
    {
      header: "STT",
      accessor: (item: any) => item.no,
      className: "w-16 text-center",
    },
    {
      header: "Tên công việc",
      accessor: (item: any) => item.taskName,
      className: "text-left w-[75%]",
    },
    {
      header: "Người tạo",
      accessor: (item: any) => item.userAssignName,
      className: "text-center w-[25%]",
    },
  ];

  const taskColumns = [
    {
      header: "STT",
      accessor: (item: any) => item.no,
      className: "w-16 text-center",
    },
    {
      header: "Tên công việc",
      accessor: (item: any) => item.taskName,
      className: "text-left w-[75%]",
    },
    {
      header: "Người tạo",
      accessor: (item: any) => item.userAssignName,
      className: "text-center w-[25%]",
    },
    {
      header: "Tiến độ",
      accessor: (row: any) => {
        return <ProgressBar progress={row?.progress || 0} />;
      },
      className: "text-center w-[10%]",
    },
  ];

  const relatedTaskColumns = [
    {
      header: "STT",
      accessor: (item: any) => item.no,
      className: "w-16 text-center",
    },
    {
      header: "Tên công việc",
      accessor: (item: any) => item.taskName,
      className: "text-left w-[75%]",
    },
    {
      header: "Người tạo",
      accessor: (item: any) => item.userAssignName,
      className: "text-center w-[25%]",
    },
  ];

  const badgeClasses =
    "text-blue-500 text-[10px] rounded-full px-2 py-1 bg-blue-100";

  const parentDataSource = selectedParent
    ? [
        {
          no: 1,
          taskName: (
            <a
              href={`/task/assign/detail/${selectedParent.id}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {selectedParent?.taskName}
            </a>
          ),
          userAssignName: selectedParent?.userAssignName || "N/A",
        },
      ]
    : [];

  const subtasksDataSource =
    watchedSubtasks && watchedSubtasks.length > 0
      ? watchedSubtasks.map((item: any, index: number) => ({
          no: index + 1,
          taskName: (
            <a
              href={`/task/assign/detail/${item.id}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {item.taskName}
            </a>
          ),
          userAssignName:
            item.userAssignName || item.userAssign?.fullName || "N/A",
          progress: item.progress || 0,
        }))
      : [];

  const relatedTasksDataSource =
    watchedRelatedTasks && watchedRelatedTasks.length > 0
      ? watchedRelatedTasks.map((item: any, index: number) => ({
          no: index + 1,
          taskName: (
            <a
              href={`/task/assign/detail/${item.taskRelatedId || item.id}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {item.taskName || item.namRelated}
            </a>
          ),
          userAssignName:
            item.userAssignName || item.userAssign?.fullName || "N/A",
        }))
      : [];

  const openSelectionModal = (type: string, title: string) => {
    if (!canEdit) return;
    setSelectionModalType(type);
    setSelectionModalTitle(title);
    setIsSelectionModalOpen(true);
  };

  useEffect(() => {
    if (data?.parentId) {
      form.setValue("parentId", data.parentId);
      setSelectedParent({
        id: data.parentId,
        taskName: data.parentName,
        userAssignName: data.userAssignName,
      });
    }
  }, [data?.parentId, data?.parentName, data?.userAssignName, form]);

  const handleSelectionSelect = (item: any) => {
    if (selectionModalType === "parent") {
      form.setValue("parentId", item.id);

      setSelectedParent({
        id: item.id,
        taskName: item.taskName || item.name,
        userAssignName: item.userAssign?.fullName || item.userAssignName,
      });
    } else if (selectionModalType === "subtask") {
      const currentSubtasks = form.getValues("subTasks") || [];
      const isSelected = currentSubtasks.some(
        (task: any) => task.id === item.id
      );
      if (isSelected) {
        const newSubtasks = currentSubtasks.filter(
          (task: any) => task.id !== item.id
        );
        form.setValue("subTasks", newSubtasks);
      } else {
        const newSubtasks = [...currentSubtasks, item];
        form.setValue("subTasks", newSubtasks);
      }
    } else if (selectionModalType === "related") {
      const currentRelatedTasks = form.getValues("taskRelateds") || [];
      const isSelected = currentRelatedTasks.some(
        (task: any) => task.id === item.id
      );
      if (isSelected) {
        const newRelatedTasks = currentRelatedTasks.filter(
          (task: any) => task.id !== item.id
        );
        form.setValue("taskRelateds", newRelatedTasks);
      } else {
        const newRelatedTasks = [...currentRelatedTasks, item];
        form.setValue("taskRelateds", newRelatedTasks);
      }
    }
  };

  return (
    <>
      <div className="col-span-full">
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-bold">
                <span className="text-black">Công việc mức trên</span>
                {canEdit && (
                  <span
                    className="text-blue-600 hover:text-blue-800 cursor-pointer ml-2"
                    onClick={() =>
                      openSelectionModal(
                        "parent",
                        "Lựa chọn công việc mức trên"
                      )
                    }
                  >
                    Lựa chọn công việc mức trên
                  </span>
                )}
                {parentDataSource && parentDataSource.length > 0 && (
                  <span className={`${badgeClasses} ml-2`}>
                    {parentDataSource.length}
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <div className="overflow-x-auto">
                  {selectedParent ? (
                    <Table
                      columns={parentColumns}
                      dataSource={parentDataSource}
                      showPagination={false}
                      className="w-full table-fixed"
                      emptyText="Không có công việc mức trên"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Không có công việc mức trên
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-full">
        <FormField
          control={form.control}
          name="subTasks"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-medium">
                {canEdit ? (
                  <>
                    <span
                      className="text-blue-600 hover:text-blue-800 cursor-pointer font-bold"
                      onClick={() =>
                        openSelectionModal(
                          "subtask",
                          "Lựa chọn công việc mức dưới"
                        )
                      }
                    >
                      Lựa chọn công việc mức dưới
                    </span>
                    {subtasksDataSource && subtasksDataSource.length > 0 && (
                      <span className={`${badgeClasses} ml-2`}>
                        {subtasksDataSource.length}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-black font-bold">
                      Công việc mức dưới
                    </span>
                    {subtasksDataSource && subtasksDataSource.length > 0 && (
                      <span className={`${badgeClasses} ml-2`}>
                        {subtasksDataSource.length}
                      </span>
                    )}
                  </>
                )}
              </FormLabel>
              <FormControl>
                <div className="overflow-x-auto">
                  {field.value && field.value.length > 0 ? (
                    <Table
                      columns={taskColumns}
                      dataSource={subtasksDataSource}
                      showPagination={false}
                      className="w-full table-fixed"
                      emptyText="Không có công việc mức dưới"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có công việc mức dưới
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-full">
        <FormField
          control={form.control}
          name="taskRelateds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-medium">
                {canEdit ? (
                  <>
                    <span
                      className="text-blue-600 hover:text-blue-800 cursor-pointer font-bold"
                      onClick={() =>
                        openSelectionModal(
                          "related",
                          "Lựa chọn công việc liên quan"
                        )
                      }
                    >
                      Lựa chọn công việc liên quan
                    </span>
                    {relatedTasksDataSource &&
                      relatedTasksDataSource.length > 0 && (
                        <span className={`${badgeClasses} ml-2`}>
                          {relatedTasksDataSource.length}
                        </span>
                      )}
                  </>
                ) : (
                  <>
                    <span className="text-black font-bold">
                      Công việc liên quan
                    </span>
                    {relatedTasksDataSource &&
                      relatedTasksDataSource.length > 0 && (
                        <span className={`${badgeClasses} ml-2`}>
                          {relatedTasksDataSource.length}
                        </span>
                      )}
                  </>
                )}
              </FormLabel>
              <FormControl>
                <div className="overflow-x-auto">
                  {field.value && field.value.length > 0 ? (
                    <Table
                      columns={relatedTaskColumns}
                      dataSource={relatedTasksDataSource}
                      showPagination={false}
                      className="w-full table-fixed"
                      emptyText="Không có công việc liên quan"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có công việc liên quan
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <SelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleSelectionSelect}
        type={selectionModalType as "parent" | "subtask" | "related"}
        title={selectionModalTitle}
        userInfo={UserInfo}
        currentTaskId={data?.id}
        selectedItems={{
          parent: selectedParent,
          subtask: watchedSubtasks,
          related: watchedRelatedTasks,
        }}
        isV2={isV2}
      />
    </>
  );
}
