import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

export const generateExcelDocumentOut = async (
  title: string,
  header: string[],
  data: any[],
  filename: string,
  totalDocument?: number,
  startDate?: string | null,
  endDate?: string | null
) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Thống kê");
  const now = new Date();

  // Add Row and formatting
  const currentDateText = `Thứ ${now.getDay() < 7 ? now.getDay() + 1 : "Chủ nhật"}, Ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  const currentDateRow = worksheet.addRow([currentDateText]);
  currentDateRow.font = { name: "Times New Roman", size: 14 };
  currentDateRow.alignment = {
    vertical: "bottom",
    horizontal: "right",
    wrapText: true,
  };

  const totalText = `Tổng số văn bản: ${totalDocument || 0}`;
  const totalRow = worksheet.addRow([totalText]);
  totalRow.font = { name: "Times New Roman", size: 14 };
  totalRow.alignment = {
    vertical: "bottom",
    horizontal: "right",
    wrapText: true,
  };

  const titleRow = worksheet.addRow([title]);
  titleRow.font = { name: "Times New Roman", size: 18, bold: true };
  titleRow.alignment = { vertical: "middle" };

  const dateSearch =
    startDate || endDate
      ? (startDate ? `Từ ngày ${startDate}` : "") +
        (endDate ? ` đến ngày ${endDate}` : " đến nay")
      : "";
  const dateSearchRow = worksheet.addRow([dateSearch]);
  dateSearchRow.font = { name: "Times New Roman", size: 14 };
  dateSearchRow.alignment = { vertical: "middle" };

  const startColumn = "A";
  const endColumn = String.fromCharCode(
    startColumn.charCodeAt(0) + header.length - 1
  );
  for (let i = 1; i <= 4; i++) {
    const v = `${startColumn}${i}:${endColumn}${i}`;
    worksheet.mergeCells(v);
  }

  // Blank Row
  worksheet.addRow([]);

  // Add Header Row
  const headerRow = worksheet.addRow(header);

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

  worksheet.getColumn(2).width = 15; // Số đi
  worksheet.getColumn(2).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(3).width = 20; // Số/Ký hiệu
  worksheet.getColumn(3).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(4).width = 20; // Ngày văn bản
  worksheet.getColumn(4).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(5).width = 50; // Trích yếu
  worksheet.getColumn(5).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(6).width = 30; // Đơn vị ban hành
  worksheet.getColumn(6).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(7).width = 25; // Người ký
  worksheet.getColumn(7).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(8).width = 40; // Nơi nhận
  worksheet.getColumn(8).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.addRow([]);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  saveAs(blob, `${filename}_${dd}_${mm}_${yyyy}.xlsx`);
};

export const generateExcelDocumentIn = async (
  title: string,
  header: string[],
  data: any[],
  filename: string,
  totalDocument?: number,
  startDate?: string | null,
  endDate?: string | null
) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Thống kê");
  const now = new Date();

  // Add Row and formatting
  const currentDateText = `${now.getDay() < 7 ? "Thứ " + (now.getDay() + 1) : "Chủ nhật"}, Ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  const currentDateRow = worksheet.addRow([currentDateText]);
  currentDateRow.font = { name: "Times New Roman", size: 14 };
  currentDateRow.alignment = {
    vertical: "bottom",
    horizontal: "right",
    wrapText: true,
  };

  const totalText = `Tổng số văn bản: ${totalDocument || 0}`;
  const totalRow = worksheet.addRow([totalText]);
  totalRow.font = { name: "Times New Roman", size: 14 };
  totalRow.alignment = {
    vertical: "bottom",
    horizontal: "right",
    wrapText: true,
  };

  const titleRow = worksheet.addRow([title]);
  titleRow.font = { name: "Times New Roman", size: 18, bold: true };
  titleRow.alignment = { vertical: "middle" };

  const dateSearch =
    startDate || endDate
      ? (startDate ? `Từ ngày ${startDate}` : "") +
        (endDate ? ` đến ngày ${endDate}` : " đến nay")
      : "";
  const dateSearchRow = worksheet.addRow([dateSearch]);
  dateSearchRow.font = { name: "Times New Roman", size: 14 };
  dateSearchRow.alignment = {
    vertical: "bottom",
    horizontal: "right",
    wrapText: true,
  };

  worksheet.addRow([]);

  const startColumn = "A";
  const endColumn = String.fromCharCode(
    startColumn.charCodeAt(0) + header.length - 1
  );
  for (let i = 1; i <= 4; i++) {
    const v = `${startColumn}${i}:${endColumn}${i}`;
    worksheet.mergeCells(v);
  }

  // Add Header Row
  const headerRow = worksheet.addRow(header);

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

  worksheet.getColumn(2).width = 20; // Ngày đến
  worksheet.getColumn(2).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(3).width = 20; // Số đến
  worksheet.getColumn(3).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(4).width = 30; // Nơi gửi
  worksheet.getColumn(4).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(5).width = 20; // Số ký hiệu
  worksheet.getColumn(5).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(6).width = 20; // Ngày văn bản
  worksheet.getColumn(6).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(7).width = 40; // Trích yếu
  worksheet.getColumn(7).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(8).width = 30; // Xử lý chính
  worksheet.getColumn(8).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(9).width = 30; // Phối hợp
  worksheet.getColumn(9).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(10).width = 30; // Đơn vị nhận bản lưu
  worksheet.getColumn(10).alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.getColumn(11).width = 20; // Hạn xử lý
  worksheet.getColumn(11).alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  worksheet.addRow([]);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  saveAs(blob, `${filename}_${dd}_${mm}_${yyyy}.xlsx`);
};
