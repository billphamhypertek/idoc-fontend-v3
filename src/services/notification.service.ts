import { Constant } from "@/definitions/constants/constant";
import { sendGet, sendPost } from "@/api";
import { VehicleService } from "./vehicle.service";

let countUnReadNotification = 0;

export const HIGHLIGHT_MENU_H05 = Constant.HIGHLIGHT_MENU_H05;

export const getAllNotification = async (page: number, pageSize: number) => {
  const res = await sendGet(`/notification/get/${page}/${pageSize}`);
  return res.data;
};

export const getAllListNotification = async (
  page: number,
  pageSize: number
) => {
  const res = await sendGet(
    `/notification/getAll?page=${page}&size=${pageSize}`
  );
  return res.data;
};

export const getAllNotificationToken = async (
  page: number,
  pageSize: number
) => {
  const res = await sendGet(
    `/notification/get/${page}/${pageSize}?encrypt=true`
  );
  return res.data;
};

export const getAllTotal = async () => {
  return await sendGet("/notification/getTotal");
};

export const deleteNotById = async (not: { id: string }) => {
  const res = await sendPost(`/notification/delete/${not.id}`, null);
  return res.data;
};

export const updateStatus = async (not: { id: string }) => {
  const res = await sendPost(`/notification/setRead/${not.id}`, null);
  return res.data;
};

export const deleteAll = async () => {
  const res = await sendPost("/notification/deleteAll", null);
  return res.data;
};

export const checkRoleInNotification = async (notiId: string) => {
  const res = await sendPost(`/notification/checkModule/${notiId}`, null);
  return res.data;
};

export const countUnreadNotification = async () => {
  try {
    const res = await sendGet("/notification/countUnread");
    countUnReadNotification = res.data;
    console.log("countUnReadNotification :", countUnReadNotification);

    if (HIGHLIGHT_MENU_H05) {
      await VehicleService.getMenuBadge();
    }
  } catch (e) {
    console.error(e);
  }
};

export const countUnreadNotificationFunction = async () => {
  try {
    const res = await sendGet("/notification/countUnread");
    countUnReadNotification = res.data;
    if (HIGHLIGHT_MENU_H05) {
      await VehicleService.getMenuBadge();
    }
  } catch (e) {
    console.error(e);
  }
};

export const getCountUnread = () => countUnReadNotification;
export const notificationService = {
  countUnreadNotification,
  countUnreadNotificationFunction,
  getAllNotification,
  getAllListNotification,
  getAllNotificationToken,
  getAllTotal,
  deleteNotById,
  updateStatus,
  deleteAll,
  checkRoleInNotification,
  getCountUnread,
};
