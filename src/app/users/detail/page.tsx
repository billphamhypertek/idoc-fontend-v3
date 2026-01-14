"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DropdownTree, { TreeNode } from "@/components/common/DropdownTree";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetOrganizations } from "@/hooks/data/organization.data";
import {
  useGetUserByUserName,
  useAddUser,
  useUpdateUser,
  useChangePassword,
  useGetUserByToken,
  useGetSecretarys,
  useGetAllUsers,
} from "@/hooks/data/user-detail.data";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/definitions/types/user.type";
import { Constant } from "@/definitions/constants/constant";
import { queryKeys } from "@/definitions";
import { ToastUtils } from "@/utils/toast.utils";
import {
  ArrowLeft,
  Save,
  Key,
  Upload,
  User as UserIcon,
  KeyRound,
} from "lucide-react";
import SelectCustom from "@/components/common/SelectCustom";
import SecretaryAutocomplete from "@/components/users/SecretaryAutocomplete";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SignatureService } from "@/services/signature.service";
import { UploadFileService } from "@/services/upload-file.service";
import { getUserInfo } from "@/utils/token.utils";
import { handleError } from "@/utils/common.utils";
import { b64DecodeUnicode } from "@/utils/base64.utils";
import { CustomDatePicker } from "@/components/ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { UserFormData, userSchema } from "@/schemas/profile.schema";

// Authority enums giống V1
enum AuthorityEnum {
  APPROVE_UNIT_LEVEL_CALENDAR = "APPROVE_UNIT_LEVEL_CALENDAR",
  APPROVE_TOP_LEVEL_CALENDAR = "APPROVE_TOP_LEVEL_CALENDAR",
  APPROVE_MEETING_CALENDAR = "APPROVE_MEETING_CALENDAR",
  LEADERSHIP = "LEADERSHIP",
  LEADERSHIP_UNIT = "LEADERSHIP_UNIT",
  DIRECTION_DOCUMENT = "DIRECTION_DOCUMENT",
  DUYET_HOSO = "DUYET_HOSO",
  MANAGE_HEADINGS = "MANAGE_HEADINGS",
  REPORT_CHINH_QUYEN = "REPORT_CHINH_QUYEN",
  REPORT_DANG = "REPORT_DANG",
  REPORT_VP_BAN = "REPORT_VP_BAN",
  APPROVE_WATCH_LIST_UNIT = "APPROVE_WATCH_LIST_UNIT",
  APPROVE_WATCH_LIST_BAN = "APPROVE_WATCH_LIST_BAN",
  CREATE_WATCH_LIST_BAN = "CREATE_WATCH_LIST_BAN",
  FOLLOW_CAR = "FOLLOW_CAR",
}

