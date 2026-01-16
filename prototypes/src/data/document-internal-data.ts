"use client";

import { DocumentItem } from "@/components/documents/document-table";

// Mock data for Văn bản nội bộ - Danh sách
export const documentInternalList: DocumentItem[] = [
    {
        id: "VNB001",
        number: "01/CV-NB",
        title: "Thông báo lịch trực Tết Nguyên đán 2026",
        to: "Toàn thể cán bộ",
        date: "15/01/2026",
        creator: "Phòng Tổng hợp",
        docType: "Thông báo",
        status: "pending",
        priority: "normal",
        hasAttachment: true,
    },
    {
        id: "VNB002",
        number: "02/QĐ-NB",
        title: "Quyết định phân công nhiệm vụ Q1/2026",
        to: "Các phòng ban",
        date: "14/01/2026",
        creator: "Ban lãnh đạo",
        docType: "Quyết định",
        status: "processing",
        priority: "high",
        hasAttachment: true,
    },
    {
        id: "VNB003",
        number: "03/TB-NB",
        title: "Thông báo họp giao ban tuần 3",
        to: "Trưởng các đơn vị",
        date: "13/01/2026",
        creator: "Văn phòng",
        docType: "Thông báo",
        status: "done",
        priority: "normal",
        hasAttachment: false,
    },
];

// Mock data for Đăng ký
export const documentInternalRegister: DocumentItem[] = [
    {
        id: "VNB004",
        number: "04/CV-NB",
        title: "Công văn về việc tổ chức đào tạo nội bộ",
        to: "Phòng Nhân sự",
        date: "15/01/2026",
        creator: "Nguyễn Văn A",
        docType: "Công văn",
        status: "pending",
        priority: "normal",
        hasAttachment: true,
    },
];

// Mock data for Chờ duyệt
export const documentInternalApprove: DocumentItem[] = [
    {
        id: "VNB005",
        number: "05/TTr-NB",
        title: "Tờ trình xin mua sắm thiết bị văn phòng",
        to: "Ban Giám đốc",
        date: "14/01/2026",
        creator: "Phòng Hành chính",
        docType: "Tờ trình",
        status: "pending",
        priority: "high",
        hasAttachment: true,
    },
];

// Mock data for Phát hành
export const documentInternalPublish: DocumentItem[] = [
    {
        id: "VNB006",
        number: "06/QĐ-NB",
        title: "Quyết định khen thưởng cá nhân xuất sắc năm 2025",
        to: "Toàn đơn vị",
        date: "10/01/2026",
        creator: "Ban lãnh đạo",
        docType: "Quyết định",
        status: "issued",
        priority: "normal",
        isImportant: true,
        hasAttachment: true,
    },
];

// Mock data for Tra cứu
export const documentInternalSearch: DocumentItem[] = [
    ...documentInternalList,
    ...documentInternalRegister,
    ...documentInternalApprove,
    ...documentInternalPublish,
];
