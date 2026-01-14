import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectCustom from "@/components/common/SelectCustom";
import { useUpdateCreateWatchList } from "@/hooks/data/watch-list.action";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/utils/common.utils";
import { extractDateFromVietnameseString } from "@/utils/datetime.utils";
import { getDefaultFormValuesWatchList } from "@/utils/formValue.utils";
import {
  watchItemFormSchema,
  type WatchItemFormData,
} from "@/schemas/watch-item.schema";
import { X, Save, XCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGetOrgParentByOrgId,
  useGetTaskLeadByOrgId,
  useGetUserByOrgId,
} from "@/hooks/data/watch-list.data";
import { ToastUtils } from "@/utils/toast.utils";

interface UserAction {
  createInBan: boolean;
  approveInUnit: boolean;
}

interface User {
  fullName: string;
  positionName: string;
}

interface WatchUpdateItem {
  orgName: string;
  date: string;
  handler: string;
  departmentName: string;
  handlerPosition: string;
  schedulePosition: string;
  handlerPhone: string;
  orgId: number;
}

interface WatchItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watchDateStr: string;
  isUpdateForm?: boolean;
  isCreateTrucChiHuy?: boolean;
  userAction?: UserAction;
  orgSelected?: any;
  orgName?: string;
  departmentName?: string;
  listUserAssign?: User[];
  editData?: WatchUpdateItem;
  listCVV?: any[];
}

