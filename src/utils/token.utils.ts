import { Constant } from "@/definitions/constants/constant";

export const setDataEncrypt = (value: boolean) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("VAN_BAN_DEN_ENCRYPT", value.toString());
  }
};
export const setDataEncryptDi = (value: boolean) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("VAN_BAN_DI_ENCRYPT", value.toString());
  }
};
export const setDataEncryptDocBook = (data: boolean) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("SO_VB_ENCRYPT", String(data));
  }
};

// Helper function to get boolean value from storage
export const getEncryptDocBookValue = (): boolean => {
  const value = getDataEncryptDocBook();
  return value === "true";
};

export const getUserInfo = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userInfo");
  }
  return null;
};
export const parsedUserInfo = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }
  return null;
};

export const setUserInfo = (userInfo: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userInfo", userInfo);
  }
};

export const getTokenIAM = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("tokenIAM");
  }
  return null;
};

export const setTokenIAM = (userInfo: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("tokenIAM", userInfo);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const setToken = (tokenValue: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", tokenValue);
  }
};

export const getModules = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("modules");
  }
  return null;
};

export const getModuleAll = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("moduleAll");
  }
  return null;
};

export const setLocalCurrentRole = (roleId: number) => {
  const info = JSON.parse(getUserInfo() || "{}");
  info.currentRole = roleId;
  setUserInfo(JSON.stringify(info));
};

export const getLocalCurrentRole = () => {
  const info = JSON.parse(getUserInfo() || "{}");
  return info && info.currentRole ? info.currentRole : null;
};

export const getLocalSubModulePath = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("subModulePath");
  }
  return null;
};

export const setLocalSubModulePath = (path: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("subModulePath", JSON.stringify(path));
  }
};

export const getStatus = (status: number) => {
  switch (status) {
    case 0:
      return "Chờ xác nhận";
    case 1:
      return "Đang thực hiện";
    case 2:
      return "Từ chối";
    case 3:
      return "Chờ đánh giá";
    case 4:
      return "Hoàn thành";
    default:
      return "Chờ xác nhận";
  }
};

export const setAuthorize = (modulesOfUser: any) => {
  const info = JSON.parse(getUserInfo() || "{}");
  info.authorize = modulesOfUser;
  setUserInfo(JSON.stringify(info));
};

export const isClericalRole = () => {
  try {
    const userInfo = JSON.parse(getUserInfo() || "{}");
    const roles = userInfo.roles || [];
    return roles.some((role: any) => role.name === Constant.ROLES.CLERICAL);
  } catch (e) {
    console.error("Invalid user info format:", e);
    return false;
  }
};

export const isCheckRoleModule = () => {
  try {
    const modulesData = JSON.parse(getModules() || "[]");
    const roleModule = modulesData.flatMap((m: any) => m.subModule || []);
    console.log(roleModule, "roleModule");
    return roleModule.some(
      (role: any) => role.name === Constant.MODULE.MODULECLERICAL
    );
  } catch (e) {
    console.error("Invalid user info format:", e);
    return false;
  }
};

export const isClericalOrDeputyRoleDashboard = () => {
  try {
    const userInfo = JSON.parse(getUserInfo() || "{}");
    const roles = userInfo.roles || [];
    return roles.some(
      (role: any) =>
        role.name === Constant.ROLESDASH.NHANVIENORG ||
        role.name === Constant.ROLES.CLERICAL
    );
  } catch (e) {
    console.error("Invalid user info format:", e);
    return false;
  }
};

// export const isCheckOrg = () => {
//   try {
//     const userInfo = JSON.parse(getUserInfo());
//     const roles = userInfo.roles || [];
//     return roles.some(
//       (role) =>
//         role.name === Constant.ROLESDASH.TRUONGDONVI ||
//         role.name === Constant.ROLESDASH.DEPUTYORG
//     );
//   } catch (e) {
//     console.error('Invalid user info format:', e);
//     return false;
//   }
// };

export const isCheckOrg = () => {
  try {
    const roles = JSON.parse(getUserInfo() || "{}").authoritys || [];
    return (
      roles.some((r: any) => r.authority === Constant.ROLESDASH.LEADERSHIP) &&
      !roles.some(
        (r: any) => r.authority === Constant.ROLESDASH.LEADERSHIP_UNIT
      )
    );
  } catch {
    return false;
  }
};

