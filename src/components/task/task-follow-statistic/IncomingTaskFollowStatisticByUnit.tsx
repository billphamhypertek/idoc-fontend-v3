"use client";

import React, { useState, useMemo } from "react";
import "./styles.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

interface TaskStatisticData {
  orgId: number;
  orgName: string;
  completedTaskCount: number;
  notCompletedTaskCount: number;
  outOfDateTaskCount: number;
}

interface IncomingTaskFollowStatisticByUnitProps {
  dataOfUnits: TaskStatisticData[];
}

interface ProcessedData extends TaskStatisticData {
  completedTaskCountPercent: number;
  notCompletedTaskCountPercent: number;
  outOfDateTaskCountPercent: number;
}

const IncomingTaskFollowStatisticByUnit: React.FC<
  IncomingTaskFollowStatisticByUnitProps
> = ({ dataOfUnits }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const percentage = (partialValue: number, totalValue: number): number => {
    return totalValue > 0
      ? Math.round(((100 * partialValue) / totalValue) * 100) / 100
      : 0;
  };

  const processedData: ProcessedData[] = useMemo(() => {
    if (!dataOfUnits || dataOfUnits.length === 0) return [];

    const processed = dataOfUnits.map((item) => {
      const total =
        item.completedTaskCount +
        item.notCompletedTaskCount +
        item.outOfDateTaskCount;
      return {
        ...item,
        completedTaskCountPercent: percentage(item.completedTaskCount, total),
        notCompletedTaskCountPercent: percentage(
          item.notCompletedTaskCount,
          total
        ),
        outOfDateTaskCountPercent: percentage(item.outOfDateTaskCount, total),
      };
    });

    return processed.sort(
      (a, b) => b.completedTaskCountPercent - a.completedTaskCountPercent
    );
  }, [dataOfUnits]);

  const sampleData = useMemo(() => {
    return processedData.slice(0, 5);
  }, [processedData]);

  const generateExcelTaskStatistic = (
    title: string,
    header1: string[],
    header2: string[],
    data: any[][],
    filename: string
  ) => {
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Thống kê");

    // Add Row and formatting
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { name: "Times New Roman", size: 18, bold: true };
    titleRow.alignment = { vertical: "middle" };
    worksheet.addRow([]);

    // Add Export File Date
    const currentDate = new Date();
    const currentDateRow = worksheet.addRow([
      `${
        currentDate.getDay() < 7
          ? "Thứ " + (currentDate.getDay() + 1)
          : "Chủ nhật"
      }, Ngày ${currentDate.getDate()} tháng ${
        currentDate.getMonth() + 1
      } năm ${currentDate.getFullYear()}`,
    ]);
    currentDateRow.font = { name: "Times New Roman", size: 14 };
    currentDateRow.alignment = {
      vertical: "bottom",
      horizontal: "right",
      wrapText: true,
    };

    worksheet.mergeCells("A1:I2");
    worksheet.mergeCells("A3:I3");
    // Blank Row
    worksheet.addRow([]);
    // Add Header Row
    const headerRow = worksheet.addRow(header1);
    const headerRow2 = worksheet.addRow(header2);

    //Merge Cell: Task Status
    worksheet.mergeCells("C5:D5");
    worksheet.mergeCells("E5:F5");
    worksheet.mergeCells("G5:H5");
    worksheet.mergeCells("A5:A6");
    worksheet.mergeCells("B5:B6");
    worksheet.mergeCells("I5:I6");

    // Cell Style : Fill and Border
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "e9f9f7" },
        bgColor: { argb: "e9f9f7" },
      };
      cell.font = { name: "Times New Roman", size: 14, bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    headerRow2.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "e9f9f7" },
        bgColor: { argb: "e9f9f7" },
      };
      cell.font = { name: "Times New Roman", size: 14, bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add Data and Conditional Formatting
    data.forEach((d) => {
      const row = worksheet.addRow(d);
      row.font = { name: "Times New Roman", size: 14 };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    worksheet.getColumn(1).width = 8; // STT
    worksheet.getColumn(1).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(2).width = 45; // Đơn vị
    worksheet.getColumn(2).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(3).width = 20; // Hoàn thành - Số lượng
    worksheet.getColumn(3).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(4).width = 20; // Hoàn thành - Phần trăm
    worksheet.getColumn(4).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(5).width = 20; // Chưa hoàn thành - Số lượng
    worksheet.getColumn(5).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(6).width = 20; // Chưa hoàn thành - Phần trăm
    worksheet.getColumn(6).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(7).width = 20; // Quá hạn - Số lượng
    worksheet.getColumn(7).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(8).width = 20; // Quá hạn - Phần trăm
    worksheet.getColumn(8).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(9).width = 20; // Tổng số công việc
    worksheet.getColumn(9).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.addRow([]);
    workbook.xlsx.writeBuffer().then((dt) => {
      const blob = new Blob([dt], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const currentDate = new Date();
      const dateString = `${currentDate.getDate().toString().padStart(2, "0")}_${(currentDate.getMonth() + 1).toString().padStart(2, "0")}_${currentDate.getFullYear()}`;
      saveAs(blob, `${filename}_${dateString}.xlsx`);
    });
  };

  const exportExcel = () => {
    const header1 = [
      "TT",
      "Đơn vị",
      "Hoàn thành",
      "",
      "Chưa hoàn thành",
      "",
      "Quá hạn",
      "",
      "Tổng số công việc",
    ];

    const header2 = [
      "",
      "",
      "Số lượng",
      "Phần trăm (%)",
      "Số lượng",
      "Phần trăm (%)",
      "Số lượng",
      "Phần trăm (%)",
      "",
    ];

    const excelData = processedData.map((item, index) => [
      index + 1,
      item.orgName || "",
      item.completedTaskCount || 0,
      `${item.completedTaskCountPercent}%`,
      item.notCompletedTaskCount || 0,
      `${item.notCompletedTaskCountPercent}%`,
      item.outOfDateTaskCount || 0,
      `${item.outOfDateTaskCountPercent}%`,
      item.completedTaskCount +
        item.notCompletedTaskCount +
        item.outOfDateTaskCount,
    ]);

    generateExcelTaskStatistic(
      "Thống kê công việc đã giao cho các đơn vị",
      header1,
      header2,
      excelData,
      "Thống kê công việc đã giao cho các ĐV"
    );
  };

  return (
    <div className="incoming-document-statistics-container">
      <div className="col-md-12 text-right mb-2">
        <Button
          onClick={exportExcel}
          className="mr-1 bg-blue-600 hover:bg-blue-600"
        >
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      <div className="incoming-document-statistics-container--table">
        <TableBase
          className="w-full border-collapse"
          style={{ borderSpacing: 0 }}
        >
          <TableHeader>
            <TableRow>
              <TableHead
                className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2"
                rowSpan={2}
              >
                Đơn vị
              </TableHead>
              <TableHead
                className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2"
                colSpan={2}
              >
                Hoàn thành
              </TableHead>
              <TableHead
                className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2"
                colSpan={2}
              >
                Đang thực hiện
              </TableHead>
              <TableHead
                className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2"
                colSpan={2}
              >
                Quá hạn
              </TableHead>
              <TableHead
                className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2"
                rowSpan={2}
              >
                Tổng số
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 [&:first-child]:!rounded-tl-none">
                Số lượng
              </TableHead>
              <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                Phần trăm (%)
              </TableHead>
              <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                Số lượng
              </TableHead>
              <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                Phần trăm (%)
              </TableHead>
              <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                Số lượng
              </TableHead>
              <TableHead className="text-center border  border-gray-300 bg-blue-500 text-white font-semibold p-2 [&:last-child]:!rounded-tr-none">
                Phần trăm (%)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-center border border-gray-300 p-2">
                  {item.orgName}
                </TableCell>
                <TableCell className="text-center border border-gray-300 p-2 text-[#22c55e]">
                  {item.completedTaskCount || 0}
                </TableCell>
                <TableCell className="text-center border border-gray-300 p-2 text-[#22c55e]">
                  {item.completedTaskCountPercent || 0}%
                </TableCell>
                <TableCell className="text-center border border-gray-300 p-2 text-[#f59e0b]">
                  {item.notCompletedTaskCount || 0}
                </TableCell>
                <TableCell className="text-center border border-gray-300 p-2 text-[#f59e0b]">
                  {item.notCompletedTaskCountPercent || 0}%
                </TableCell>
                <TableCell className="text-center border border-gray-300 p-2 text-[#ef4444]">
                  {item.outOfDateTaskCount || 0}
                </TableCell>
                <TableCell className="text-center border border-gray-300 p-2 text-[#ef4444]">
                  {item.outOfDateTaskCountPercent || 0}%
                </TableCell>
                <TableCell className="text-center border border-gray-300 p-2 font-bold">
                  {item.completedTaskCount +
                    item.notCompletedTaskCount +
                    item.outOfDateTaskCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableBase>
      </div>

      <div className="incoming-document-statistics-container--footer">
        <Button
          variant="link"
          onClick={() => setModalOpen(true)}
          className="text-black-600 hover:text-black-800 font-semibold underline italic"
        >
          Chi tiết
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[1400px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle>Bảng thống kê chi tiết</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 overflow-y-auto overflow-x-auto flex-1 min-h-0">
            <div className="inline-block" style={{ minWidth: "100%" }}>
              <TableBase
                className="border-collapse"
                style={{ borderSpacing: 0, width: "100%", minWidth: "800px" }}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 [&:first-child]:!rounded-tl-lg [&:first-child]:!border-l-0 [&:first-child]:!border-t-0"
                      rowSpan={2}
                    >
                      Đơn vị
                    </TableHead>
                    <TableHead
                      className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 !border-t-0"
                      colSpan={2}
                    >
                      Hoàn thành
                    </TableHead>
                    <TableHead
                      className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 !border-t-0"
                      colSpan={2}
                    >
                      Đang thực hiện
                    </TableHead>
                    <TableHead
                      className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 !border-t-0"
                      colSpan={2}
                    >
                      Quá hạn
                    </TableHead>
                    <TableHead
                      className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 [&:last-child]:!rounded-tr-lg [&:last-child]:!border-r-0 [&:last-child]:!border-t-0"
                      rowSpan={2}
                    >
                      Tổng số
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 [&:first-child]:!rounded-tl-none">
                      Số lượng
                    </TableHead>
                    <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                      Phần trăm (%)
                    </TableHead>
                    <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                      Số lượng
                    </TableHead>
                    <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                      Phần trăm (%)
                    </TableHead>
                    <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2">
                      Số lượng
                    </TableHead>
                    <TableHead className="text-center border border-gray-300 bg-blue-500 text-white font-semibold p-2 [&:last-child]:!rounded-tr-none">
                      Phần trăm (%)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center border border-gray-300 p-2">
                        {item.orgName}
                      </TableCell>
                      <TableCell className="text-center border border-gray-300 p-2 text-[#22c55e]">
                        {item.completedTaskCount || 0}
                      </TableCell>
                      <TableCell className="text-center border border-gray-300 p-2 text-[#22c55e]">
                        {item.completedTaskCountPercent || 0}%
                      </TableCell>
                      <TableCell className="text-center border border-gray-300 p-2 text-[#f59e0b]">
                        {item.notCompletedTaskCount || 0}
                      </TableCell>
                      <TableCell className="text-center border border-gray-300 p-2 text-[#f59e0b]">
                        {item.notCompletedTaskCountPercent || 0}%
                      </TableCell>
                      <TableCell className="text-center border border-gray-300 p-2 text-[#ef4444]">
                        {item.outOfDateTaskCount || 0}
                      </TableCell>
                      <TableCell className="text-center border border-gray-300 p-2 text-[#ef4444]">
                        {item.outOfDateTaskCountPercent || 0}%
                      </TableCell>
                      <TableCell className="text-center border border-gray-300 p-2 font-bold [&:last-child]:border-r-1">
                        {item.completedTaskCount +
                          item.notCompletedTaskCount +
                          item.outOfDateTaskCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableBase>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomingTaskFollowStatisticByUnit;
