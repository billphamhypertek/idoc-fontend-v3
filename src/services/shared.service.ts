import { getUserInfo } from "@/utils/token.utils";

export class SharedService {
  static increaseNumber: number = 0;

  static selectedDate: Date | null = null;

  static currentMenuDocumentIn: number | null = null;

  static currentTabDocumentIn: string | null = null;

  static currentMenuDocumentOut: string | null = null;

  static currentTabDocumentOut: string | null = null;

  static currentUrl: string | null = null;

  static currentMenuDocumentInternal: string | null = null;

  static currentDocInternalId: string | null = null;

  static isOfCurrentUser(userId: number): boolean {
    const userInfo = localStorage.getItem("userInfo");
    return !!userInfo && JSON.parse(userInfo || "{}")?.id === userId;
  }

  static setCurrentMenuDocIn(menu: number): void {
    SharedService.currentMenuDocumentIn = menu;
    localStorage.setItem("currentMenuDocIn", String(menu));
  }

  static setCurrentTabDocIn(tab: string): void {
    SharedService.currentTabDocumentIn = tab;
    localStorage.setItem("currentTabDocIn", tab);
  }

  static loadCurrentMenuTab(): any {
    return {
      currentMenu: Number(localStorage.getItem("currentMenuDocIn")),
      currentTab: localStorage.getItem("currentTabDocIn"),
    };
  }

  static setCurrentMenuDocOut(menu: string): void {
    SharedService.currentMenuDocumentOut = menu;
    localStorage.setItem("currentMenuDocOut", menu);
  }

  static setCurrentTabDocOut(tab: string): void {
    SharedService.currentTabDocumentOut = tab;
    localStorage.setItem("currentTabDocOut", tab);
  }

  static loadCurrentMenuTabOut(): void {
    if (
      SharedService.currentMenuDocumentOut == null ||
      SharedService.currentTabDocumentOut == null
    ) {
      SharedService.currentMenuDocumentOut =
        localStorage.getItem("currentMenuDocOut");
      SharedService.currentTabDocumentOut =
        localStorage.getItem("currentTabDocOut");
    }
  }

  static setCurrentMenuDocInternal(menu: string): void {
    SharedService.currentMenuDocumentInternal = menu;
    localStorage.setItem("currentMenuDocInternal", menu);
  }

  static setCurrentDocInternalId(docId: string): void {
    SharedService.currentDocInternalId = docId;
    localStorage.setItem("currentDocInternalId", docId);
  }

  static loadCurrentMenuInternal(): void {
    if (!SharedService.currentMenuDocumentInternal) {
      SharedService.currentMenuDocumentInternal = localStorage.getItem(
        "currentMenuDocInternal"
      );
    }
    if (!SharedService.currentDocInternalId) {
      SharedService.currentDocInternalId = localStorage.getItem(
        "currentDocInternalId"
      );
    }
  }
}

export const b64EncodeUnicode = (str: string): string | null => {
  if (
    typeof window !== "undefined" &&
    "btoa" in window &&
    "encodeURIComponent" in window
  ) {
    return btoa(
      encodeURIComponent(str).replace(/%([\dA-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  }
  console.warn(
    "b64EncodeUnicode requirements: window.btoa and window.encodeURIComponent functions"
  );
  return null;
};

export const b64DecodeUnicode = (str: string): string => {
  return decodeURIComponent(
    Array.prototype.map
      .call(
        atob(str),
        (c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`
      )
      .join("")
  );
};

export const isInSignList = (listSignIds: number[]): boolean => {
  console.log(listSignIds);
  if (listSignIds) {
    const userId = JSON.parse(getUserInfo() || "{}").id;
    for (const id of listSignIds) {
      console.log(id);
      if (id === userId) {
        return true;
      }
    }
  }
  return false;
};