export const isClericalDocumentOut = () => {
  const modules = JSON.parse(getModules() || "{}");
  const docIn = modules.find((x: any) => x.code == "DOCUMENT_IN");
  if (docIn && docIn != null) {
    const docInSub = docIn.subModule;
    const temp = docInSub.find((x: any) => x.code == "DRAFT_ISSUED");
    if (temp && temp != null) {
      //console.log('isClericalDocumentOut TRUE');
      return true;
    }
  }
  //console.log('isClericalDocumentOut FALSE');
  return false;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export const checkAuthentication = () => {
  const token = getToken();
  const result = !!token;
  console.log(`Check Authentication: ${result ? "Ok" : "Failed"}\n%s`, token);
  return result;
};

export const setLocalDefaultRole = (roleId: number) => {
  const info = JSON.parse(getUserInfo() || "{}");
  info.defaultRole = roleId;
  setUserInfo(JSON.stringify(info));
};

export const getLocalDefaultRole = () => {
  const info = JSON.parse(getUserInfo() || "{}");
  return info.defaultRole;
};

export const getCalendarRegisterTab = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("CalendarTab");
  }
  return null;
};

export const setCalendarRegisterTab = (tab: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("CalendarTab", tab);
  }
};

export const setDelegateTab = (tab: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("currentDelegateTab", tab);
  }
};

export const loadDelegateTab = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("currentDelegateTab");
  }
  return null;
};

export const removeDelegateTab = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentDelegateTab");
  }
};

export const getDataEncrypt = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("VAN_BAN_DEN_ENCRYPT");
  }
  return null;
};

export const removeDataEncrypt = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("VAN_BAN_DEN_ENCRYPT");
  }
};

export const getDataEncryptDi = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("VAN_BAN_DI_ENCRYPT");
  }
  return null;
};

export const removeDataEncryptDi = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("VAN_BAN_DI_ENCRYPT");
  }
};
export const removeDataEncryptAll = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("VAN_BAN_DI_ENCRYPT");
    sessionStorage.removeItem("VAN_BAN_DEN_ENCRYPT");
    sessionStorage.removeItem("SO_VB_ENCRYPT");
  }
};

export const getDataEncryptDocBook = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("SO_VB_ENCRYPT");
  }
  return null;
};

export const removeDataEncryptDocBook = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("SO_VB_ENCRYPT");
  }
};

export const setDoccumentDetailOut = (data: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("DOCUMENT_OUT_DETAIL" + data, "true");
  }
};

export const getDoccumentDetailOut = (data: string) => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("DOCUMENT_OUT_DETAIL" + data);
  }
  return null;
};

export const setDoccumentDetailIn = (data: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("DOCUMENT_IN_DETAIL" + data, "true");
  }
};

export const getDoccumentDetailIn = (data: string) => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("DOCUMENT_IN_DETAIL" + data);
  }
  return null;
};

export default {
  setDataEncrypt,
  setDataEncryptDi,
  setDataEncryptDocBook,
};

export const isTruongOrPhoTruongPhong = () => {
  try {
    const raw: any = getUserInfo();
    const userInfo = typeof raw === "string" ? JSON.parse(raw) : raw;
    const norm = (s: any): string =>
      (s ? String(s) : "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const keys = ["truong phong", "pho truong phong"];
    const hasKey = (text: any): boolean => {
      const n = norm(text);
      for (let i = 0; i < keys.length; i++) {
        if (n.indexOf(keys[i]) !== -1) return true;
      }
      return false;
    };
    if (
      userInfo &&
      userInfo.positionModel &&
      hasKey(userInfo.positionModel.name)
    ) {
      return true;
    }
    if (userInfo && Array.isArray(userInfo.additionalPositions)) {
      for (let i = 0; i < userInfo.additionalPositions.length; i++) {
        const p: any = userInfo.additionalPositions[i];
        if (p && hasKey(p.name)) return true;
      }
    }
    if (userInfo && Array.isArray(userInfo.roles)) {
      for (let i = 0; i < userInfo.roles.length; i++) {
        const r = userInfo.roles[i];
        if (r && hasKey(r.name)) return true;
      }
    }
    return false;
  } catch (e) {
    console.error("Invalid user info format:", e);
    return false;
  }
};
