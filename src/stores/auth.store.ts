import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AuthState,
  LoginRequest,
  ModuleNode,
  Role,
  UserInfo,
} from "@/definitions/types/auth.type";
import {
  getToken,
  getUserInfo,
  setModuleAll,
  setModules,
  setToken,
  setTokenOffice,
  setUserInfo,
} from "@/utils/authentication.utils";
import {
  SESSION_KEYS,
  STORAGE_KEYS,
} from "@/definitions/constants/storageKey.constant";
import { publicPost, sendGet, sendPost } from "@/api";
import { addCookie, appendToFormData } from "@/utils/common.utils";
import { getBrowserQueryClient } from "@/provider/query-provider";
import { useEncryptStore } from "@/stores/encrypt.store";

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
  getTokenInfoVgca: () => Promise<string>;
  loginWithUsb: (serialNumber: string) => Promise<void>;
  setRole: (role: Role) => void;
  setDefaultRole: (role: Role) => void;
}

function addModule(userModule: ModuleNode[], allModule: ModuleNode[]) {
  if (!userModule) return;
  setModules(userModule);
  setModuleAll(allModule);
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      currentRole: null,
      checkAuth: () => {
        const authToken = localStorage.getItem("token");

        if (authToken) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false, user: null });
        }
      },

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true });
        try {
          const fd = appendToFormData(credentials);

          const response = await publicPost("/users/login", fd);
          const data = response.data.data;
          const { userInfo, tokenInfo, moduleList } = data;

          if (userInfo && userInfo.rememberPassword) {
            localStorage.setItem(
              STORAGE_KEYS.LENGTH_PASSWORD_BK,
              String(credentials.password.length)
            );
          } else {
            localStorage.removeItem(STORAGE_KEYS.LENGTH_PASSWORD_BK);
          }
          // Clear MENU_SIDEBAR on login to reset active menu state
          localStorage.removeItem(STORAGE_KEYS.MENU_SIDEBAR);
          setToken(tokenInfo.accessToken);
          addCookie(tokenInfo);
          addModule(userInfo.authorize, moduleList);
          setUserInfo(userInfo);
          setTokenOffice(data);
          set({
            user: userInfo,
            isAuthenticated: true,
          });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const userInfo = getUserInfo();
        let dataRemember;
        const token = getToken();

        // if (userInfo && userInfo.rememberPassword && timeOut === false) { //todo add idle
        if (userInfo && userInfo.rememberPassword) {
          dataRemember = {
            userName_Bk: userInfo.userName,
            passwordRamdom_Bk: Number(localStorage.getItem("lengthPW_Bk")),
            rememberPassword_Bk: userInfo.rememberPassword,
            token_Bk: token,
          };
        }
        const attrs = [
          "Path=/",
          "Max-Age=0",
          "expires=Thu, 01-Jan-70 00:00:01 GMT",
        ];
        document.cookie = `tokenInfo=; ${attrs.join("; ")}`;
        if (token) {
          await sendPost("/users/logout");
        }

        // Clear MENU_SIDEBAR before clearing all localStorage
        localStorage.removeItem(STORAGE_KEYS.MENU_SIDEBAR);
        localStorage.clear();

        if (dataRemember) {
          localStorage.setItem(
            STORAGE_KEYS.DATA_REMEMBER,
            JSON.stringify(dataRemember)
          );
        } else {
          localStorage.removeItem(STORAGE_KEYS.DATA_REMEMBER);
        }

        // if (Constant.AUTHEN_CAS) { //todo check logic redirect with login method
        //     window.location.href = Constant.LOGOUT;
        // } else if (Constant.AUTHEN_WSO) {
        //     window.location.href = Constant.LOGOUT_WSO;
        // } else if (timeOut) {
        //     this.router.navigate(['/login'], { queryParams: { returnUrl: Base64.encode(this.router.url) } });
        // } else {
        //     this.router.navigateByUrl('/login');
        // }
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        sessionStorage.removeItem(SESSION_KEYS.VAN_BAN_DEN_ENCRYPT);
        sessionStorage.removeItem(SESSION_KEYS.VAN_BAN_DI_ENCRYPT);
        sessionStorage.removeItem(SESSION_KEYS.SO_VB_ENCRYPT);
        useEncryptStore.getState().setEncrypt(false);
        // Clear React Query cache to prevent data from previous user
        const queryClient = getBrowserQueryClient();
        if (queryClient) {
          queryClient.clear();
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshToken: async () => {
        const oldToken = getToken();
        if (!oldToken) {
          await get().logout();
          return;
        }

        try {
          const response = await sendPost("/users/refresh-token", {
            oldToken,
            rememberPassword: false,
          });

          const { tokenInfo, userInfo, moduleList } = response.data;
          setToken(tokenInfo.accessToken);
          setUserInfo(userInfo);
          setModuleAll(moduleList);
        } catch (error) {
          await get().logout();
          throw error;
        }
      },

      setUser: (user: UserInfo | null) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      /* eslint-disable @typescript-eslint/no-explicit-any */
      getTokenInfoVgca: (): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (typeof (window as any).vgca_get_certinfo !== "function") {
            reject(new Error("USB Token chưa sẵn sàng"));
            return;
          }

          (window as any).vgca_get_certinfo((data: string) => {
            resolve(data);
          });
        });
      },

      loginWithUsb: async (serialNumber: string) => {
        set({ isLoading: true });
        try {
          const fd = appendToFormData({ serialToken: serialNumber });
          const response = await sendPost("/users/login/tk", fd);
          const data = response.data;
          const { tokenInfo, userInfo, moduleList } = data;
          addCookie(tokenInfo);
          addModule(userInfo.authorize, moduleList);
          setToken(tokenInfo.accessToken);
          setUserInfo(userInfo);
          setTokenOffice(data);
          set({
            user: userInfo,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Login USB Token failed:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      setRole: async (newRole) => {
        if (get().user?.currentRole == newRole.id) return;
        const response = await sendGet(`/users/switchRole/${newRole.id}`);
        const authorize = response.data;
        setModules(authorize);
        set((state) => {
          if (!state.user) return {};
          return {
            user: { ...state.user, authorize, currentRole: newRole.id },
          };
        });
      },
      setDefaultRole: async (newRole) => {
        if (get().user?.currentRole == newRole.id) return;
        await sendPost(`/users/updateDefaultRole`, null, {
          roleId: newRole.id,
        });
        set((state) => {
          if (!state.user) return {};
          return {
            user: {
              ...state.user,
              defaultRole: newRole.id,
            },
          };
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.checkAuth();
        }
      },
    }
  )
);

export default useAuthStore;