// Password change schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
    newPassword: z.string().min(1, "Mật khẩu mới không được để trống"),
    newPasswordConfirmation: z
      .string()
      .min(1, "Xác nhận mật khẩu không được để trống"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["newPasswordConfirmation"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function UserDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const userName = searchParams?.get("userName");
  const isUpdateUser = !!userName;

  // Permission checks
  const allowEditLdap = true; // This should come from config
  const isAdmin = true; // This should come from user context

  // Check if current user is editing their own profile
  const isOfCurrentUser = (userId: number) => {
    const userInfo = JSON.parse(getUserInfo() || "{}");
    return userInfo && userInfo.id === userId;
  };

  // Form states
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      userName: "",
      position: 0,
      org: 0,
      phone: "",
      email: "",
      gender: 0,
      lead: false,
      indentity: "",
      phoneCA: "",
      phoneCAProvider: "",
      address: "",
      birthday: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });

  // State
  const [user, setUser] = useState<User | null>(null);
  const [nameAvatarTemp, setNameAvatarTemp] = useState("Chọn ảnh đại diện");
  const [nameSignatureTemp, setNameSignatureTemp] = useState("Chọn chữ ký");
  const [registrySign, setRegistrySign] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [secretarysName, setSecretarysName] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Permission states
  const [orgPermission, setOrgPermission] = useState(false);
  const [departmentPermission, setDepartmentPermission] = useState(false);
  const [leadshipPermission, setLeadshipPermission] = useState(false);
  const [leadRoomPermission, setLeadRoomPermission] = useState(false);
  const [approveCalendarMeeting, setApproveCalendarMeeting] = useState(false);
  const [directionDocument, setDirectionDocument] = useState(false);
  const [approveHSTL, setApproveHSTL] = useState(false);
  const [managerHeading, setManagerHeading] = useState(false);
  const [reportChinhQuyen, setReportChinhQuyen] = useState(false);
  const [reportDang, setReportDang] = useState(false);
  const [reportVPBan, setReportVPBan] = useState(false);
  const [approveWatchListUnit, setApproveWatchListUnit] = useState(false);
  const [approveWatchListBan, setApproveWatchListBan] = useState(false);
  const [createWatchListBan, setCreateWatchListBan] = useState(false);
  const [followCar, setFollowCar] = useState(false);

  // API hooks
  const { data: userData, isLoading: isLoadingUser } = useGetUserByUserName(
    userName || null
  );
  const { data: positions } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.USER_POSITION
  );
  const { data: organizations } = useGetOrganizations({ active: true });
  const { data: secretarys } = useGetSecretarys();
  const { data: allUsers } = useGetAllUsers();

  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();
  const getUserByTokenMutation = useGetUserByToken();

  // Load user data when editing
  useEffect(() => {
    if (userData?.data && isUpdateUser) {
      const userInfo = userData.data;
      setUser(userInfo);

      // Set form values
      userForm.reset({
        fullName: userInfo.fullName || "",
        userName: userInfo.userName || "",
        position: userInfo.position || 0,
        org: userInfo.org || 0,
        phone: userInfo.phone?.toString() || "",
        email: userInfo.email || "",
        gender: userInfo.gender || 0,
        lead: userInfo.lead || false,
        indentity: userInfo.indentity?.toString() || "",
        phoneCA: userInfo.phoneCA || "",
        phoneCAProvider: userInfo.phoneCAProvider || "",
        address: userInfo.address || "",
        birthday: userInfo.birthday || "",
      });

      // Set signature name
      if (userInfo.signature) {
        setNameSignatureTemp("Cập nhật chữ ký");
      }

      // Set registry sign
      if (userInfo.serialToken) {
        setRegistrySign(true);
      }

      // Bind permissions
      bindCalendarPermission(userInfo.authoritys || []);

      // Set secretarys
      if (userInfo.cecretarys && allUsers) {
        const secretaryNames = userInfo.cecretarys
          .map((sec: any) => {
            const user = allUsers.find((u: any) => u.id === sec.userId);
            return user?.fullName || "";
          })
          .filter(Boolean);
        setSecretarysName(secretaryNames);
      }
    }
  }, [userData, isUpdateUser, allUsers]);

  // Bind calendar permissions
  const bindCalendarPermission = (authoritys: any[]) => {
    authoritys.forEach((permission: any) => {
      switch (permission.authority) {
        case AuthorityEnum.APPROVE_UNIT_LEVEL_CALENDAR:
          setOrgPermission(true);
          break;
        case AuthorityEnum.APPROVE_TOP_LEVEL_CALENDAR:
          setDepartmentPermission(true);
          break;
        case AuthorityEnum.LEADERSHIP:
          setLeadshipPermission(true);
          break;
        case AuthorityEnum.LEADERSHIP_UNIT:
          setLeadRoomPermission(true);
          break;
        case AuthorityEnum.APPROVE_MEETING_CALENDAR:
          setApproveCalendarMeeting(true);
          break;
        case AuthorityEnum.DIRECTION_DOCUMENT:
          setDirectionDocument(true);
          break;
        case AuthorityEnum.DUYET_HOSO:
          setApproveHSTL(true);
          break;
        case AuthorityEnum.MANAGE_HEADINGS:
          setManagerHeading(true);
          break;
        case AuthorityEnum.REPORT_CHINH_QUYEN:
          setReportChinhQuyen(true);
          break;
        case AuthorityEnum.REPORT_DANG:
          setReportDang(true);
          break;
        case AuthorityEnum.REPORT_VP_BAN:
          setReportVPBan(true);
          break;
        case AuthorityEnum.APPROVE_WATCH_LIST_UNIT:
          setApproveWatchListUnit(true);
          break;
        case AuthorityEnum.APPROVE_WATCH_LIST_BAN:
          setApproveWatchListBan(true);
          break;
        case AuthorityEnum.CREATE_WATCH_LIST_BAN:
          setCreateWatchListBan(true);
          break;
        case AuthorityEnum.FOLLOW_CAR:
          setFollowCar(true);
          break;
      }
    });
  };

  // Add permissions to user
  const addPermission = (userId: number) => {
    const authoritys: any[] = [];

    if (orgPermission) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.APPROVE_UNIT_LEVEL_CALENDAR,
      });
    }
    if (departmentPermission) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.APPROVE_TOP_LEVEL_CALENDAR,
      });
    }
    if (leadshipPermission) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.LEADERSHIP,
      });
    }
    if (leadRoomPermission) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.LEADERSHIP_UNIT,
      });
    }
    if (approveCalendarMeeting) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.APPROVE_MEETING_CALENDAR,
      });
    }
    if (directionDocument) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.DIRECTION_DOCUMENT,
      });
    }
    if (approveHSTL) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.DUYET_HOSO,
      });
    }
    if (managerHeading) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.MANAGE_HEADINGS,
      });
    }
    if (reportChinhQuyen) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.REPORT_CHINH_QUYEN,
      });
    }
    if (reportDang) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.REPORT_DANG,
      });
    }
    if (reportVPBan) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.REPORT_VP_BAN,
      });
    }
    if (approveWatchListUnit) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.APPROVE_WATCH_LIST_UNIT,
      });
    }
    if (approveWatchListBan) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.APPROVE_WATCH_LIST_BAN,
      });
    }
    if (createWatchListBan) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.CREATE_WATCH_LIST_BAN,
      });
    }
    if (followCar) {
      authoritys.push({
        userId: userId,
        authority: AuthorityEnum.FOLLOW_CAR,
      });
    }

    return authoritys;
  };

  // Get secretarys IDs
  const getCecretarysId = () => {
    const cecretarys: any[] = [];
    if (secretarysName && allUsers) {
      secretarysName.forEach((name) => {
        const user = allUsers.find((u: any) => u.fullName === name);
        if (user) {
          cecretarys.push({ userId: user.id });
        }
      });
    }
    return cecretarys;
  };

  // Get token info from VGCA
  const getTonkenInfoByVgca = () => {
    if (registrySign) {
      SignatureService.getTokenInfoVgca((data: string) => {
        if (data === "-100") {
          ToastUtils.error("VGCA plugin not available");
        } else {
          try {
            const tokenInfo = JSON.parse(data);
            if (tokenInfo.Status === 0) {
              let nameUseToken = tokenInfo.CertInfo.Subject;
              if (nameUseToken.includes("CN=")) {
                nameUseToken = nameUseToken.slice(
                  nameUseToken.indexOf("CN=") + 3,
                  nameUseToken.indexOf(",")
                );
              }

              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      nameToken: nameUseToken,
                      serialToken: tokenInfo.CertInfo.Base64Data,
                      startTimeToken: tokenInfo.CertInfo.ValidFrom,
                      expiredTimeToken: tokenInfo.CertInfo.ValidTo,
                      orgToken: tokenInfo.CertInfo.Subject.slice(
                        Math.max(
                          0,
                          tokenInfo.CertInfo.Subject.lastIndexOf(",") + 1
                        )
                      ).trim(),
                    }
                  : null
              );
            } else {
              ToastUtils.error(
                tokenInfo.Message || "Lỗi khi lấy thông tin token"
              );
            }
          } catch (error) {
            ToastUtils.error("Failed to parse token info");
          }
        }
      });
    } else {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              nameToken: "",
              serialToken: "",
              startTimeToken: "",
              expiredTimeToken: "",
              orgToken: "",
            }
          : null
      );
    }
  };

  // Get token info from service
  const getTokenInfo = () => {
    if (registrySign) {
      SignatureService.getTokenInfo((data: string) => {
        if (data === "-100") {
          ToastUtils.error("Bạn chưa cài Service đăng kí chứng thực số");
          setRegistrySign(false);
        } else if (data !== "") {
          try {
            // Decode base64 data with Unicode support
            const decodedData = b64DecodeUnicode(data);
            const tokenInfo = JSON.parse(decodedData);

            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    nameToken: tokenInfo.CommonName,
                    serialToken: tokenInfo.SerialNumber,
                    startTimeToken: tokenInfo.ValidDate,
                    expiredTimeToken: tokenInfo.ExpireDate,
                    orgToken: tokenInfo.Subject.slice(
                      Math.max(0, tokenInfo.Subject.lastIndexOf(",") + 1)
                    ).trim(),
                  }
                : null
            );
          } catch (error) {
            ToastUtils.error("Failed to parse token info");
            setRegistrySign(false);
          }
        } else {
          setRegistrySign(false);
        }
      });
    } else {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              nameToken: "",
              serialToken: "",
              startTimeToken: "",
              expiredTimeToken: "",
              orgToken: "",
            }
          : null
      );
    }
  };

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "signature"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const allowedExtensions = UploadFileService.validateFileExtension(
      event.target.files!,
      Constant.ALLOWED_FILE_IMAGE
    );
    if (!allowedExtensions) {
      ToastUtils.error("Định dạng ảnh không hợp lệ");
      return;
    }

    // Check file size (3MB)
    const validFileSize = UploadFileService.validateFileSize(
      file,
      Constant.MAX_SIZE_FILE_UPLOAD
    );
    if (!validFileSize) {
      ToastUtils.error("Dung lượng ảnh không hợp lệ");
      return;
    }

    try {
      // Upload file
      const uploadedUrl = await UploadFileService.uploadFile(file);

      if (type === "avatar") {
        setNameAvatarTemp(file.name);
        setUser((prev) => (prev ? { ...prev, photo: uploadedUrl } : null));
        ToastUtils.success("Tải ảnh cá nhân thành công");
      } else {
        setNameSignatureTemp(file.name);
        setUser((prev) => (prev ? { ...prev, signature: uploadedUrl } : null));
        ToastUtils.success("Tải chữ ký thành công");
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Check user by token before saving
  const doCheckUserByToken = async () => {
    if (user?.id) {
      try {
        const response = await getUserByTokenMutation.mutateAsync(user);
        if (response.data?.userName) {
          setConfirmDialogData({
            title: "Xác nhận",
            description: `Chứng thư số đã được sử dụng bởi: ${response.data.userName}! Bạn có muốn tiếp tục?`,
            onConfirm: doSave,
          });
          setIsConfirmDialogOpen(true);
        } else {
          doSave();
        }
      } catch (error) {
        handleError(error);
      }
    } else {
      doSave();
    }
  };

  // Save user data
  const doSave = async () => {
    try {
      const formData = userForm.getValues();
      const userId = user?.id || 0;
      const userData: User = {
        ...formData,
        id: userId,
        clientId: user?.clientId || 0,
        sex: user?.sex || false,
        cert: user?.cert || "",
        orgParent: user?.orgParent || "",
        indentity: parseInt(formData.indentity || "0") || 0,
        birthday: formData.birthday || "",
        phone: parseInt(formData.phone) || 0,
        gender: formData.gender || 0,
        lead: formData.lead || false,
        phoneCA: formData.phoneCA || "",
        phoneCAProvider: formData.phoneCAProvider || "",
        address: formData.address || "",
        org: formData.org || 0,
        authoritys: addPermission(userId),
        cecretarys: getCecretarysId(),
        photo: user?.photo || "",
        signature: user?.signature || "",
        serialToken: user?.serialToken || "",
        nameToken: user?.nameToken || "",
        orgToken: user?.orgToken || "",
        startTimeToken: user?.startTimeToken || "",
        expiredTimeToken: user?.expiredTimeToken || "",
        ldap: user?.ldap || false,
        active: user?.active ?? true,
      };

      if (isUpdateUser && user) {
        // Update user - UserService will handle encrypt API calls
        const result = await updateUserMutation.mutateAsync({
          ...userData,
          id: user.id,
        });
        ToastUtils.success("Cập nhật thông tin người dùng thành công!");

        // Update userInfo if current user is updating their own profile
        const currentUserInfo = JSON.parse(getUserInfo() || "{}");
        if (currentUserInfo.id === user.id) {
          const updatedUserInfo = { ...currentUserInfo, ...userData };
          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        }

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.users.getByUserName, userName],
        });
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.users.all],
        });
      } else {
        await addUserMutation.mutateAsync(userData);
        ToastUtils.success("Thêm mới người dùng thành công!");

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.users.all],
        });
      }

      router.back();
    } catch (error) {
      handleError(error);
    }
  };

  // Handle form submission
  const onSubmit = async (data: UserFormData) => {
    // Validate form first
    const isValid = await userForm.trigger();
    if (!isValid) {
      return;
    }

    // Check user by token before saving
    doCheckUserByToken();
  };

  // Handle password change
  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      if (data.currentPassword === data.newPassword) {
        ToastUtils.error("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        return;
      }

      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      ToastUtils.success("Đổi mật khẩu thành công!");
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error) {
      handleError(error);
    }
  };

  // Convert organizations to tree format
  const orgTreeData: TreeNode[] =
    organizations?.map((org: any) => ({
      id: org.id,
      name: org.name,
      parentId: org.parentId,
      children: [],
    })) || [];

  // Build tree structure
  const buildTree = (nodes: TreeNode[]): TreeNode[] => {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    // Create map of all nodes
    nodes.forEach((node) => {
      map.set(node.id, { ...node, children: [] });
    });

    // Build tree structure
    nodes.forEach((node) => {
      const nodeWithChildren = map.get(node.id)!;
      if (node.parentId && map.has(node.parentId)) {
        const parent = map.get(node.parentId)!;
        parent.children!.push(nodeWithChildren);
      } else {
        roots.push(nodeWithChildren);
      }
    });

    return roots;
  };

  const treeData = buildTree(orgTreeData);

  if (isLoadingUser && isUpdateUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner variant="ring" size={48} className="text-blue-600" />
          <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <BreadcrumbNavigation
        items={[{ label: "Danh sách người dùng", href: "/users" }]}
        currentPage={
          isUpdateUser ? "Chỉnh sửa người dùng" : "Thêm mới người dùng"
        }
        showHome={false}
        className="mb-4"
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">
                Thông tin tài khoản cá nhân
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cập nhật điều chỉnh thông tin thành viên của hệ thống
              </p>
            </div>
            <div className="flex gap-2">
              {isUpdateUser && isOfCurrentUser(user?.id || 0) && (
                <Dialog
                  open={isPasswordDialogOpen}
                  onOpenChange={setIsPasswordDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <KeyRound className="w-4 h-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Đổi mật khẩu</DialogTitle>
                    </DialogHeader>
                    <div
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      <div>
                        <Label
                          htmlFor="currentPassword"
                          className="font-semibold"
                        >
                          Mật khẩu hiện tại *
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          {...passwordForm.register("currentPassword")}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-500 mt-1">
                            {
                              passwordForm.formState.errors.currentPassword
                                .message
                            }
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="font-semibold">
                          Mật khẩu mới *
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          {...passwordForm.register("newPassword")}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-500 mt-1">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="newPasswordConfirmation"
                          className="font-semibold"
                        >
                          Xác nhận mật khẩu mới *
                        </Label>
                        <Input
                          id="newPasswordConfirmation"
                          type="password"
                          {...passwordForm.register("newPasswordConfirmation")}
                        />
                        {passwordForm.formState.errors
                          .newPasswordConfirmation && (
                          <p className="text-sm text-red-500 mt-1">
                            {
                              passwordForm.formState.errors
                                .newPasswordConfirmation.message
                            }
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPasswordDialogOpen(false)}
                        >
                          Đóng
                        </Button>
                        <Button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending
                            ? "Đang xử lý..."
                            : "Lưu lại"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                className="bg-blue-600 hover:bg-blue-600 text-white hover:text-white"
                type="button"
                onClick={() => {
                  userForm.handleSubmit(onSubmit)();
                }}
                disabled={
                  addUserMutation.isPending || updateUserMutation.isPending
                }
              >
                <Save className="w-4 h-4 mr-2" />
                {addUserMutation.isPending || updateUserMutation.isPending
                  ? "Đang lưu..."
                  : "Lưu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <Label htmlFor="avatar" className="font-semibold">
                    Ảnh đại diện
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("avatar")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Tải ảnh
                    </Button>
                    <input
                      id="avatar"
                      type="file"
                      accept={Constant.ALLOWED_FILE_IMAGE}
                      onChange={(e) => handleFileSelect(e, "avatar")}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {nameAvatarTemp}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-semibold">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    {...userForm.register("fullName")}
                    placeholder="Nhập họ và tên"
                  />
                  {userForm.formState.errors.fullName && (
                    <p className="text-sm text-red-500">
                      {userForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="userName" className="font-semibold">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="userName"
                    {...userForm.register("userName")}
                    placeholder="Nhập tên đăng nhập"
                    disabled={!isAdmin || (user?.ldap && !allowEditLdap)}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                  />
                  {userForm.formState.errors.userName && (
                    <p className="text-sm text-red-500">
                      {userForm.formState.errors.userName.message}
                    </p>
                  )}
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position" className="font-semibold">
                    Chức vụ <span className="text-red-500">*</span>
                  </Label>
                  <SelectCustom
                    value={userForm.watch("position")?.toString()}
                    onChange={(value) =>
                      userForm.setValue(
                        "position",
                        Array.isArray(value)
                          ? parseInt(value[0])
                          : parseInt(value)
                      )
                    }
                    options={
                      positions?.map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                      })) || []
                    }
                    disabled={!isAdmin || (user?.ldap && !allowEditLdap)}
                  />
                  {userForm.formState.errors.position && (
                    <p className="text-sm text-red-500">
                      {userForm.formState.errors.position.message}
                    </p>
                  )}
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label className="font-semibold">
                    Đơn vị <span className="text-red-500">*</span>
                  </Label>
                  <DropdownTree
                    value={userForm.watch("org") || 0}
                    onChange={(value) =>
                      userForm.setValue(
                        "org",
                        Array.isArray(value)
                          ? parseInt(value[0]?.toString() || "0")
                          : parseInt(value?.toString() || "0")
                      )
                    }
                    multiple={false}
                    dataSource={treeData}
                    placeholder="Chọn đơn vị"
                    disabled={!isAdmin || (user?.ldap && !allowEditLdap)}
                  />
                  {userForm.formState.errors.org && (
                    <p className="text-sm text-red-500">
                      {userForm.formState.errors.org.message}
                    </p>
                  )}
                </div>

                {/* Lead */}
                <div className="space-y-2">
                  <Label className="font-semibold">Lãnh đạo</Label>
                  <SelectCustom
                    value={userForm.watch("lead")?.toString() || ""}
                    onChange={(value) =>
                      userForm.setValue("lead", value === "true")
                    }
                    options={[
                      { label: "Không", value: "false" },
                      { label: "Có", value: "true" },
                    ]}
                    disabled={!isAdmin}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="font-semibold">Giới tính</Label>
                  <SelectCustom
                    value={userForm.watch("gender")?.toString() || ""}
                    onChange={(value) => {
                      userForm.setValue(
                        "gender",
                        parseInt(Array.isArray(value) ? value[0] : value)
                      );
                    }}
                    options={[
                      { label: "Nam", value: "0" },
                      { label: "Nữ", value: "1" },
                      { label: "Khác", value: "2" },
                    ]}
                  />
                </div>

                {/* Birthday */}
                <div className="space-y-2">
                  <Label className="font-semibold">Ngày sinh</Label>
                  <CustomDatePicker
                    selected={parseDateStringYMD(userForm.watch("birthday"))}
                    onChange={(date) =>
                      userForm.setValue("birthday", formatDateYMD(date))
                    }
                    placeholder="Chọn ngày"
                  />
                </div>

                {/* Identity */}
                <div className="space-y-2">
                  <Label className="font-semibold">Số CMND/CCCD</Label>
                  <Input
                    {...userForm.register("indentity")}
                    placeholder="Nhập số CMND/CCCD"
                    maxLength={20}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    {...userForm.register("phone")}
                    placeholder="Nhập số điện thoại"
                    maxLength={20}
                  />
                  {userForm.formState.errors.phone && (
                    <p className="text-sm text-red-500">
                      {userForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...userForm.register("email")}
                    placeholder="Nhập email"
                    maxLength={100}
                    disabled={user?.ldap}
                  />
                  {userForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {userForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone CA */}
                <div className="space-y-2">
                  <Label className="font-semibold">Số sim CA</Label>
                  <Input
                    {...userForm.register("phoneCA")}
                    placeholder="84*********"
                    maxLength={20}
                  />
                </div>

                {/* Phone CA Provider */}
                <div className="space-y-2">
                  <Label className="font-semibold">Nhà mạng sim CA</Label>
                  <SelectCustom
                    value={userForm.watch("phoneCAProvider")}
                    onChange={(value) =>
                      userForm.setValue(
                        "phoneCAProvider",
                        Array.isArray(value)
                          ? value[0] === "none"
                            ? ""
                            : value[0]
                          : value === "none"
                            ? ""
                            : value
                      )
                    }
                    options={[
                      { label: "--Chọn nhà mạng--", value: "none" },
                      { label: "Viettel", value: "vt" },
                      { label: "Vinaphone", value: "vn" },
                    ]}
                  />
                </div>
              </div>

              {/* Signature */}
              <div className="space-y-2">
                <Label className="font-semibold">Chữ ký</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("signature")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Tải ảnh
                  </Button>
                  <input
                    id="signature"
                    type="file"
                    accept={Constant.ALLOWED_FILE_IMAGE}
                    onChange={(e) => handleFileSelect(e, "signature")}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {nameSignatureTemp}
                </p>
              </div>

              {/* Secretary */}
              <div className="space-y-2">
                <SecretaryAutocomplete
                  value={secretarysName}
                  onChange={setSecretarysName}
                  allUsers={allUsers}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="font-semibold">Địa chỉ</Label>
                <Textarea
                  {...userForm.register("address")}
                  placeholder="Nhập địa chỉ"
                  rows={3}
                />
              </div>

              {/* Registry Sign */}
              {Constant.BCY_ADD_TOKEN_INFO && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="registrySign"
                      checked={registrySign}
                      onCheckedChange={(checked) => {
                        setRegistrySign(checked === true);
                        if (checked) {
                          console.log("getTonkenInfoByVgca");
                          getTonkenInfoByVgca();
                        }
                      }}
                    />
                    <Label htmlFor="registrySign" className="font-semibold">
                      Đăng ký chứng thư số
                    </Label>
                  </div>

                  {registrySign && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label className="font-semibold">
                          Tên người sử dụng
                        </Label>
                        <Input value={user?.nameToken || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">Tổ chức</Label>
                        <Input value={user?.orgToken || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">
                          Thời gian sử dụng từ
                        </Label>
                        <Input value={user?.startTimeToken || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">
                          Thời gian sử dụng đến
                        </Label>
                        <Input value={user?.expiredTimeToken || ""} disabled />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Danh sách quyền
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Constant.SHOW_CALENDAR_AUTHORITY_BCY && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="orgPermission"
                            checked={orgPermission}
                            onCheckedChange={(checked) =>
                              setOrgPermission(checked === true)
                            }
                          />
                          <Label
                            htmlFor="orgPermission"
                            className="font-semibold"
                          >
                            Duyệt lịch đơn vị
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="departmentPermission"
                            checked={departmentPermission}
                            onCheckedChange={(checked) =>
                              setDepartmentPermission(checked === true)
                            }
                          />
                          <Label
                            htmlFor="departmentPermission"
                            className="font-semibold"
                          >
                            Duyệt lịch ban
                          </Label>
                        </div>
                      </>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="leadshipPermission"
                        checked={leadshipPermission}
                        onCheckedChange={(checked) =>
                          setLeadshipPermission(checked === true)
                        }
                      />
                      <Label
                        htmlFor="leadshipPermission"
                        className="font-semibold"
                      >
                        Lãnh đạo Cục
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="leadRoomPermission"
                        checked={leadRoomPermission}
                        onCheckedChange={(checked) =>
                          setLeadRoomPermission(checked === true)
                        }
                      />
                      <Label
                        htmlFor="leadRoomPermission"
                        className="font-semibold"
                      >
                        Lãnh đạo Phòng
                      </Label>
                    </div>

                    {Constant.SHOW_CALENDAR_AUTHORITY_BCY && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="approveCalendarMeeting"
                          checked={approveCalendarMeeting}
                          onCheckedChange={(checked) =>
                            setApproveCalendarMeeting(checked === true)
                          }
                        />
                        <Label
                          htmlFor="approveCalendarMeeting"
                          className="font-semibold"
                        >
                          Duyệt lịch họp
                        </Label>
                      </div>
                    )}

                    {Constant.LEADER_TRANSFER_CHECK_H05 && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="directionDocument"
                          checked={directionDocument}
                          onCheckedChange={(checked) =>
                            setDirectionDocument(checked === true)
                          }
                        />
                        <Label
                          htmlFor="directionDocument"
                          className="font-semibold"
                        >
                          Quyền chỉ đạo
                        </Label>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="approveHSTL"
                        checked={approveHSTL}
                        onCheckedChange={(checked) =>
                          setApproveHSTL(checked === true)
                        }
                      />
                      <Label htmlFor="approveHSTL" className="font-semibold">
                        Quyền duyệt HSTL
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="managerHeading"
                        checked={managerHeading}
                        onCheckedChange={(checked) =>
                          setManagerHeading(checked === true)
                        }
                      />
                      <Label htmlFor="managerHeading" className="font-semibold">
                        Quản lý đề mục
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reportChinhQuyen"
                        checked={reportChinhQuyen}
                        onCheckedChange={(checked) =>
                          setReportChinhQuyen(checked === true)
                        }
                      />
                      <Label
                        htmlFor="reportChinhQuyen"
                        className="font-semibold"
                      >
                        Duyệt báo cáo chính quyền
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reportDang"
                        checked={reportDang}
                        onCheckedChange={(checked) =>
                          setReportDang(checked === true)
                        }
                      />
                      <Label htmlFor="reportDang" className="font-semibold">
                        Duyệt báo cáo đảng
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reportVPBan"
                        checked={reportVPBan}
                        onCheckedChange={(checked) =>
                          setReportVPBan(checked === true)
                        }
                      />
                      <Label htmlFor="reportVPBan" className="font-semibold">
                        Văn phòng ban
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="approveWatchListUnit"
                        checked={approveWatchListUnit}
                        onCheckedChange={(checked) =>
                          setApproveWatchListUnit(checked === true)
                        }
                      />
                      <Label
                        htmlFor="approveWatchListUnit"
                        className="font-semibold"
                      >
                        Duyệt lịch trực ngoài giờ đơn vị
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="approveWatchListBan"
                        checked={approveWatchListBan}
                        onCheckedChange={(checked) =>
                          setApproveWatchListBan(checked === true)
                        }
                      />
                      <Label
                        htmlFor="approveWatchListBan"
                        className="font-semibold"
                      >
                        Duyệt lịch trực ngoài giờ Ban
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createWatchListBan"
                        checked={createWatchListBan}
                        onCheckedChange={(checked) =>
                          setCreateWatchListBan(checked === true)
                        }
                      />
                      <Label
                        htmlFor="createWatchListBan"
                        className="font-semibold"
                      >
                        Tạo lịch trực ngoài giờ Ban
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="followCar"
                        checked={followCar}
                        onCheckedChange={(checked) =>
                          setFollowCar(checked === true)
                        }
                      />
                      <Label htmlFor="followCar" className="font-semibold">
                        Theo dõi xe trong đơn vị
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title={confirmDialogData.title}
        description={confirmDialogData.description}
        onConfirm={confirmDialogData.onConfirm}
        confirmText="Tiếp tục"
        cancelText="Hủy"
      />
    </div>
  );
}