export default function WatchItemModal({
  open,
  onOpenChange,
  watchDateStr,
  isUpdateForm = false,
  isCreateTrucChiHuy = false,
  userAction = { createInBan: false, approveInUnit: false },
  orgSelected,
  editData,
  listCVV,
}: WatchItemModalProps) {
  const form = useForm<WatchItemFormData>({
    resolver: zodResolver(watchItemFormSchema),
    defaultValues: getDefaultFormValuesWatchList(),
  });

  const [isCustomAddUser, setIsCustomAddUser] = useState(false);
  const { mutateAsync: updateCreateWatchList } = useUpdateCreateWatchList();
  const [listUserAssign, setListUserAssign] = useState<any[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<number | null>(null);
  const [isUserInList, setIsUserInList] = useState<boolean>(true);
  const [loadState, setLoadState] = useState({
    shouldLoadLeader: false,
    shouldLoadUser: false,
    shouldLoadOrg: false,
  });

  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const UserInfo = useMemo(() => {
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  // Create role options for SelectCustom
  const roleOptions = useMemo(() => {
    const options = [];

    if (userAction.createInBan && orgSelected.id === 2) {
      options.push({ label: "Trực chỉ huy Ban cơ yếu", value: "1" });
    }

    if (
      (isCreateTrucChiHuy || userAction.approveInUnit) &&
      orgSelected.id !== 2
    ) {
      options.push({ label: "Trực chỉ huy", value: "2" });
    }

    if (orgSelected.id !== 2) {
      options.push({ label: "Trực nghiệp vụ", value: "3" });
    }

    return options;
  }, [
    userAction.createInBan,
    userAction.approveInUnit,
    isCreateTrucChiHuy,
    orgSelected,
  ]);

  // Create user options for SelectCustom
  const userOptions = useMemo(() => {
    return [
      { label: "--- Chọn người trực ---", value: "null" },
      ...listUserAssign.map((user) => ({
        label: `${user.fullName} -- ${user.positionName}`,
        value: user.fullName,
      })),
    ];
  }, [listUserAssign]);

  // Hooks for loading data - optimized with single state
  const { data: taskLeadData } = useGetTaskLeadByOrgId(
    loadState.shouldLoadLeader ? currentOrgId || 0 : 0
  );
  const { data: userData } = useGetUserByOrgId(
    loadState.shouldLoadUser ? currentOrgId || 0 : 0
  );
  const { data: orgParentData } = useGetOrgParentByOrgId(
    loadState.shouldLoadOrg ? currentOrgId || 0 : 0
  );

  // Helper functions for state management
  const updateLoadState = (updates: Partial<typeof loadState>) => {
    setLoadState((prev) => ({ ...prev, ...updates }));
  };

  // Update listUserAssign when data changes - optimized
  useEffect(() => {
    if (loadState.shouldLoadLeader && taskLeadData) {
      setListUserAssign(taskLeadData);
      updateLoadState({ shouldLoadLeader: false });
    }
  }, [taskLeadData, loadState.shouldLoadLeader]);

  useEffect(() => {
    if (loadState.shouldLoadUser && userData) {
      setListUserAssign(userData);
      updateLoadState({ shouldLoadUser: false });
    }
  }, [userData, loadState.shouldLoadUser]);

  useEffect(() => {
    if (loadState.shouldLoadOrg && orgParentData) {
      updateLoadState({ shouldLoadOrg: false });
    }
  }, [orgParentData, loadState.shouldLoadOrg]);

  const getRoleValueFromOrgId = (orgId: number) => {
    if (!orgId) return null;

    if (orgId === 2 && userAction.createInBan) {
      return "1";
    }

    if (orgId !== 2 && (isCreateTrucChiHuy || userAction.approveInUnit)) {
      return "2";
    }

    if (orgId !== 2) {
      return "3";
    }

    return null;
  };

  useEffect(() => {
    if (editData && open) {
      const roleValue = getRoleValueFromOrgId(editData.orgId);

      form.reset({
        role: roleValue || "",
        org: editData.orgName,
        fullName: editData.handler,
        department: editData.departmentName,
        position: editData.handlerPosition,
        phone: editData.handlerPhone,
      });

      // Trigger load data based on role
      if (roleValue) {
        handleRoleChange(roleValue);
      }
    } else if (open && !editData) {
      // Reset form when opening for new item
      form.reset(getDefaultFormValuesWatchList());
      setIsCustomAddUser(false);

      // Set default role value to the first available option
      const defaultRole = roleOptions[0]?.value;
      if (defaultRole) {
        form.setValue("role", defaultRole);
        handleRoleChange(defaultRole);
      }
    }
  }, [editData, open, form]);

  // Check if user is in listUserAssign after data is loaded
  useEffect(() => {
    if (editData && open && listUserAssign.length > 0) {
      const userInList = listUserAssign.some(
        (user) => user.fullName === editData.handler
      );
      setIsUserInList(userInList);
      setIsCustomAddUser(!userInList);
    }
  }, [editData, open, listUserAssign]);

  const isBanCucVuVien = () => {
    return (
      UserInfo.orgModel?.parentId === 2 &&
      UserInfo.orgModel?.orgTypeModel?.name?.toLowerCase() === "cục vụ viện"
    );
  };

  const isBan = () => {
    return (
      UserInfo.org === 2 &&
      UserInfo.orgModel?.orgTypeModel?.name?.toLowerCase().includes("ban")
    );
  };

  const handleRoleChange = (value: string | string[]) => {
    const roleValue = Array.isArray(value) ? value[0] : value;
    form.setValue("role", roleValue);

    const isBanCucVuVienValue = isBanCucVuVien();
    const isBanValue = isBan();
    const isNotBanCucVuVienAndNotBan = !isBanCucVuVienValue && !isBanValue;
    const isBanCucVuVienOrBan = isBanCucVuVienValue || isBanValue;

    switch (roleValue) {
      case "1": // Trực chỉ huy Ban cơ yếu
        if (userAction.createInBan && (!isBanCucVuVienValue || isBanValue)) {
          form.setValue("org", "Ban Cơ yếu Chính phủ");
          form.setValue("department", "Ban Cơ yếu Chính phủ");
          setDepartmentId(2);
          setCurrentOrgId(2);
          updateLoadState({ shouldLoadLeader: true });
        }
        break;

      case "2": // Trực chỉ huy
        if (userAction.approveInUnit && isNotBanCucVuVienAndNotBan) {
          // Lãnh đạo đơn vị chỉ tạo lịch trực chỉ huy
          const orgName = listCVV?.find(
            (item) => item.id === UserInfo.orgModel?.parentId
          );
          form.setValue("org", orgName?.name || "");
          form.setValue("department", "Lãnh đạo đơn vị");
          setDepartmentId(UserInfo.orgModel?.parentId);
          setCurrentOrgId(UserInfo.orgModel?.parentId);
          updateLoadState({ shouldLoadLeader: true });
        } else if (isBanCucVuVienOrBan) {
          // Lãnh đạo đơn vị hoặc Ban
          const departmentName =
            UserInfo.orgModel?.name?.toLowerCase() === "ban cơ yếu chính phủ"
              ? "Lãnh đạo ban"
              : "Lãnh đạo đơn vị";
          form.setValue("org", UserInfo.orgModel?.name || "");
          form.setValue("department", departmentName);
          setCurrentOrgId(UserInfo.org);
          updateLoadState({ shouldLoadLeader: true });
        }
        break;

      case "3": // Trực nghiệp vụ
      default:
        form.setValue("department", UserInfo.orgModel?.name || "");
        setDepartmentId(UserInfo.org);
        setCurrentOrgId(UserInfo.org);
        updateLoadState({ shouldLoadUser: true, shouldLoadOrg: true });
        break;
    }
  };

  useEffect(() => {
    if (orgParentData?.name) {
      form.setValue("org", orgParentData.name);
    }
  }, [orgParentData, form]);

  const handlePersonChange = (value: string | string[]) => {
    const personValue = Array.isArray(value) ? value[0] : value;
    form.setValue("fullName", personValue);
    form.clearErrors("fullName");

    if (personValue === "null" || !personValue) {
      form.setValue("position", "");
      form.clearErrors("position");
    } else {
      const selectedUser = listUserAssign.find(
        (user) => user.fullName === personValue
      );
      if (selectedUser) {
        form.setValue("position", selectedUser.positionName);
      }
    }
  };

  const handleCheckboxChange = () => {
    const newValue = !isCustomAddUser;
    setIsCustomAddUser(newValue);
    form.clearErrors("fullName");
    form.clearErrors("position");

    let nextFullName = form.getValues("fullName");
    let nextPosition = form.getValues("position");

    if (newValue) {
      if (!nextFullName || nextFullName === "null") {
        if (editData?.handler) {
          const inList = listUserAssign.some(
            (user) => user.fullName === editData.handler
          );
          if (!inList) {
            nextFullName = editData.handler;
            nextPosition = editData.handlerPosition || "";
          } else {
            nextFullName = "";
          }
        } else {
          nextFullName = "";
        }
      }
    } else {
      const userInList = listUserAssign.find(
        (user) => user.fullName === nextFullName
      );

      if (userInList) {
        nextPosition = userInList.positionName;
      } else {
        if (editData?.handler) {
          const originalUser = listUserAssign.find(
            (user) => user.fullName === editData.handler
          );
          if (originalUser) {
            nextFullName = editData.handler;
            nextPosition = originalUser.positionName;
          } else {
            nextFullName = "null";
            nextPosition = "";
          }
        } else {
          nextFullName = "null";
          nextPosition = "";
        }
      }
    }

    form.setValue("fullName", nextFullName);
    form.setValue("position", nextPosition);
  };

  const handleSave = async (values: WatchItemFormData) => {
    if (isCustomAddUser) {
      if (!values.fullName || values.fullName.trim() === "") {
        form.setError("fullName", {
          type: "manual",
          message: "Vui lòng nhập người trực",
        });
        return;
      }
      if (!values.position || values.position.trim() === "") {
        form.setError("position", {
          type: "manual",
          message: "Vui lòng nhập chức vụ",
        });
        return;
      }
    } else {
      if (!values.fullName || values.fullName === "null") {
        form.setError("fullName", {
          type: "manual",
          message: "Vui lòng chọn người trực",
        });
        return;
      }
    }

    const payload = [
      {
        orgId: orgSelected.id,
        departmentId: departmentId,
        handler: values.fullName,
        date: extractDateFromVietnameseString(watchDateStr),
        handlerPosition: values.position,
        handlerPhone: values.phone,
      },
    ];

    try {
      const result = await updateCreateWatchList(payload);

      if (result && result.success) {
        ToastUtils.success(
          `Thành công ${isUpdateForm ? "Chỉnh sửa" : "Thêm mới"} người trực ngày ${watchDateStr} thành công!`
        );
        form.reset();
        onOpenChange(false);
      } else {
        ToastUtils.error(
          `Không thể ${isUpdateForm ? "chỉnh sửa" : "thêm mới"} người trực`
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            {isUpdateForm ? "Chỉnh sửa" : "Thêm mới"} lịch trực ban ngày{" "}
            {watchDateStr}
          </DialogTitle>
          <X className="w-4 h-4" onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <Form {...form}>
              <form
                id="watch-item-form"
                onSubmit={form.handleSubmit(handleSave)}
                className="space-y-6"
              >
                {/* Vai trò */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">
                        Vai trò <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SelectCustom
                          options={roleOptions}
                          value={field.value}
                          onChange={handleRoleChange}
                          placeholder="--- Chọn vai trò ---"
                          className={`${
                            field.value === "1" || field.value === "2"
                              ? "text-red-600"
                              : field.value === "3"
                                ? "text-blue-600"
                                : ""
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Đơn vị */}
                <FormField
                  control={form.control}
                  name="org"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">
                        Đơn vị <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập đơn vị"
                          value={form.watch("role") ? field.value : ""}
                          disabled
                          maxLength={500}
                          className="bg-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Họ và tên */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold">
                            {!isCustomAddUser
                              ? "Chọn người trực"
                              : "Nhập người trực"}{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            {isCustomAddUser ? (
                              <Input
                                placeholder="Nhập tên người trực"
                                {...field}
                                maxLength={500}
                              />
                            ) : (
                              <SelectCustom
                                options={userOptions}
                                value={field.value}
                                onChange={handlePersonChange}
                                placeholder="--- Chọn người trực ---"
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-4 flex items-center">
                    <div
                      className={`flex items-center space-x-2 ${
                        !form.formState.errors.fullName ? "pt-6" : ""
                      }`}
                    >
                      <Checkbox
                        id="customAddUser"
                        checked={isCustomAddUser}
                        onCheckedChange={handleCheckboxChange}
                        //disabled={!editData}
                      />
                      <Label htmlFor="customAddUser" className="text-sm">
                        Tự nhập người trực
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Phòng ban */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">
                        Phòng ban <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập phòng ban người trực"
                          value={form.watch("role") ? field.value : ""}
                          disabled
                          maxLength={500}
                          className="bg-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Chức vụ */}
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">
                        Chức vụ <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập chức vụ người trực"
                          {...field}
                          maxLength={500}
                          disabled={!isCustomAddUser}
                          className={`${!isCustomAddUser ? "bg-gray-300" : ""}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Số điện thoại */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold">
                        Số điện thoại <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập số điện thoại"
                          {...field}
                          maxLength={500}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            type="submit"
            form="watch-item-form"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
