import { sendGet, sendPost } from "@/api";

export const ValueService = {
  addValues: async (values: any) => {
    const res = await sendPost("/values/addValues", values);
    return res.data;
  },

  updateValues: async (values: any) => {
    const res = await sendPost("/values/updateValues", values);
    return res.data;
  },

  loadValues: async (catid: number, docid: number) => {
    const res = await sendGet(`/values/getValues/${catid}/${docid}`);
    return res.data;
  },
};
