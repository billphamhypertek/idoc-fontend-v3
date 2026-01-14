import { LoginResponse, ModuleNode, UserInfo } from "~/definitions";
import { STORAGE_KEYS } from "~/definitions/constants/storageKey.constant";
import { ROLES } from "~/definitions/constants/common.constant";

export const getUserInfo = (): UserInfo | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserInfo;
  } catch (e) {
    console.error("Failed to parse userInfo from localStorage:", e);
    return null;
  }
};
export const setUserInfo = (userInfo: UserInfo) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
};

export const getTokenIAM = (): string | null =>
  typeof window === "undefined"
    ? null
    : localStorage.getItem(STORAGE_KEYS.TOKEN_IAM);
export const setTokenIAM = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TOKEN_IAM, token);
};

export const getToken = (): string | null =>
  typeof window === "undefined"
    ? null
    : localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
export const setToken = (accessToken: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
};

export const getModules = (): ModuleNode[] | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.MODULES);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ModuleNode[];
  } catch (e) {
    console.error("Failed to parse modules from localStorage:", e);
    return null;
  }
};
export const setModules = (modules: ModuleNode[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
  window.dispatchEvent(new Event("modules:update"));
};

export const getModuleAll = (): ModuleNode[] | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.MODULE_ALL);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ModuleNode[];
  } catch (e) {
    console.error("Failed to parse moduleAll from localStorage:", e);
    return null;
  }
};
export const setModuleAll = (modules: ModuleNode[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MODULE_ALL, JSON.stringify(modules));
};

export const getLocalSubModulePath = (): ModuleNode[] | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.SUB_MODULE_PATH);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ModuleNode[];
  } catch (e) {
    console.error("Failed to parse moduleAll from localStorage:", e);
    return null;
  }
};
export const setLocalSubModulePath = (modules: ModuleNode[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SUB_MODULE_PATH, JSON.stringify(modules));
};

export const getTokenOffice = (): LoginResponse | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.TOKEN_OFFICE);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LoginResponse;
  } catch (e) {
    console.error("Failed to parse userInfo from localStorage:", e);
    return null;
  }
};
export const setTokenOffice = (tokenOffice: LoginResponse) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TOKEN_OFFICE, JSON.stringify(tokenOffice));
};

export const setAuthorize = (modulesOfUser: ModuleNode[]) => {
  const userInfo = getUserInfo();
  if (!userInfo) return;
  userInfo.authorize = modulesOfUser;
  setUserInfo(userInfo);
};
export const isClericalRole = () => {
  try {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    const roles = userInfo.roles || [];
    return roles.some((role) => role.name === ROLES.CLERICAL);
  } catch (e) {
    console.error("Invalid user info format:", e);
    return false;
  }
};

export const getLocalDefaultRole = () => {
  const info = getUserInfo();
  return info?.defaultRole ?? null;
};
