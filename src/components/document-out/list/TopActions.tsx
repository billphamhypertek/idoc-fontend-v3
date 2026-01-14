"use client";

import { TransferDocumentOut } from "@/components/document-out/TransferDocumentOut";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { BpmnResponse } from "@/definitions/types/bpmn.type";

interface TopActionsProps {
  currentTab: string;
  isCanHandleDoc: boolean;
  currentDocumentIdLength: number;
  isAdvanceSearch: boolean;
  showReject: boolean;
  onCopy: () => void;
  onFinish: () => void;
  transferDisabled?: boolean; // true khi không được phép chuyển
  onReject: () => void;
  onToggleAdvanceSearch: () => void;
  selectedItemId: number | null;
  currentNode: number | null;
  onSuccess?: () => void;
  listNextNode: BpmnResponse[];
}

export default function TopActions({
  currentTab,
  isCanHandleDoc,
  currentDocumentIdLength,
  isAdvanceSearch,
  showReject,
  onCopy,
  onFinish,
  transferDisabled,
  onReject,
  onToggleAdvanceSearch,
  selectedItemId,
  currentNode,
  onSuccess,
  listNextNode,
}: TopActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {currentTab !== "waitTab" && (
        <>
          {currentDocumentIdLength === 1 && isCanHandleDoc && (
            <Button
              onClick={onCopy}
              className="text-white border-0 h-9 px-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 hover:text-white"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#3a7bc8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4798e8")
              }
            >
              <Copy className="mr-1 h-4 w-4" /> Sao chép
            </Button>
          )}
          {currentDocumentIdLength >= 1 && isCanHandleDoc && (
            <Button
              onClick={onFinish}
              className="text-white border-0 h-9 px-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 hover:text-white"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#3a7bc8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4798e8")
              }
            >
              <Check className="mr-2 h-4 w-4" /> Hoàn thành
            </Button>
          )}
          {/* <Button disabled={!!transferDisabled || !isCanHandleDoc}>
            <Share className="mr-2 h-4 w-4" /> Chuyển xử lý
          </Button> */}
          {isCanHandleDoc &&
            !transferDisabled &&
            currentDocumentIdLength === 1 && (
              <TransferDocumentOut
                selectedItemId={selectedItemId}
                disabled={false}
                onSuccess={onSuccess}
                listNextNode={listNextNode}
              />
            )}
          {/* Nút Tìm kiếm nâng cao đã được di chuyển lên cạnh BreadcrumbNavigation */}
        </>
      )}

      {currentTab === "waitTab" && isCanHandleDoc && showReject && (
        <Button
          onClick={onReject}
          className="h-9 px-3 text-sm bg-red-600 hover:bg-red-700 text-white"
        >
          Từ chối
        </Button>
      )}
    </div>
  );
}
