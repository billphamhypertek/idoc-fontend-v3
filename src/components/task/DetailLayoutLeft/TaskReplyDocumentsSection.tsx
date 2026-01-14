"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/definitions";

interface TaskReplyDocumentsSectionProps {
  data: any;
}

export default function TaskReplyDocumentsSection({
  data,
}: TaskReplyDocumentsSectionProps) {
  const replyDocumentColumns: Column<any>[] = [
    {
      header: "STT",
      accessor: "no",
      className: "w-16 text-center border-r",
    },
    {
      header: "Trích yếu",
      accessor: "preview",
      className: "w-96 text-left border-r",
    },
    {
      header: "Trạng thái văn bản",
      accessor: "status",
      className: "w-32 text-center border-r",
    },
  ];

  const processReplyDocuments = (documents: any[]) => {
    return documents?.map((doc, index) => ({
      no: index + 1,
      preview: (
        <a
          href={`/document-in/search/draft-detail/${doc.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {doc.preview}
        </a>
      ),
      status: (
        <a
          href={`/document-in/search/draft-detail/${doc.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {doc.statusName}
        </a>
      ),
    }));
  };

  if (!data?.listDocOutReply || data.listDocOutReply.length === 0) {
    return null;
  }

  return (
    <Card className="border-none rounded-none mt-4">
      <CardHeader className="p-0">
        <div className="p-4 bg-gray-100 rounded-none">
          <span className="font-weight-bold text-info m-0">
            Danh sách văn bản đi trả lời
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Table
          columns={replyDocumentColumns}
          dataSource={processReplyDocuments(data.listDocOutReply)}
          showPagination={false}
          emptyText="Không có văn bản đi trả lời"
          className="task-reply-documents-table"
        />
      </CardContent>
    </Card>
  );
}
