"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useAddUser,
  useUpdateUser,
  useChangePassword,
  useGetUserByToken,
} from "@/hooks/data/user-detail.data";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/definitions/types/user.type";
import { Constant } from "@/definitions/constants/constant";
import { queryKeys } from "@/definitions";
import { ToastUtils } from "@/utils/toast.utils";
import {
  ArrowLeft,
  Save,
  Upload,
  User as UserIcon,
  KeyRound,
} from "lucide-react";
import SelectCustom from "@/components/common/SelectCustom";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SignatureService } from "@/services/signature.service";
import { UploadFileService } from "@/services/upload-file.service";
import { getUserInfo } from "@/utils/token.utils";
import { handleError } from "@/utils/common.utils";
import { b64DecodeUnicode } from "@/utils/base64.utils";
import { CustomDatePicker } from "@/components/ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { useGetProfileEdit } from "@/hooks/data/profile.data";
import { CheckedState } from "@radix-ui/react-checkbox";
import { EncryptionService } from "@/services/encryption.service";
import {
  PasswordFormData,
  passwordSchema,
  UserFormData,
  userSchema,
} from "@/schemas/profile.schema";

export default function ProfilePages() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { username: userName } = useParams<{
    username: string;
  }>() || { username: "" };

  const isUpdateUser = !!userName;

  const [checkLinkIAM, setCheckLinkIAM] = useState(false);
  const [checkEditUserName, setCheckEditUserName] = useState(false);

  // Permission checks
  const allowEditLdap = true; // Constant.ALLOW_EDIT_LDAP khong thay config nay
  const isAdmin = false; // default false

  // Check if current user is editing their own profile
  const isOfCurrentUser = (userId: number) => {
    const userInfo = JSON.parse(getUserInfo() || "{}");
    return userInfo && userInfo.id === userId;
  };
  const [currentCert, setCurrentCert] = useState("");
  const [imageError, setImageError] = useState(false);

  const DEFAULT_AVATAR = "/v2/assets/images/users/boy-no-photo.jpg";

  const getAvatarUrl = (url: string | null): string => {
    if (!url || url.includes("undefined")) {
      return DEFAULT_AVATAR;
    }

    if (url.startsWith("http")) {
      return url;
    }

    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/avatar/`;
    return `${baseUrl}${url}`;
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

  // API hooks
  const { data: userData } = useGetProfileEdit();

  const { data: positions } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.USER_POSITION
  );
  const { data: organizations } = useGetOrganizations({ active: true });

  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();
  const getUserByTokenMutation = useGetUserByToken();
  // const {data: checkUserLinkIAM} = useCheckUserLinkIAM();

  // Load user data when editing
  useEffect(() => {
    // if (checkUserLinkIAM){ //alway false. no body received.
    //     setCheckLinkIAM(true);
    //     if (!checkUserLinkIAM.checkUser){
    //         setCheckEditUserName(true);
    //     }
    // }
    if (userData && isUpdateUser) {
      const userInfo = userData || null;
      setUser(userInfo);
      // Set form values
      userForm.reset({
        fullName: userData.fullName || "",
        userName: userData.userName || "",
        position: userData.position || 0,
        org: userData.org || 0,
        phone: userData.phone?.toString() || "",
        email: userData.email || "",
        gender: userData.gender || 0,
        lead: userData.lead || false,
        indentity: userData.indentity?.toString() || "",
        phoneCA: userData.phoneCA || "",
        phoneCAProvider: userData.phoneCAProvider || "",
        address: userData.address || "",
        birthday: userData.birthday
          ? formatDateYMD(new Date(userData.birthday))
          : "",
      });
      // Set signature name
      if (userData.signature) {
        setNameSignatureTemp("Cập nhật chữ ký");
      }

      // Set registry sign
      if (userData.serialToken) {
        setRegistrySign(true);
      }
      if (userData.cert) {
        setCurrentCert(userData.cert);
      }
    }
  }, [userData, isUpdateUser, userForm]);

  useEffect(() => {
    setImageError(false);
  }, [user?.photo]);

  const parseSubject = (
    subjectStr: string
  ): { [key: string]: string | string[] } => {
    const fields = subjectStr.split(",").map((field) => field.trim());
    const result: { [key: string]: string | string[] } = {};

    fields.forEach((field) => {
      const [key, value] = field.split("=");
      if (!result[key]) {
        result[key] = value;
      } else {
        if (!Array.isArray(result[key])) {
          result[key] = [result[key] as string];
        }
        (result[key] as string[]).push(value);
      }
    });

    return result;
  };
  // Get token info from VGCA
  const getTonkenInfoByVgca = (checked: CheckedState) => {
    if (checked) {
      SignatureService.getTokenInfoVgca((data: string) => {
        if (data === "-100") {
          ToastUtils.error("VGCA plugin not available");
        } else {
          try {
            const tokenInfo = JSON.parse(data);
            if (tokenInfo.Status === 0) {
              const parsed = parseSubject(tokenInfo.CertInfo.Subject);
              const cnValue = parsed["CN"];
              const nameUseToken = Array.isArray(cnValue)
                ? cnValue[0]
                : cnValue || "";

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
    setRegistrySign(checked === true);
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
  const getUSBToken = async () => {
    const cert = await EncryptionService.getUSBToken();
    setCurrentCert(cert.toString());
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
        cert: currentCert || "",
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
        authoritys: user?.authoritys || [],
        cecretarys: user?.cecretarys || [],
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

  // if (isLoadingUser && isUpdateUser) {
  //     return (
  //         <div className="flex items-center justify-center min-h-screen">
  //             <div className="flex flex-col items-center gap-4">
  //                 <Spinner variant="ring" size={48} className="text-blue-600" />
  //                 <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
  //             </div>
  //         </div>
  //     );
  // }

  return (
    <div className="container mx-auto p-6">
      <BreadcrumbNavigation
        items={[
          {
            label: "Thông tin cá nhân",
          },
        ]}
        currentPage={"Thông tin cá nhân"}
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
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {!imageError ? (
                      <img
                        src={getAvatarUrl(user?.photo || null)}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                        onError={() => {
                          console.error("Avatar load error:", user?.photo);
                          console.error(
                            "Attempted URL:",
                            getAvatarUrl(user?.photo || null)
                          );
                          setImageError(true);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center rounded-full">
                        <div className="w-16 h-16 bg-white rounded-full"></div>
                      </div>
                    )}
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
                    disabled={!allowEditLdap || user?.ldap}
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
                    disabled={
                      (isUpdateUser || user?.ldap) && !checkEditUserName
                    }
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
                  <div className="flex-1 min-w-0">
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
                      disabled={!isAdmin || user?.ldap}
                    />
                  </div>
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
                    disabled={!isAdmin || user?.ldap}
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
                  <div className="flex-1 min-w-0">
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
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="font-semibold">Giới tính</Label>
                  <div className="flex-1 min-w-0">
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
                  <div className="flex-1 min-w-0">
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
                      onCheckedChange={getTonkenInfoByVgca}
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
              <div>
                <Label className="block text-sm font-bold text-gray-800 mb-1">
                  Chứng thực số
                </Label>
                <div className="flex flex-col items-start gap-2 border border-gray-300 rounded-md p-2">
                  <Button
                    type="button"
                    onClick={getUSBToken}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                  >
                    {currentCert ? "Cập nhật" : "Đăng ký"}
                  </Button>
                  <Textarea
                    value={currentCert ? currentCert.substring(0, 90) : ""}
                    disabled
                    rows={3}
                    className="w-2/3 px-2 py-1 bg-gray-200 border border-gray-300 text-xs text-gray-600 font-mono break-all resize-none"
                  />
                </div>
              </div>
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
