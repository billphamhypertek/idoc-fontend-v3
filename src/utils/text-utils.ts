import { Constant } from "@/definitions/constants/constant";

export const TextUtils = {
  convertTextToEmpty(text: any): string {
    if (text == undefined || text == null) {
      return "";
    } else {
      return text;
    }
  },

  convertTextToObjectNull(text: any): any {
    if (text == undefined || text == null || text == "") {
      return null;
    } else {
      return text;
    }
  },

  formatNgbDate(ngbDate: any, fomat: string) {
    if (
      ngbDate != undefined &&
      ngbDate != null &&
      ngbDate.day != null &&
      ngbDate.month != null &&
      ngbDate.year != null
    ) {
      const jsDate = new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
      // return this.datePipe.transform(jsDate, fomat); // hoặc 'yyyy-MM-dd'
    } else {
      return null;
    }
  },
  formatDate(date: Date, format: string = "yyyy-MM-dd"): string | "" {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const map: { [key: string]: string } = {
      dd: pad(date.getDate()),
      MM: pad(date.getMonth() + 1),
      yyyy: date.getFullYear().toString(),
      yy: date.getFullYear().toString().slice(-2),
    };

    return format.replace(/dd|MM|yyyy|yy/g, (matched) => map[matched]);
  },

  ngbDateToString(date: any | null): string {
    if (!date) return "";

    const day = date.day.toString().padStart(2, "0");
    const month = date.month.toString().padStart(2, "0");
    const year = date.year;

    return `${year}-${month}-${day}`;
  },

  formatNgbDateEmpty(ngbDate: any, fomat: string = "yyyy-MM-dd") {
    if (
      ngbDate != undefined &&
      ngbDate != null &&
      ngbDate.day != null &&
      ngbDate.month != null &&
      ngbDate.year != null
    ) {
      const jsDate = new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
      // return this.datePipe.transform(jsDate, fomat); // hoặc 'yyyy-MM-dd'
    } else {
      return "";
    }
  },

  isValidJson(str: string): boolean {
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === "object" && parsed !== null;
    } catch (e) {
      return false;
    }
  },

  getNameMenu(code: string, name: string, doMat: boolean): string {
    let nameStr = "";
    if (doMat) {
      nameStr =
        name.replace("mật", "").trim() +
        (Constant.LIST_CODE_MENU_MAT.filter((x) => x == code).length > 0
          ? " mật"
          : "");
    } else {
      nameStr = name.replace("mật", "").trim();
    }
    return nameStr;
  },

  // checkMenuRoute(route: string): boolean {
  //   const menu = getModules();
  //   const listData = [];
  //   if (this.isValidJson(menu)) {
  //     const json = JSON.parse(menu);
  //     json.forEach((x: any) => {
  //       if (x.subModule.length > 0) {
  //         listData.push(...x.subModule);
  //       }
  //     });
  //     return listData.filter(x => x.routerPath == this.convertTextToEmpty(route)).length > 0;
  //   } else {
  //     return false;
  //   }
  // }

  getInitials(fullName: string): string {
    if (!fullName) return "";
    return fullName
      .trim() // loại bỏ khoảng trắng thừa
      .split(/\s+/) // tách theo khoảng trắng
      .map((word) => word.charAt(0).toUpperCase()) // lấy chữ cái đầu & viết hoa
      .join(""); // ghép lại
  },
};
