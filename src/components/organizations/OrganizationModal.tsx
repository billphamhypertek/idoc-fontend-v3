"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import SelectCustom from "../common/SelectCustom";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useGetCategoryWithCode } from "@/hooks/data/document-out.data";
import { Constant } from "@/definitions/constants/constant";
import { OrganizationService } from "@/services/organization.service";
import { UserService } from "@/services/user.service";
import { Plus, Save, Search, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import OrgTreeSelect from "../dashboard/OrgTreeSelect";
import type { OrgTreeNode } from "@/definitions/types/orgunit.type";
import { detectOrgNodeType } from "@/definitions/types/orgunit.type";
import TextSignUserModal from "./textSignUserModal";
import { handleError } from "@/utils/common.utils";
import { getDefaultOrganizationFormValues } from "@/utils/formValue.utils";

interface OrganizationModalProps {
  editMode?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationData?: any;
  onSuccess?: () => void;
  isAddRootOrg?: boolean;
}

export default function OrganizationModal({
  editMode = false,
  isOpen,
  onOpenChange,
  organizationData,
  onSuccess,
  isAddRootOrg = false,
}: OrganizationModalProps) {
  const ORG_CONFIG_SIGNER_BCY = Constant.ORG_CONFIG_SIGNER_BCY;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedParentOrg, setSelectedParentOrg] =
    useState<OrgTreeNode | null>(null);
  const [isPhongHanhChinh, setIsPhongHanhChinh] = useState(false);

  const [isSignUserModalOpen, setIsSignUserModalOpen] = useState(false);
  const [selectedSignUser, setSelectedSignUser] = useState<any>(null);
  const [places, setPlaces] = useState<string[]>([]);
  const [placeTmp, setPlaceTmp] = useState("");
  const [thuaLenh, setThuaLenh] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: organizationType } = useGetCategoryWithCode(
    Constant.CATEGORYTYPE_CODE.ORG_TYPE
  );

  useEffect(() => {
    if (organizationData && organizationData.orgType === 406) {
      setIsPhongHanhChinh(true);
    } else {
      setIsPhongHanhChinh(false);
    }
  }, [organizationData]);

  const form = useForm({
    defaultValues: getDefaultOrganizationFormValues(),
  });

  useEffect(() => {
    if (editMode && organizationData) {
      form.reset(
        getDefaultOrganizationFormValues(organizationData, isAddRootOrg)
      );

      if (ORG_CONFIG_SIGNER_BCY && organizationData.orgConfigSign) {
        const orgConfig = organizationData.orgConfigSign;
        if (orgConfig.place) {
          setPlaces(orgConfig.place.split("|").filter((p: string) => p.trim()));
        }
        if (orgConfig.tl) {
          setThuaLenh(orgConfig.tl);
        }
        if (orgConfig.userId && Number(orgConfig.userId) > 0) {
          // Gọi API để lấy thông tin user
          UserService.findByUserIdFormData(orgConfig.userId)
            .then((userData: any) => {
              setSelectedSignUser({
                id: userData.id,
                fullName: userData.fullName,
                position: userData.positionModel?.name || "",
                orgName: userData.orgModel?.name || "",
              });
            })
            .catch((error) => {
              console.error("Error loading sign user:", error);
            });
        }
      }
    } else {
      form.reset(getDefaultOrganizationFormValues(undefined, isAddRootOrg));

      // Nếu có organizationData (đơn vị được chọn từ tree), tự động set làm đơn vị cấp trên
      if (organizationData && !isAddRootOrg) {
        let orgType: "org" | "room" | "leadership" = "org";
        try {
          // Thử detect type từ organizationData nếu có đủ thông tin
          if (
            organizationData.orgTypeModel ||
            organizationData.level !== undefined
          ) {
            orgType = detectOrgNodeType(organizationData as any);
          }
        } catch {
          // Fallback về "org" nếu không detect được
          orgType = "org";
        }

        const parentOrgNode: OrgTreeNode = {
          id: String(organizationData.id),
          name: organizationData.name || "",
          parentId: organizationData.parentId
            ? String(organizationData.parentId)
            : null,
          type: orgType,
        };
        setSelectedParentOrg(parentOrgNode);
        form.setValue("parentId", String(organizationData.id));
      } else {
        setSelectedParentOrg(null);
        form.setValue(
          "parentId",
          organizationData?.parentId || organizationData?.id
        );
      }

      if (ORG_CONFIG_SIGNER_BCY) {
        setSelectedSignUser(null);
        setPlaces([]);
        setPlaceTmp("");
        setThuaLenh("");
        setLogoFile(null);
      }
    }
  }, [
    editMode,
    organizationData,
    isOpen,
    form,
    isAddRootOrg,
    ORG_CONFIG_SIGNER_BCY,
  ]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const submitData: any = {
        id: editMode ? data.id : 0,
        name: data.name,
        phone: data.phone || "",
        address: data.address || "",
        email: data.email || "",
        level: data.level || 0,
        parentId: isAddRootOrg ? null : selectedParentOrg?.id || data.parentId,
        orgType: data.orgType ? Number(data.orgType) : null,
        orgs: [],
        expiryDate: "",
        order: data.order ? Number(data.order) : null,
        active: data.active === "true",
        selected: false,
        client: null,
        idCode: "",
        identifier: data.identifier || "",
        organld: "",
        logo: "",
        linkLogo: data.linkLogo || "",
        global: data.global || false,
        isPermissionViewAll: data.isPermissionViewAll || false,
        adminOffice: data.adminOffice || false,
        orgConfigSign: ORG_CONFIG_SIGNER_BCY
          ? {
              id: "",
              place: places.join("|"),
              userId: selectedSignUser?.id || "",
              tl: thuaLenh,
            }
          : undefined,
      };

      if (editMode) {
        const formDataObj = new FormData();
        formDataObj.append(
          "organization",
          new Blob([JSON.stringify(submitData)], { type: "application/json" })
        );

        if (logoFile) {
          formDataObj.append("logo", logoFile);
        }

        await OrganizationService.doSaveOrganization(data.id, formDataObj);
      } else {
        await OrganizationService.doSaveNewOrganization(submitData);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const organizationTypeOptions =
    organizationType
      ?.map((item: any) => ({
        label: item.name,
        value: String(item.id),
      }))
      .filter(
        (option: any) =>
          option.value !== "" &&
          option.value !== null &&
          option.value !== undefined
      ) || [];

  const handleAddPlace = () => {
    if (placeTmp.trim()) {
      setPlaces([...places, placeTmp.trim()]);
      setPlaceTmp("");
    }
  };

  const handleRemovePlace = (index: number) => {
    setPlaces(places.filter((_, i) => i !== index));
  };

  const handleSelectSignUser = (user: any) => {
    setSelectedSignUser(user);
    setIsSignUserModalOpen(false);
  };

  const handleRemoveSignUser = () => {
    setSelectedSignUser(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>
            {editMode
              ? "Cập nhật đơn vị"
              : isAddRootOrg
                ? "Thêm mới đơn vị"
                : "Thêm mới đơn vị cấp dưới"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-1">
          <Form {...form}>
            <form
              id="organization-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {editMode && form.watch("id") && (
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                      <FormLabel className="text-right self-center font-semibold">
                        Mã đơn vị
                      </FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input {...field} disabled className="bg-gray-50" />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Mã định danh
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input {...field} placeholder="Nhập mã định danh" />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Tên đơn vị không được để trống" }}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-start pt-3 font-semibold text-black">
                      Tên đơn vị <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập tên đơn vị"
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="mt-1" />
                    </div>
                  </FormItem>
                )}
              />

              {!isAddRootOrg && (
                <div className="grid grid-cols-4 gap-4 space-y-0">
                  <Label className="text-right self-center font-semibold">
                    Đơn vị cấp trên
                  </Label>
                  <div className="col-span-3">
                    <OrgTreeSelect
                      value={selectedParentOrg?.id || form.watch("parentId")}
                      onChange={(node: OrgTreeNode) => {
                        setSelectedParentOrg(node);
                        form.setValue("parentId", node.id);
                      }}
                      placeholder="Chọn đơn vị cấp trên"
                      className="w-full h-9 [&>span]:text-black [&>svg]:text-black focus:border-gray-200 focus:ring-0 text-sm border-gray-200"
                      disabled={!editMode && !!organizationData} //allowSelectTypes={["org"]}
                    />
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="orgType"
                rules={{
                  required: "Loại đơn vị phải được chọn",
                  validate: (value) =>
                    value !== "placeholder" || "Loại đơn vị phải được chọn",
                }}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-start pt-3 font-semibold text-black">
                      Loại đơn vị <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <SelectCustom
                          options={[
                            { label: "--Chọn--", value: "placeholder" },
                            ...organizationTypeOptions,
                          ]}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            if (value === "406") {
                              setIsPhongHanhChinh(true);
                            } else {
                              setIsPhongHanhChinh(false);
                              form.setValue("adminOffice", false);
                            }
                          }}
                          placeholder="--Chọn loại đơn vị--"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage className="mt-1" />
                    </div>
                  </FormItem>
                )}
              />

              {isPhongHanhChinh && (
                <FormField
                  control={form.control}
                  name="adminOffice"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                      <FormLabel className="text-right self-center font-semibold">
                        Phòng hành chính
                      </FormLabel>
                      <div className="col-span-3 flex items-center">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Số điện thoại
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập số điện thoại"
                          maxLength={50}
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không đúng định dạng",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Thư điện tử
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Nhập email"
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Địa chỉ
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập địa chỉ"
                          maxLength={200}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                rules={{ required: "Trạng thái phải được chọn" }}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Trạng thái <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <SelectCustom
                          options={[
                            { label: "Hoạt động", value: "true" },
                            { label: "Không hoạt động", value: "false" },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                rules={{
                  min: {
                    value: 1,
                    message: "Thứ tự ưu tiên phải lớn hơn 0",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Thứ tự ưu tiên
                    </FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input
                          {...field}
                          id="order"
                          type="text"
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onKeyDown={(e) => {
                            if (["-", "e", "E", "+", "."].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value; // string
                            if (value === "") {
                              field.onChange(null);
                              return;
                            }
                            const parsed = parseInt(value, 10);
                            if (Number.isNaN(parsed)) return;

                            const safe = parsed < 0 ? 0 : parsed;
                            field.onChange(safe);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === "") return;
                            const parsed = parseInt(value, 10);
                            if (Number.isNaN(parsed) || parsed < 0) {
                              field.onChange(0);
                            }
                          }}
                          placeholder="Nhập thứ tự ưu tiên"
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {ORG_CONFIG_SIGNER_BCY && (
                <>
                  <div className="grid grid-cols-4 gap-4 space-y-0">
                    <Label className="text-right self-start pt-3 font-semibold">
                      Nơi nhận
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập nơi nhận"
                          value={placeTmp}
                          onChange={(e) => setPlaceTmp(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddPlace()
                          }
                          maxLength={500}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddPlace}
                          disabled={!placeTmp.trim()}
                          className="px-4 text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm
                        </Button>
                      </div>
                      {places.length > 0 && (
                        <div>
                          {places.map((place, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePlace(index)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <span className="flex-1 text-sm">{place}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 space-y-0">
                    <Label className="text-right self-center font-semibold">
                      Người ký
                    </Label>
                    <div className="col-span-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Chọn người ký"
                          value={
                            selectedSignUser
                              ? `${selectedSignUser.fullName} - ${selectedSignUser.position}`
                              : ""
                          }
                          disabled
                          className="flex-1"
                        />
                        {selectedSignUser && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveSignUser}
                            className="px-3"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsSignUserModalOpen(true)}
                          className="px-4 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                        >
                          <Search className="w-4 h-4" />
                          Tìm kiếm
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 space-y-0">
                    <Label className="text-right self-center font-semibold">
                      Thừa lệnh
                    </Label>
                    <div className="col-span-3">
                      <Input
                        placeholder="Nhập lãnh đạo"
                        value={thuaLenh}
                        onChange={(e) => setThuaLenh(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 space-y-0">
                    <Label className="text-right self-center font-semibold">
                      Logo đơn vị
                    </Label>
                    <div className="col-span-3 flex items-center gap-4">
                      <div>
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("logo-upload")?.click()
                          }
                          className="px-4 text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
                        >
                          <Upload className="w-4 h-4" />
                          {logoFile ? "Thay đổi logo" : "Tải ảnh lên"}
                        </Button>
                      </div>
                      <Input
                        placeholder="Nhập đường dẫn liên kết"
                        value={form.watch("linkLogo") || ""}
                        onChange={(e) =>
                          form.setValue("linkLogo", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 gap-4 space-y-0">
                <Label className="text-right self-center font-semibold">
                  Đăng ký lịch lãnh đạo
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox />
                </div>
              </div>

              <FormField
                control={form.control}
                name="global"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Đăng ký liên kết hệ thống ngoài
                    </FormLabel>
                    <div className="col-span-3 flex items-center">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPermissionViewAll"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 gap-4 space-y-0">
                    <FormLabel className="text-right self-center font-semibold">
                      Quyền xem tất cả văn bản
                    </FormLabel>
                    <div className="col-span-3 flex items-center">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="submit"
            form="organization-form"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            <span className="leading-none">
              {isLoading ? "Đang lưu..." : "Lưu lại"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="inline-flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            <span className="leading-none">Đóng</span>
          </Button>
        </DialogFooter>
      </DialogContent>

      <TextSignUserModal
        isOpen={isSignUserModalOpen}
        onOpenChange={setIsSignUserModalOpen}
        onSelectUser={handleSelectSignUser}
        selectedUser={selectedSignUser}
      />
    </Dialog>
  );
}
