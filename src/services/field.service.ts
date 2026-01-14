import { sendGet, sendPost, sendPostRaw } from "@/api";

export const FieldService = {
  getFields: async (id: number) => {
    const res = await sendGet(`/field/listField?catId=${id}`);
    return res.data;
  },

  addFields: async (fields: { objects: any[] }) => {
    const res = await sendPost("/field/addField", fields);
    return res;
  },

  delField: async (field: string) => {
    // Sử dụng sendPostRaw với Content-Type: application/json
    // Gửi JSON string như trong Angular version
    const res = await sendPostRaw("/field/delField", field, undefined, {
      "Content-Type": "application/json",
    });
    return res;
  },

  updateField: async (field: string) => {
    // Sử dụng sendPostRaw với Content-Type: application/json
    // Gửi JSON string như trong Angular version
    const res = await sendPostRaw("/field/updateField", field, undefined, {
      "Content-Type": "application/json",
    });
    return res;
  },
};
