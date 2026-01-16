"use client";

export interface ReportItem {
    id: string;
    title: string;
    period: string;
    department: string;
    submittedBy: string;
    submittedDate: string;
    status: "draft" | "submitted" | "approved" | "rejected";
    type: "weekly" | "monthly" | "quarterly" | "yearly";
}

// Báo cáo tuần
export const reportsWeekly: ReportItem[] = [
    {
        id: "BC001",
        title: "Báo cáo công tác tuần 2 tháng 01/2026",
        period: "06/01 - 12/01/2026",
        department: "Phòng Tổng hợp",
        submittedBy: "Nguyễn Văn A",
        submittedDate: "12/01/2026",
        status: "submitted",
        type: "weekly",
    },
    {
        id: "BC002",
        title: "Báo cáo công tác tuần 3 tháng 01/2026",
        period: "13/01 - 19/01/2026",
        department: "Phòng CNTT",
        submittedBy: "Trần Thị B",
        submittedDate: "-",
        status: "draft",
        type: "weekly",
    },
];

// Báo cáo tháng
export const reportsMonthly: ReportItem[] = [
    {
        id: "BC003",
        title: "Báo cáo công tác tháng 12/2025",
        period: "Tháng 12/2025",
        department: "Phòng Tổng hợp",
        submittedBy: "Nguyễn Văn A",
        submittedDate: "05/01/2026",
        status: "approved",
        type: "monthly",
    },
    {
        id: "BC004",
        title: "Báo cáo công tác tháng 01/2026",
        period: "Tháng 01/2026",
        department: "Phòng Tổng hợp",
        submittedBy: "-",
        submittedDate: "-",
        status: "draft",
        type: "monthly",
    },
];

// Báo cáo quý
export const reportsQuarterly: ReportItem[] = [
    {
        id: "BC005",
        title: "Báo cáo công tác quý IV/2025",
        period: "Quý 4/2025",
        department: "Ban lãnh đạo",
        submittedBy: "Phó Giám đốc",
        submittedDate: "10/01/2026",
        status: "approved",
        type: "quarterly",
    },
];

// Báo cáo chính phủ
export const reportsGov: ReportItem[] = [
    {
        id: "BC-GOV-001",
        title: "Báo cáo chỉ đạo Chính phủ tháng 01/2026",
        period: "Tháng 01/2026",
        department: "Văn phòng Bộ",
        submittedBy: "Nguyễn Văn C",
        submittedDate: "15/01/2026",
        status: "submitted",
        type: "monthly",
    },
    {
        id: "BC-GOV-002",
        title: "Báo cáo công tác phòng chống tham nhũng quý IV/2025",
        period: "Quý 4/2025",
        department: "Thanh tra Bộ",
        submittedBy: "Trần Thị D",
        submittedDate: "10/01/2026",
        status: "approved",
        type: "quarterly",
    },
];

// Báo cáo đảng
export const reportsPar: ReportItem[] = [
    {
        id: "BC-PAR-001",
        title: "Báo cáo công tác Đảng bộ tháng 12/2025",
        period: "Tháng 12/2025",
        department: "Đảng ủy Bộ",
        submittedBy: "Lê Văn E",
        submittedDate: "05/01/2026",
        status: "approved",
        type: "monthly",
    },
    {
        id: "BC-PAR-002",
        title: "Báo cáo phát triển Đảng viên năm 2025",
        period: "Năm 2025",
        department: "Ban Tổ chức",
        submittedBy: "Phạm Thị F",
        submittedDate: "-",
        status: "draft",
        type: "yearly",
    },
];
