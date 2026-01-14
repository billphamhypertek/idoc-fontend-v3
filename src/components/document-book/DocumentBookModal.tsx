"use client";
import React, { useState, useEffect } from "react";
import {
  DocumentBook,
  DocumentBookCreateUpdateRequest,
} from "@/definitions/types/document-book.type";
import { CategoryCode } from "@/definitions/types/category.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SelectCustom from "@/components/common/SelectCustom";
import DropdownTree, { TreeNode } from "@/components/common/DropdownTree";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetOrganizations } from "@/hooks/data/organization.data";
import {
  useCreateDocumentBook,
  useUpdateDocumentBook,
} from "@/hooks/data/document-book.data";
import { Constant } from "@/definitions/constants/constant";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import {
  getDataEncryptDocBook,
  setDataEncryptDocBook,
  removeDataEncryptDocBook,
} from "@/utils/token.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentBookModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentBook?: DocumentBook | null;
  isView?: boolean;
  onSuccess?: () => void;
  encryptShowing?: boolean;
  onEncryptShowingChange?: (value: boolean) => void;
}

export default function DocumentBookModal({
  isOpen,
  onOpenChange,
  documentBook,
  isView = false,
  onSuccess,
  encryptShowing: propEncryptShowing,
  onEncryptShowingChange,
}: DocumentBookModalProps) {
  // State
  const [formData, setFormData] = useState<DocumentBook>({
    name: "",
    numberOrSign: "",
    currentNumber: 0,
    startNumber: 0,
    bookType: -1,
    year: new Date().getFullYear(),
    active: true,
    categoryIds: [],
    orgIds: [],
    code: "",
  });

  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Use propEncryptShowing if provided, otherwise fallback to localStorage
  const encryptShowing =
    propEncryptShowing !== undefined
      ? propEncryptShowing
      : (() => {
          const value = getDataEncryptDocBook();
          return value === "true";
        })();

  // Data hooks
  const { data: securityCategories } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.SECURITY
  );
  const { data: orgList } = useGetOrganizations({ active: true });

  // Mutations
  const { mutate: createDocumentBook, isPending: isCreating } =
    useCreateDocumentBook();
  const { mutate: updateDocumentBook, isPending: isUpdating } =
    useUpdateDocumentBook();

  // Computed values
  const documentBookType = Constant.DOCUMENT_BOOK_TYPE;
  const isEdit = !!documentBook?.id;
  const isLoading = isCreating || isUpdating;

  // Filter security categories based on encrypt showing
  const filteredSecurityCategories = React.useMemo(() => {
    if (!securityCategories) return [];

    if (encryptShowing) {
      return securityCategories.filter((item) => item.id !== 135);
    } else {
      return securityCategories.filter((item) => item.id === 135);
    }
  }, [securityCategories, encryptShowing]);

  // Handle encrypt showing change (similar to doChangeToLoadListBook)
  const doChangeToLoadListBook = React.useCallback(() => {
    console.log("check encrypt showing >>> ", encryptShowing);
    if (encryptShowing) {
      setDataEncryptDocBook(true);
    } else {
      removeDataEncryptDocBook();
    }
    // Filter selected categories to match filtered security categories
    setSelectedCategories((prev) =>
      prev.filter((id) =>
        filteredSecurityCategories.some((item) => item.id === id)
      )
    );
  }, [encryptShowing, filteredSecurityCategories]);

  // Handle encrypt showing change
  const handleEncryptShowingChange = (value: boolean) => {
    if (onEncryptShowingChange) {
      onEncryptShowingChange(value);
    }
    // Filter selected categories to match filtered security categories
    setSelectedCategories((prev) =>
      prev.filter((id) =>
        filteredSecurityCategories.some((item) => item.id === id)
      )
    );
  };

  // Convert orgList to tree structure
  const convertToTree = (orgs: any[]): TreeNode[] => {
    if (!orgs) return [];

    const orgMap = new Map();
    const rootNodes: TreeNode[] = [];

    // Create map of all organizations
    orgs.forEach((org) => {
      orgMap.set(org.id, {
        id: org.id,
        name: org.name,
        parentId: org.parentId,
        children: [],
      });
    });

    // Build tree structure
    orgs.forEach((org) => {
      const node = orgMap.get(org.id);
      if (org.parentId && orgMap.has(org.parentId)) {
        const parent = orgMap.get(org.parentId);
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  // Initialize form data
  useEffect(() => {
    if (documentBook) {
      setFormData({
        ...documentBook,
        categoryIds: documentBook.categoryIds || [],
        orgIds: documentBook.orgIds || [],
        code: documentBook.code || "",
      });
      setSelectedOrgs(documentBook.orgIds || []);
      setSelectedCategories(documentBook.categoryIds || []);
    } else {
      setFormData({
        name: "",
        numberOrSign: "",
        currentNumber: 0,
        startNumber: 0,
        bookType: -1,
        year: new Date().getFullYear(),
        active: true,
        categoryIds: [],
        orgIds: [],
        code: "",
      });
      setSelectedOrgs([]);
      setSelectedCategories([]);
    }
    // Call doChangeToLoadListBook on mount like Angular version
    doChangeToLoadListBook();
  }, [documentBook, doChangeToLoadListBook]);

  // Handle form submission
  const handleSubmit = () => {
    // Validation logic similar to doSaveDocumentBook
    if (Constant.ORG_CONFIG_BCY && selectedOrgs.length === 0) {
      ToastUtils.error("Đơn vị không được để trống");
      return;
    }

    if (!formData.name.trim()) {
      ToastUtils.error("Tên sổ văn bản không được để trống");
      return;
    }

    if (!formData.year) {
      ToastUtils.error("Năm không được để trống");
      return;
    }

    if (formData.year.toString().length < 4) {
      ToastUtils.error("Năm không đúng định dạng");
      return;
    }

    if (formData.bookType === -1) {
      ToastUtils.error("Loại sổ không được để trống");
      return;
    }

    if (formData.startNumber < 0) {
      ToastUtils.error("Số bắt đầu không được âm");
      return;
    }

    if (formData.currentNumber < 0) {
      ToastUtils.error("Số hiện tại không được âm");
      return;
    }

    if (formData.currentNumber < formData.startNumber) {
      ToastUtils.error("Số hiện tại không được nhỏ hơn số bắt đầu");
      return;
    }

    if (selectedCategories.length === 0) {
      ToastUtils.error("Phải chọn ít nhất một mức độ bảo mật");
      return;
    }

    // Save encryptShowing to localStorage like Angular version
    if (encryptShowing) {
      setDataEncryptDocBook(true);
    } else {
      removeDataEncryptDocBook();
    }

    const requestData: DocumentBookCreateUpdateRequest = {
      db: {
        ...formData,
        orgIds: selectedOrgs,
        categoryIds: selectedCategories,
      },
      orgIds: selectedOrgs,
      categoryIds: selectedCategories,
    };

    if (isEdit) {
      updateDocumentBook(
        { id: documentBook!.id!, data: requestData },
        {
          onSuccess: () => {
            ToastUtils.success("Cập nhật sổ văn bản thành công");
            onSuccess?.();
            onOpenChange(false);
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    } else {
      createDocumentBook(requestData, {
        onSuccess: () => {
          ToastUtils.success("Tạo sổ văn bản thành công");
          onSuccess?.();
          onOpenChange(false);
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold">
            {isView
              ? "Xem sổ văn bản"
              : isEdit
                ? "Sửa sổ văn bản"
                : "Thêm sổ văn bản"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Hàng 1: Hiển thị + Tên sổ văn bản */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="encryptShowing" className="font-bold">
                Hiển thị
              </Label>
              <SelectCustom
                className="h-10"
                value="false"
                onChange={(value: string | string[]) => {
                  const boolValue = Array.isArray(value)
                    ? value[0] === "true"
                    : value === "true";
                  handleEncryptShowingChange(boolValue);
                }}
                options={[
                  { label: "Văn bản thường", value: "false" },
                  { label: "Văn bản mật", value: "true" },
                ]}
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">
                Tên sổ văn bản *
              </Label>
              <Input
                id="name"
                className="h-10"
                placeholder="Tên sổ văn bản"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isView}
                maxLength={100}
              />
            </div>
          </div>

          {/* Hàng 2: Năm + Loại sổ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="font-bold">
                Năm *
              </Label>
              <Input
                id="year"
                className="h-10"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    year: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isView}
                min="1900"
                max="2100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookType" className="font-bold">
                Loại sổ *
              </Label>
              <SelectCustom
                className="h-10"
                value={
                  formData.bookType === -1 ? "" : formData.bookType.toString()
                }
                onChange={(value: string | string[]) => {
                  const numValue = Array.isArray(value)
                    ? parseInt(value[0])
                    : parseInt(value);
                  setFormData((prev) => ({
                    ...prev,
                    bookType: isNaN(numValue) ? -1 : numValue,
                  }));
                }}
                options={[
                  ...documentBookType.map((item) => ({
                    label: item.name,
                    value: item.code.toString(),
                  })),
                ]}
                disabled={isView}
              />
            </div>
          </div>

          {/* Hàng 3: Ký hiệu + Số bắt đầu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOrSign" className="font-bold">
                Ký hiệu
              </Label>
              <Input
                id="numberOrSign"
                className="h-10"
                value={formData.numberOrSign || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                disabled={isView}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startNumber" className="font-bold">
                Số bắt đầu *
              </Label>
              <Input
                id="startNumber"
                className="h-10"
                type="number"
                value={formData.startNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startNumber: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isView}
                min="0"
              />
            </div>
          </div>

          {/* Hàng 4: Số hiện tại + Độ mật */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentNumber" className="font-bold">
                Số hiện tại *
              </Label>
              <Input
                id="currentNumber"
                className="h-10"
                type="number"
                value={formData.currentNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentNumber: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isView}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categories" className="font-bold">
                Độ mật *
              </Label>
              <DropdownTree
                value={selectedCategories}
                onChange={(value) => {
                  setSelectedCategories(value as number[]);
                }}
                dataSource={filteredSecurityCategories.map((item) => ({
                  id: item.id,
                  name: item.name,
                  parentId: null,
                  children: [],
                }))}
                placeholder="Chọn độ mật"
                multiple={true}
                disabled={isView}
              />
            </div>
          </div>

          {/* Hàng 5: Mã số - Full width */}
          <div className="space-y-2">
            <Label htmlFor="code" className="font-bold">
              Mã sổ
            </Label>
            <Input
              id="code"
              className="h-10"
              type="number"
              value={formData.code || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value,
                }))
              }
              disabled={isView}
              maxLength={4}
            />
          </div>

          {/* Hàng 6: Đơn vị quản lý - Full width */}
          {Constant.ORG_CONFIG_BCY && (
            <div className="space-y-2">
              <Label htmlFor="orgs" className="font-bold">
                Đơn vị quản lý *
              </Label>
              <DropdownTree
                value={selectedOrgs}
                onChange={(value) => {
                  setSelectedOrgs(value as number[]);
                }}
                dataSource={convertToTree(orgList || [])}
                placeholder="-- Chọn đơn vị --"
                multiple={true}
                disabled={isView}
              />
            </div>
          )}

          {/* Trạng thái - ẩn đi hoặc giữ lại nếu cần */}
          <div className="space-y-2 hidden">
            <Label htmlFor="active" className="font-bold">
              Trạng thái
            </Label>
            <SelectCustom
              value={formData.active ? "true" : "false"}
              onChange={(value: string | string[]) => {
                const boolValue = Array.isArray(value)
                  ? value[0] === "true"
                  : value === "true";
                setFormData((prev) => ({ ...prev, active: boolValue }));
              }}
              options={[
                { label: "Hoạt động", value: "true" },
                { label: "Không hoạt động", value: "false" },
              ]}
              disabled={isView}
            />
          </div>
        </div>

        {/* Actions */}
        {!isView && (
          <div className="flex justify-between gap-2 pt-4 border-t">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Lưu lại"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Đóng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
