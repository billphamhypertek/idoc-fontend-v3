"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  setToken,
  setUserInfo,
  setModules,
  setModuleAll,
  setTokenOffice,
} from "@/utils/authentication.utils";
import useAuthStore from "@/stores/auth.store";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { sendGet } from "@/api";
import LoadingFull from "@/components/common/LoadingFull";
import { addCookie } from "@/utils/common.utils";
import { useRouter } from "next/navigation";

export default function AutoLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const handleAutoLogin = async () => {
      try {
        const token = searchParams?.get("token");
        const redirect = searchParams?.get("redirect") || "/";

        if (!token) {
          window.location.replace("/login");
          return;
        }

        setToken(token);

        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          const response = await sendGet("/users/refresh-token2", {
            rememberPassword: false,
          });

          const { tokenInfo, userInfo, moduleList } = response.data;

          if (!tokenInfo || !userInfo) {
            throw new Error("Dữ liệu từ API không hợp lệ");
          }

          setToken(tokenInfo.accessToken);

          addCookie(tokenInfo);

          setUserInfo(userInfo);

          if (userInfo.authorize) {
            setModules(userInfo.authorize);
          }
          if (moduleList) {
            setModuleAll(moduleList);
          }

          if (response && response.data) {
            setTokenOffice(response.data);
          }

          localStorage.removeItem(STORAGE_KEYS.MENU_SIDEBAR);

          setUser(userInfo);
          setLoading(false);
          useAuthStore.setState({ isAuthenticated: true, user: userInfo });

          // Wait a bit to ensure all state is set
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Change URL to redirect path AFTER cookie is set
          const redirectUrl = decodeURIComponent(redirect);
          // window.history.replaceState(null, "", redirectUrl);

          // // Reload the page to navigate to the new URL with the cookie
          // window.location.reload();
          router.replace(redirectUrl);
        } catch (apiError: any) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          window.location.replace("/login");
        }
      } catch (error: any) {
        window.location.replace("/login");
      }
    };

    handleAutoLogin();
  }, [searchParams, setUser, setLoading]);

  return <LoadingFull isLoading={true} opacity={true} />;
}
