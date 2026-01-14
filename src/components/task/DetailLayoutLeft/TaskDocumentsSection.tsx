"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import DocAttachment from "./DocAttachment";

interface TaskDocumentsSectionProps {
  data: any;
  isEditing: boolean;
  checkUserAssign: () => boolean;
  form: UseFormReturn<any>;
}

export default function TaskDocumentsSection({
  data,
  isEditing,
  checkUserAssign,
  form,
}: TaskDocumentsSectionProps) {
  const [isDocAttachmentOpen, setIsDocAttachmentOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);

  const canEdit = isEditing && checkUserAssign();

  // Watch form value để sync
  const watchedTaskDocument = form.watch("taskDocument");
  useEffect(() => {
    if (watchedTaskDocument && watchedTaskDocument.length > 0) {
      setSelectedDocs(watchedTaskDocument);
    }
  }, [watchedTaskDocument]);

  const renderDocumentLink = (doc: any, content: React.ReactNode) => {
    const href =
      doc.typeDocument || doc.docTypeName === "Văn bản đến"
        ? `/document-out/search/detail/${doc.docId || doc.id}`
        : `/document-in/search/draft-detail/${doc.docId || doc.id}`;

    return (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {content}
      </a>
    );
  };

  const renderDocumentTypeBadge = (doc: any) => {
    const isDocumentIn =
      doc.docType === "0" ||
      doc.typeDocument ||
      doc.docTypeName === "Văn bản đến";

    return (
      <Badge variant={isDocumentIn ? "default" : "secondary"}>
        {isDocumentIn ? "Văn bản đến" : "Văn bản đi"}
      </Badge>
    );
  };

  const renderActionsButton = (doc: any) => {
    if (!canEdit) return null;

    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-800"
        onClick={() => handleDocDeselect(doc)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    );
  };

  const dataSource = useMemo(() => {
    return selectedDocs.map((doc: any, index: number) => ({
      no: index + 1,
      numberOrSign: renderDocumentLink(
        doc,
        doc.numberOrSign ||
          doc.documentIn?.numberOrSign ||
          doc.documentOut?.numberOrSign ||
          "-"
      ),
      preview: renderDocumentLink(
        doc,
        doc.preview || doc.documentIn?.preview || doc.documentOut?.preview
      ),
      docType: renderDocumentTypeBadge(doc),
      actions: renderActionsButton(doc),
    }));
  }, [selectedDocs, canEdit]);

  const taskDocumentColumns = (canEdit: boolean) => [
    {
      header: "STT",
      accessor: (item: any) => item.no,
      className: "w-16 text-center border-r",
    },
    {
      header: "Số ký hiệu",
      accessor: (item: any) => item.numberOrSign,
      className: "w-32 text-center border-r",
    },
    {
      header: "Trích yếu",
      accessor: (item: any) => item.preview,
      className: "w-96 text-center border-r",
    },
    {
      header: "Loại văn bản",
      accessor: (item: any) => item.docType,
      className: "w-32 text-center border-r",
    },
    ...(canEdit
      ? [
          {
            header: "Thao tác",
            accessor: (item: any) => item.actions,
            className: "w-24 text-center border-r",
          },
        ]
      : []),
  ];

  const handleDocSelect = (doc: any) => {
    const newSelectedDocs = [...selectedDocs, doc];
    setSelectedDocs(newSelectedDocs);
    form.setValue("taskDocument", newSelectedDocs);
  };

  const handleDocDeselect = (doc: any) => {
    if (!canEdit) return;

    const docIdToRemove =
      doc.docId || doc.documentIn?.id || doc.documentOut?.id;

    const newSelectedDocs = selectedDocs.filter((d) => {
      const dDocId = d.docId || d.documentIn?.id || d.documentOut?.id;

      return dDocId !== docIdToRemove;
    });

    setSelectedDocs(newSelectedDocs);
    form.setValue("taskDocument", newSelectedDocs);
  };

  return (
    <div className="col-span-full">
      <FormField
        control={form.control}
        name="taskDocument"
        render={({ field }) => (
          <FormItem>
            <FormLabel
              className={`text-md font-bold text-blue-600 cursor-pointer ${!canEdit && "text-black"}`}
              onClick={() => {
                if (canEdit) {
                  setIsDocAttachmentOpen(true);
                }
              }}
            >
              Lựa chọn văn bản đính kèm
            </FormLabel>
            <FormControl>
              <div>
                {selectedDocs.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Không có văn bản đính kèm
                  </p>
                ) : (
                  <Table
                    columns={taskDocumentColumns(canEdit)}
                    dataSource={dataSource}
                    showPagination={false}
                    emptyText="Không có văn bản đính kèm"
                  />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* DocAttachment Modal */}
      <DocAttachment
        open={isDocAttachmentOpen}
        onOpenChange={setIsDocAttachmentOpen}
        selectedDocs={selectedDocs}
        onDocSelect={handleDocSelect}
        onDocDeselect={handleDocDeselect}
      />
    </div>
  );
}
