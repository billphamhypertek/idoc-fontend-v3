import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { CookieAttributes } from "~/definitions/types/cookies.type";

const Cookies = {
  get: (name: string) => {
    return getCookie(name);
  },
  set: (
    name: string,
    value: string | object,
    options?: CookieAttributes | undefined
  ) => {
    const expiredDate = new Date();
    if (typeof options?.expires === "number") {
      expiredDate.setTime(
        expiredDate.getTime() + options?.expires * 24 * 60 * 60 * 1000
      );
      return setCookie(name, value, {
        expires: options?.expires ? expiredDate : undefined,
      });
    }

    return setCookie(name, value, {
      expires: options?.expires,
    });
  },
  remove: (name: string) => {
    return deleteCookie(name);
  },
};

export default Cookies;
