"use client";
import type { DocumentDetail, TagItem } from "@/components/document-out/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/mutil-select";
import { Constant } from "@/definitions/constants/constant";
import { format } from "date-fns";
import { FileText, Paperclip, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import AddLable from "../label/AddLable";

export interface GeneralInfoCardProps {
  detail: DocumentDetail;
  collapse: boolean;
  onToggle: () => void;
  isVanthuDv: boolean;
  hstlList: any[];
  onOpenDocumentList: (item: any) => void;
  onOpenSelectHSTL: () => void;
  dropdownList: TagItem[];
  selectedItems: TagItem[];
  onChangeTags: (items: TagItem[]) => void;
  dateLeftText?: string;
}

const GeneralInfoCard: React.FC<GeneralInfoCardProps> = ({
  detail,
  collapse,
  onToggle,
  isVanthuDv,
  hstlList,
  onOpenDocumentList,
  onOpenSelectHSTL,
  dropdownList,
  selectedItems,
  onChangeTags,
  dateLeftText,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setNewLabelName("");
  };

  // Helper function to render field as label
  const renderField = (value: string) => {
    return (
      <label className="text-sm text-gray-900 font-medium text-left">
        {value || ""}
      </label>
    );
  };
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-white" />
            </div>
            Thông tin chung
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {collapse && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Sổ văn bản:
              </label>
              <div className="flex-1">{renderField(detail.bookName ?? "")}</div>
            </div>
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Số đến:
              </label>
              <div className="flex-1">
                {renderField(detail.document?.numberArrival ?? "")}
              </div>
            </div>
          </div>
        )}
        {collapse && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Nơi gửi (cha):
              </label>
              <div className="flex-1">
                {renderField(detail.document?.parentPlaceSend ?? "")}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Nơi gửi (con):
              </label>
              <div className="flex-1">
                {renderField(detail.document?.placeSend ?? "")}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
              Số, KH của VB đến:
            </label>
            <div className="flex-1">
              {renderField(detail.document?.numberArrivalStr ?? "")}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
              Hạn xử lý:
            </label>
            <div className="flex-1">
              {renderField(
                detail.document?.deadline
                  ? format(new Date(detail.document.deadline), "dd/MM/yyyy")
                  : ""
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
              Độ khẩn:
            </label>
            <div className="flex-1">{renderField(detail.urgentName ?? "")}</div>
          </div>
          <div className="flex items-start gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
              Độ mật:
            </label>
            <div className="flex-1">
              {renderField(detail.securityName ?? "")}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
              Ngày văn bản:
            </label>
            <div className="flex-1">
              {renderField(
                detail.document?.dateArrival
                  ? format(new Date(detail.document.dateArrival), "dd/MM/yyyy")
                  : ""
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
              Ngày nhận văn bản:
            </label>
            <div className="flex-1">
              {renderField(
                detail.document?.receivedDate
                  ? format(new Date(detail.document.receivedDate), "dd/MM/yyyy")
                  : ""
              )}
            </div>
          </div>
        </div>
        {collapse && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Ngày vào sổ:
              </label>
              <div className="flex-1">
                {renderField(
                  detail.document?.dateIssued
                    ? format(new Date(detail.document.dateIssued), "dd/MM/yyyy")
                    : ""
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Phương thức nhận:
              </label>
              <div className="flex-1">
                {renderField(detail.methodReceiptName ?? "")}
              </div>
            </div>
          </div>
        )}
        {collapse && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Loại văn bản:
              </label>
              <div className="flex-1">
                {renderField(detail.docTypeName ?? "")}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Trạng thái văn bản:
              </label>
              <div className="flex-1">
                {renderField(detail?.docStatusName ?? "")}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {collapse && (
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Hạn xử lý (bằng số):
              </label>
              <div className="flex-1">{renderField(dateLeftText || "")}</div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
              Trích yếu:
            </label>
            <div className="flex-1">
              {renderField(detail.document?.preview ?? "")}
            </div>
          </div>
        </div>
        {collapse && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                Đơn vị nhận lưu:
              </label>
              <div className="flex-1">
                {renderField(detail.document?.orgReceiveDocument ?? "")}
              </div>
            </div>
            {Constant.SHOW_HSLT_BCY && (
              <div className="flex items-start gap-2">
                <label className="text-sm font-bold text-black text-right w-[120px] flex-shrink-0">
                  Thuộc hồ sơ:
                </label>
                <div className="flex-1">
                  <div className="text-sm text-gray-900 font-medium">
                    {hstlList.length > 0
                      ? hstlList.map((item, idx) => (
                          <>
                            <a
                              key={idx}
                              onClick={() => onOpenDocumentList(item)}
                              style={{ cursor: "pointer", marginRight: "5px" }}
                            >
                              {item.name}
                            </a>
                            <span>
                              <PlusIcon onClick={onOpenSelectHSTL} />
                            </span>
                          </>
                        ))
                      : "Chưa có"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-black text-right w-[120px] min-w-[120px] flex-shrink-0">
              Gắn nhãn:
            </label>
            <AddLable
              isAddDialogOpen={isAddDialogOpen}
              handleDialogOpenChange={handleDialogOpenChange}
              newLabelName={newLabelName}
              setNewLabelName={setNewLabelName}
              onClose={handleCancel}
              onCreated={(label) => {
                const isAlreadySelected = selectedItems.some(
                  (s) => String(s.id) === String(label.id)
                );
                if (!isAlreadySelected) {
                  onChangeTags([...(selectedItems || []), label as any]);
                }
              }}
              renderBtn={() => (
                <button
                  className="h-6 border rounded px-1 text-xs text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#3a7bc8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#4798e8")
                  }
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            />
            <div className="flex-1 max-w-[calc(100%-120px)]">
              <div className="min-h-9">
                <MultiSelect
                  options={dropdownList}
                  value={selectedItems}
                  onChange={onChangeTags as any}
                  placeholder="Chọn nhãn"
                  className="w-full min-h-9"
                  showNumberOfItems
                />
              </div>
            </div>
          </div>
        </div>
        {!isVanthuDv && (
          <div
            className="mt-4 text-sm text-blue-600 cursor-pointer text-center"
            onClick={onToggle}
          >
            {collapse ? "Thu gọn" : "Xem thêm"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralInfoCard;
