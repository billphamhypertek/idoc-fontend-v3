/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  cancelTokenSource,
  protectedAxiosInstance,
} from "~/api/axiosInstances";

/**
 * Protected apis
 */
export const sendGet = (url: string, params?: any, config?: any) =>
  protectedAxiosInstance
    .get(url, { params, ...config })
    .then((res) => res.data);
export const sendGetMultiple = (url: string, params?: any, config?: any) =>
  protectedAxiosInstance
    .get(url, {
      params,
      paramsSerializer: (params) => {
        // Use URLSearchParams to serialize without brackets
        const searchParams = new URLSearchParams();
        Object.keys(params || {}).forEach((key) => {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, item));
          } else {
            searchParams.append(key, value);
          }
        });
        return searchParams.toString();
      },
      ...config,
    })
    .then((res) => res.data);
export const sendGetWitCancelToken = (
  url: string,
  cancelToken: any,
  params?: any
) =>
  protectedAxiosInstance
    .get(url, { cancelToken, params })
    .then((res) => res.data);

export const sendPost = (url: string, params?: any, queryParams?: any) =>
  protectedAxiosInstance
    .post(url, params, { params: queryParams })
    .then((res) => res.data);

export const sendPostRaw = (
  url: string,
  raw: string,
  queryParams?: any,
  customHeaders?: any
) =>
  protectedAxiosInstance
    .post(url, raw, {
      params: queryParams,
      headers: customHeaders || { "Content-Type": "text/plain;charset=UTF-8" },
      transformRequest: [(d) => d],
    })
    .then((res) => res.data);

export const sendPostUpload = (url: string, params?: any, callback?: any) =>
  protectedAxiosInstance
    .post(url, params, {
      onUploadProgress: (event) => callback(event),
      cancelToken: cancelTokenSource.token,
    })
    .then((res) => res.data);

export const sendPostBlob = (url: string, params?: any) =>
  protectedAxiosInstance
    .post(url, params, { responseType: "blob" })
    .then((res) => res.data);

export const sendPut = (url: string, params?: any) =>
  protectedAxiosInstance.put(url, params).then((res) => res.data);

export const sendPatch = (url: string, params?: any) =>
  protectedAxiosInstance.patch(url, params).then((res) => res.data);

// Dùng cho các API yêu cầu Content-Type: application/x-www-form-urlencoded
// - Cần thiết cho API cụ thể: /task/list/main/notyet yêu cầu application/x-www-form-urlencoded. Nếu dùng sendPost (JSON), API sẽ fail.
// - Không thể dùng hàm khác: sendPost gửi JSON, không phù hợp cho form-urlencoded.
// - Tái sử dụng: Nếu có API khác cần form-urlencoded, có thể dùng lại.
export const sendPostFormUrlEncoded = (url: string, params?: any) =>
  protectedAxiosInstance
    .post(url, new URLSearchParams(params))
    .then((res) => res.data);

export const sendDelete = (url: string, params?: any) =>
  protectedAxiosInstance.delete(url, { params }).then((res) => res.data);
