import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Check, LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from "react";
import { useSidebarStore } from "@/stores/sideBar.store";
import useLoadingStore from "@/stores/loading.store";
import { useGetProfile } from "@/hooks/data/profile.data";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { getUserInfo } from "@/utils/token.utils";

export const UserProfileSection = () => {
  const { isCollapsed } = useSidebarStore();
  const currentPath = usePathname();
  const router = useRouter();
  const { logout, setRole, setDefaultRole } = useAuthStore();
  const { data: user } = useGetProfile();
  const availableRole = JSON.parse(getUserInfo() || "{}")?.roles;
  const isActive = currentPath?.startsWith("/settings") || false;
  const [currentRoleId, setCurrentRoleId] = React.useState<number | null>(null);
  const [defaultRoleId, setDefaultRoleId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (user?.currentRole) {
      setCurrentRoleId(user.currentRole);
    }
    if (user?.defaultRole) {
      setDefaultRoleId(user.defaultRole);
    }
  }, [user]);

  const clearMenuSelection = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.MENU_SIDEBAR);
      }
    } catch {}
  };

  const { setLoading } = useLoadingStore();
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const DEFAULT_AVATAR = "/v3/assets/images/users/boy-no-photo.jpg";

  const getAvatarUrl = (photo: string | undefined | null): string => {
    if (!photo || photo.includes("undefined")) {
      return DEFAULT_AVATAR;
    }

    if (photo.startsWith("http")) {
      return photo;
    }

    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/avatar/`;
    return `${baseUrl}${photo}`;
  };

  const selectRole = (role: any) => {
    setCurrentRoleId(role.id);
    setDefaultRoleId(role.id);
    setRole(role);
    setDefaultRole(role);
  };

  const avatarUrl = getAvatarUrl(user?.photo);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-1 p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                onClick={clearMenuSelection}
                className={cn(
                  "flex items-center justify-center w-10 h-10 transition-all duration-300 hover:scale-105 rounded-full overflow-hidden",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-white/30"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200 hover:text-blue-600 ring-2 ring-gray-200"
                )}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={avatarUrl} alt={user?.fullName || "User"} />
                  <AvatarFallback className="bg-transparent">
                    <UserCircle className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gray-900 text-white border-none shadow-xl ml-2 p-2"
            >
              <div className="font-semibold text-base">{user?.fullName}</div>
              <div className="text-xs text-gray-300 mt-1">
                {user?.positionModel?.name}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleLogout()}
                className="flex items-center justify-center w-8 h-9 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:scale-105"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gray-900 text-white border-none shadow-xl ml-2 p-2"
            >
              <div className="font-semibold text-xs">Đăng xuất</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-300 w-full min-w-0",
        isActive
          ? "text-white shadow-xl bg-gradient-to-br from-[#1976D2] to-[#1565C0]"
          : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center w-10 h-10 transition-all duration-300 shrink-0 hover:scale-105 rounded-full overflow-hidden",
              isActive
                ? "bg-white/20 text-white shadow-lg ring-2 ring-white/30"
                : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 hover:from-blue-200 hover:to-blue-300 ring-2 ring-blue-200"
            )}
            aria-label="Chuyển vai trò"
          >
            <Avatar className="w-full h-full">
              <AvatarImage src={avatarUrl} alt={user?.fullName || "User"} />
              <AvatarFallback className="bg-transparent">
                <UserCircle className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-64 p-0 overflow-hidden shadow-xl"
        >
          <DropdownMenuLabel className="px-3 py-2 bg-gray-50">
            <div className="text-xs font-medium text-gray-600">
              Vai trò hiện tại:
            </div>
            <div className="font-semibold text-gray-900 mt-1 text-sm">
              {availableRole?.find((r: any) => r.id === currentRoleId)?.name ??
                "—"}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="max-h-64 overflow-y-auto">
            {availableRole?.map((role: any) => {
              const active = role.id === currentRoleId;
              const isDefault = role.id === defaultRoleId;
              return (
                <DropdownMenuItem
                  key={role.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    selectRole(role);
                    setCurrentRoleId(role.id);
                    setRole(role);
                  }}
                  className={cn(
                    "px-3 py-2 flex items-center cursor-pointer hover:bg-gray-50",
                    active ? "bg-blue-50 text-blue-700" : ""
                  )}
                >
                  <span className="flex-1 truncate text-sm">{role.name}</span>
                  <div
                    role="button"
                    tabIndex={-1}
                    className={cn(
                      "ml-2 inline-flex items-center justify-center w-4 h-4 border transition-colors",
                      isDefault
                        ? "border-blue-600 text-blue-700 bg-blue-50"
                        : "border-gray-300 text-gray-500 hover:bg-gray-100"
                    )}
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      setDefaultRole(role);
                      selectRole(role);
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    title="Đặt mặc định"
                  >
                    {isDefault && <Check className="w-4 h-4" />}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
        href={`/info/${user?.userName}`}
        onClick={clearMenuSelection}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-semibold leading-tight text-lg break-words",
              isActive ? "text-white" : "text-gray-900"
            )}
          >
            {user?.fullName}
          </div>
          <div
            className={cn(
              "text-xs leading-tight truncate mt-0.5",
              isActive ? "text-white/80" : "text-gray-500"
            )}
          >
            {user?.positionModel?.name}
          </div>
        </div>
      </Link>

      <button
        onClick={() => handleLogout()}
        className={cn(
          "flex items-center justify-center w-8 h-9 transition-all duration-300 hover:scale-105",
          isActive
            ? "text-white/90 hover:bg-white/10"
            : "text-red-500 hover:bg-red-50 hover:text-red-600"
        )}
        title="Đăng xuất"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};
