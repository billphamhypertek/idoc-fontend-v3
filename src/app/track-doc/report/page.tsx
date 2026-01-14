"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileSpreadsheet } from "lucide-react";
import { TrackDocService } from "@/services/trackdoc.service";
import { saveAs } from "file-saver";
import { getErrorMessage } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";

interface ReportDocUnit {
  orgName: string;
  secretInDocOut: number;
  secretOutDocOut: number;
  secretDocOut: number;
  scanDocOut: number;
  fullProcessDocOut: number;
  signedDocOut: number;
  normalInDocOut: number;
  normalOutDocOut: number;
  normalDocOut: number;
  totalDocOut: number;
  secretDoc: number;
  normalDoc: number;
  paperHandleDoc: number;
  digitalHandleDoc: number;
  tphcDoc: number;
  lddvDoc: number;
  ldpDoc: number;
  nvDoc: number;
  totalDoc: number;
  totalUser: number;
  loginUser: number;
}

export default function TrackDocReport() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportDocUnit, setReportDocUnit] = useState<ReportDocUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Tính tuần của năm từ một ngày (giống v1)
  const getWeekOfYear = (date: Date): number => {
    let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 1 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    let weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    weekNo += 1;
    return weekNo;
  };

  // Format date thành yyyy-MM-dd
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Lấy khoảng ngày của tuần (thứ 2 đến chủ nhật) - giống logic v1
  const getDateRangeOfWeek = (weekNo: number) => {
    const today = new Date();
    const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Tìm thứ 2 của tuần hiện tại
    const numOfdaysPastSinceLastMonday =
      d1.getDay() === 0 ? 0 : d1.getDay() - 1;
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);

    // Tính tuần hiện tại
    const weekNoToday = getWeekOfYear(d1);
    const weeksInTheFuture = weekNo - weekNoToday;

    // Xử lý trường hợp đặc biệt (giống v1)
    if (d1.getDate() === 31 && d1.getDay() === 0) {
      d1.setDate(d1.getDate() - 6);
    }

    // Tính thứ 2 của tuần cần tìm
    d1.setDate(d1.getDate() + 7 * weeksInTheFuture);
    const rangeIsFrom = formatDateToString(d1);

    // Tính chủ nhật của tuần đó (thứ 2 + 6 ngày)
    d1.setDate(d1.getDate() + 6);
    const rangeIsTo = formatDateToString(d1);

    return {
      startDate: rangeIsFrom,
      endDate: rangeIsTo,
    };
  };

  // Set date range theo tuần hiện tại
  const setDateRangeByCurrentWeek = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentWeek = getWeekOfYear(today);

    // Xử lý logic tính tuần (giống v1)
    const yearEnd = new Date(currentYear, 11, 31);
    const yearStart = new Date(currentYear, 0, 1);
    const weekSearch =
      yearEnd.getDay() === 0 || yearStart.getDay() === 1
        ? currentWeek - 1
        : currentWeek;

    const dateRange = getDateRangeOfWeek(weekSearch);
    setStartDate(dateRange.startDate);
    setEndDate(dateRange.endDate);
  };

  // Load data on mount với giá trị theo tuần hiện tại
  useEffect(() => {
    setDateRangeByCurrentWeek();
  }, []);

  // Gọi API khi startDate và endDate đã được set
  useEffect(() => {
    if (startDate && endDate) {
      getAllDataDocReport();
    }
  }, [startDate, endDate]);

  const getAllDataDocReport = async () => {
    setLoading(true);
    try {
      const data = await TrackDocService.getAllDataDocReports(
        startDate,
        endDate,
        ""
      );
      setReportDocUnit(Array.isArray(data) ? data : (data?.objList ?? []));
    } catch (error) {
      console.error("Error fetching report data:", error);
      setReportDocUnit([]);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    try {
      const blob = await TrackDocService.downloadReporDocExcel(
        startDate,
        endDate
      );

      const blobObj = new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blobObj, `THONG_KE_HDH_TU_${startDate}_DEN_${endDate}.xlsx`);
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      const errorMessage = await getErrorMessage(error);
      ToastUtils.error(
        errorMessage || "Lỗi khi tải file Excel. Vui lòng thử lại!"
      );
    }
  };

  const calculatePercentage = (part: number, total: number): number => {
    if (total === 0) {
      return 0;
    }
    const percentage = (part / total) * 100;
    return Math.round(percentage * 10) / 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getAllDataDocReport();
  };

  return (
    <div className="space-y-4 p-3">
      <div className="card border rounded-lg shadow-sm">
        <div className="card-title p-4 border-b">
          <h4 className="font-bold text-lg m-0">
            Báo cáo số liệu Hệ thống quản lý văn bản và điều hành tác nghiệp
          </h4>
        </div>

        <div className="container-fluid p-4">
          <form onSubmit={handleSubmit} className="form-horizontal">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium mb-2"
                  >
                    Từ ngày
                  </label>
                  <Input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium mb-2"
                  >
                    Đến ngày
                  </label>
                  <Input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center gap-2 mt-3 mb-1">
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="w-4 h-4 mr-1" />
                    Tìm kiếm
                  </Button>
                  <Button
                    type="button"
                    onClick={exportExcel}
                    variant="outline"
                    disabled={!reportDocUnit || reportDocUnit.length === 0}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Table 1: Thống kê văn bản đi các đơn vị */}
        <div className="mt-1 px-3 pb-3">
          <div className="label-report mb-3">
            <span className="text-sm font-semibold">
              Thống kê văn bản đi các đơn vị
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    STT
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Đơn vị
                  </th>
                  <th
                    colSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Văn bản mật
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Số lượng VB mật của đơn vị
                  </th>
                  <th
                    colSpan={8}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Văn bản thường
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Số lượng VB thường của đơn vị
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Tổng số VB đi của đơn vị
                  </th>
                </tr>
                <tr>
                  <th className="border border-gray-300 p-2 text-center">
                    Gửi trong Ban
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Gửi ngoài Ban
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Giấy
                  </th>
                  <th className="border border-gray-300 p-2 text-center text-red-600 font-bold">
                    Tỉ lệ %
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Toàn trình
                  </th>
                  <th className="border border-gray-300 p-2 text-center text-red-600 font-bold">
                    Tỉ lệ %
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Ký số
                  </th>
                  <th className="border border-gray-300 p-2 text-center text-red-600 font-bold">
                    Tỉ lệ %
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Gửi trong Ban
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Gửi ngoài Ban
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  reportDocUnit.map((reportItem, i) => (
                    <tr
                      key={i}
                      className={
                        reportItem.orgName.toLowerCase() === "tổng số toàn ban"
                          ? "font-bold"
                          : ""
                      }
                    >
                      <td className="border border-gray-300 p-2 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.orgName}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.secretInDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.secretOutDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.secretDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.scanDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center text-red-600 font-bold">
                        {calculatePercentage(
                          reportItem.scanDocOut || 0,
                          reportItem.normalDocOut || 0
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.fullProcessDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center text-red-600 font-bold">
                        {calculatePercentage(
                          reportItem.fullProcessDocOut || 0,
                          reportItem.normalDocOut || 0
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.signedDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center text-red-600 font-bold">
                        {calculatePercentage(
                          reportItem.signedDocOut || 0,
                          reportItem.normalDocOut || 0
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.normalInDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.normalOutDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.normalDocOut || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.totalDocOut || 0}
                      </td>
                    </tr>
                  ))}
                {loading && (
                  <tr>
                    <td
                      colSpan={15}
                      className="border border-gray-300 p-8 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Thống kê văn bản đến các đơn vị */}
        <div className="mt-1 px-3 pb-3">
          <div className="label-report mb-3">
            <span className="text-sm font-semibold">
              Thống kê văn bản đến các đơn vị
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    STT
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Đơn vị
                  </th>
                  <th
                    colSpan={1}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Văn bản mật
                  </th>
                  <th
                    colSpan={7}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Văn bản thường
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-300 p-2 text-center"
                  >
                    Tổng số VB đến của đơn vị
                  </th>
                </tr>
                <tr>
                  <th className="border border-gray-300 p-2 text-center">
                    Số lượng
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Văn thư
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Văn bản xử lý giấy
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Văn bản xử lý điện tử
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Trưởng phòng hành chính
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Lãnh đạo đơn vị
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Lãnh đạo phòng
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Trợ lý, nhân viên
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  reportDocUnit.map((reportItem, i) => (
                    <tr
                      key={i}
                      className={
                        reportItem.orgName.toLowerCase() === "tổng số toàn ban"
                          ? "font-bold"
                          : ""
                      }
                    >
                      <td className="border border-gray-300 p-2 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.orgName}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.secretDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.normalDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.paperHandleDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.digitalHandleDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.tphcDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.lddvDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.ldpDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.nvDoc || 0}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {reportItem.totalDoc || 0}
                      </td>
                    </tr>
                  ))}
                {loading && (
                  <tr>
                    <td
                      colSpan={11}
                      className="border border-gray-300 p-8 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Thống kê tỉ lệ người dùng */}
        <div className="mt-1 px-3 pb-3">
          <div className="label-report mb-3">
            <span className="text-sm font-semibold">
              Thống kê tỉ lệ người dùng
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-center">
                    STT
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Đơn vị
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Tổng số tài khoản đã cấp
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Số tài khoản truy cập
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Tỉ lệ truy cập (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  reportDocUnit
                    .filter(
                      (item) =>
                        item.orgName.toLowerCase() !== "ban cơ yếu chính phủ"
                    )
                    .map((reportItem, i) => (
                      <tr
                        key={i}
                        className={
                          reportItem.orgName.toLowerCase() ===
                          "tổng số toàn ban"
                            ? "font-bold"
                            : ""
                        }
                      >
                        <td className="border border-gray-300 p-2 text-center">
                          {i + 1}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {reportItem.orgName}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {reportItem.totalUser || 0}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {reportItem.loginUser || 0}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {calculatePercentage(
                            reportItem.loginUser || 0,
                            reportItem.totalUser || 0
                          )}
                        </td>
                      </tr>
                    ))}
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-gray-300 p-8 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
