import {
  UserAuthority,
  UserAction,
  UserLogin,
} from "@/definitions/types/watch-list.type";

export const checkAuthorityBtn = (
  authorArr: UserAuthority[],
  userLogin: UserLogin
): { userAction: UserAction; orgPermission: number[] } => {
  // Khởi tạo userAction với giá trị mặc định
  const userAction: UserAction = {
    canDelete: false,
    canUpdate: false,
    canAdd: false,
    approveInUnit: false,
    approveInBan: false,
    createInBan: false,
  };

  const orgPermission: number[] = [];

  // Duyệt qua từng authority
  for (let i = 0; i < authorArr.length; i++) {
    const authority = authorArr[i].authority;

    switch (authority) {
      case "APPROVE_WATCH_LIST_UNIT":
        userAction.approveInUnit = true;
        userAction.canAdd = true;
        userAction.canDelete = true;
        userAction.canUpdate = true;
        break;

      case "APPROVE_WATCH_LIST_BAN":
        userAction.approveInBan = true;
        userAction.canAdd = true;
        userAction.canDelete = true;
        userAction.canUpdate = true;
        break;

      case "CREATE_WATCH_LIST_BAN":
        userAction.createInBan = true;
        userAction.canAdd = true;
        userAction.canDelete = true;
        userAction.canUpdate = true;
        break;

      default:
        userAction.canAdd = true;
        userAction.canDelete = true;
        userAction.canUpdate = true;
        break;
    }
  }

  // Thêm org hiện tại
  orgPermission.push(userLogin.org);

  // Thêm các org dựa trên quyền
  Object.entries(userAction).forEach(([key, value]) => {
    if (key === "approveInUnit" && value) {
      orgPermission.push(userLogin.orgModel.parentId);
    } else if (key === "approveInBan" && value) {
      orgPermission.push(2);
    } else if (key === "createInBan" && value) {
      orgPermission.push(2);
    }
  });

  // Loại bỏ duplicate
  const departmentIds = removeDuplicates(orgPermission);

  localStorage.setItem("orgPermission", departmentIds.toString());

  return {
    userAction,
    orgPermission: departmentIds,
  };
};

// Helper function
const removeDuplicates = (arr: number[]): number[] => {
  return arr.filter((value, index, self) => self.indexOf(value) === index);
};
