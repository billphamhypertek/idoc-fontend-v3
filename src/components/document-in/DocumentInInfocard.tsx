"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Paperclip,
  PlusIcon,
} from "lucide-react";
import { MultiSelect } from "@/components/ui/mutil-select";
import { Input } from "@/components/ui/input";
import type { TagItem } from "@/components/document-out/types";
import AddLable from "../label/AddLable";
import { Draft } from "@/definitions/types/document.type";
import ReplyDocSelection from "@/components/document-in/ReplyDocSelection";
import ReplyTaskSelection from "@/components/document-in/ReplyTaskSelection";
import { useAuth } from "@/hooks/auth/useAuth";
import useAuthStore from "@/stores/auth.store";

export interface DocumentInInfoCardProps {
  draft: Draft;
  collapse: boolean;
  onToggle: () => void;
  dropdownList: TagItem[];
  selectedItems: TagItem[];
  onChangeTags: (items: TagItem[]) => void;
}

const DocumentInInfoCard: React.FC<DocumentInInfoCardProps> = ({
  draft,
  collapse,
  onToggle,
  dropdownList,
  selectedItems,
  onChangeTags,
}) => {
  const { user } = useAuthStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const isVanthuDv = !!user?.positionModel.name
    .toLowerCase()
    .includes("văn thư");
  const [isLabelCollapsed, setIsLabelCollapsed] = useState(isVanthuDv);
  // Define which fields are editable
  const editableFields = {
    preview: false, // Trích yếu - changed to label
    note: false, // Ghi chú - changed to label
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
  };
  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setNewLabelName("");
  };
  const getDocNumber = () => {
    const numberOrSign = draft.numberOrSign ?? "";
    const numberInBook = draft.numberInBook ?? "";

    if (numberOrSign.startsWith(numberInBook)) {
      return numberOrSign;
    }
    return numberInBook + numberOrSign;
  };

  const renderField = (
    fieldName: string,
    value: string,
    isEditable: boolean = false
  ) => {
    if (isEditable) {
      return (
        <Input
          value={value}
          onChange={() => {}} // TODO: Add proper onChange handler
          className="h-9 text-sm bg-white"
          disabled={false}
        />
      );
    }
    return <label className="text-sm text-black font-medium">{value}</label>;
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
          {collapse ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {collapse && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Đơn vị soạn thảo:
              </label>
              <div className="flex-1 text-left">
                {renderField("orgCreateName", draft.orgCreateName ?? "")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Người soạn thảo:
              </label>
              <div className="flex-1 text-left">
                {renderField("personEnterName", draft.personEnterName ?? "")}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Ký hiệu:
              </label>
              <div className="flex-1 text-left">
                {renderField("numberOrSign", getDocNumber())}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Sổ văn bản:
              </label>
              <div className="flex-1 text-left">
                {renderField("bookName", draft.bookName ?? "")}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Độ mật:
              </label>
              <div className="flex-1 text-left">
                {renderField("docSecurityName", draft.docSecurityName ?? "")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Độ khẩn:
              </label>
              <div className="flex-1 text-left">
                {renderField("docUrgentName", draft.docUrgentName ?? "")}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Loại văn bản:
              </label>
              <div className="flex-1 text-left">
                {renderField("docTypeName", draft.docTypeName ?? "")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Phúc đáp văn bản:
              </label>
              <div className="flex-1 text-left">
                {renderField("replyDoc", draft.replyDoc ? "Có" : "Không")}
              </div>
            </div>
          </div>
          {isLabelCollapsed && (
            <>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0 mt-1">
                    Nơi nhận nội bộ:
                  </label>
                  <div className="flex-1 text-left text-sm text-black font-medium flex-col flex">
                    {draft.listReceive?.map((user) => (
                      <div
                        key={user.fullName}
                        className="inline-block my-1 mr-2"
                      >
                        {user.positionName} - {user.fullName}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                    Nơi nhận bên ngoài:
                  </label>
                  <div className="flex-1 text-left text-sm text-black font-medium flex-col flex">
                    {draft.outsideReceives?.map((user) => (
                      <div key={user.address} className="d-inline-block my-1">
                        {user.address}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-2">
                  <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0 pt-[2px] leading-tight">
                    Nơi nhận bên ngoài: <br /> (Trục liên thông)
                  </label>
                  <div className="flex-1 text-left text-sm text-black font-medium flex flex-col flex-nowrap items-start overflow-x-auto">
                    {draft.outsideReceiveLgsps?.map((user) => (
                      <div
                        key={user.id || user.name}
                        className="inline-block mr-3 whitespace-nowrap"
                      >
                        {user.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                    Người ký:
                  </label>
                  <div className="flex-1 text-left text-sm text-black font-medium flex flex-col flex-nowrap items-start overflow-x-auto">
                    {draft.listSignersName?.split(",").map((user) => (
                      <div key={user}>{user}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/*TODO Constant.SHOW_HSLT_BCY always false*/}
          {/*{Constant.SHOW_HSLT_BCY && (*/}
          {/*    <div className="flex flex-col space-y-1.5">*/}
          {/*        <label className="text-sm font-medium text-gray-600">*/}
          {/*            Thuộc hồ sơ:*/}
          {/*        </label>*/}
          {/*        <p className="text-sm text-gray-900 font-medium bg-gray-50 px-2 py-1 rounded-md border min-h-[28px]">*/}
          {/*            {hstlList.length > 0*/}
          {/*                ? hstlList.map((item, idx) => (*/}
          {/*                    <>*/}
          {/*                        <a*/}
          {/*                            key={idx}*/}
          {/*                            onClick={() => onOpenDocumentList(item)}*/}
          {/*                            style={{ cursor: "pointer", marginRight: "5px" }}*/}
          {/*                        >*/}
          {/*                            {item.name}*/}
          {/*                        </a>*/}
          {/*                        <span>*/}
          {/*                <PlusIcon onClick={onOpenSelectHSTL} />*/}
          {/*              </span>*/}
          {/*                    </>*/}
          {/*                ))*/}
          {/*                : "Chưa có"}*/}
          {/*        </p>*/}
          {/*    </div>*/}
          {/*)}*/}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Trích yếu:
              </label>
              <div className="flex-1 text-left">
                {renderField(
                  "preview",
                  draft.preview ?? "",
                  editableFields.preview
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] flex-shrink-0">
                Ghi chú:
              </label>
              <div className="flex-1 text-left">
                {renderField("note", draft.note ?? "", editableFields.note)}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black text-right w-[130px] min-w-[130px] flex-shrink-0">
                Gắn nhãn:
              </label>
              <div className="flex-1 text-left max-w-[calc(100%-130px)]">
                <div className="flex items-center space-x-2 min-h-9">
                  <MultiSelect
                    options={dropdownList}
                    value={selectedItems}
                    onChange={onChangeTags as any}
                    placeholder="Chọn nhãn"
                    className="w-full min-h-9"
                    showNumberOfItems
                  />
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
                      <button className="h-6 border rounded px-1 text-xs text-white bg-[#4798e8] hover:bg-[#3a7bc8]">
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {draft.replyDoc && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mt-1  min-h-[28px]">
                <ReplyDocSelection editable={false} data={draft.listReplyDoc} />
              </div>
            </div>
          )}
          {!isVanthuDv && (
            <div
              className="flex justify-center mt-4 text-sm text-blue-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // tránh bật/tắt toàn bộ card
                setIsLabelCollapsed((v) => !v);
              }}
            >
              {isLabelCollapsed ? "Thu gọn" : "Xem thêm"}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DocumentInInfoCard;
