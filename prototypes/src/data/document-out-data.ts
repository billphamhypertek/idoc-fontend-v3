"use client";

import { DocumentItem } from "@/components/documents/document-table";

// Mock data for Văn bản đi - Danh sách
export const documentOutList: DocumentItem[] = [
    {
        id: "VBO001",
        number: "156/CV-BCY",
        title: "Công văn về việc triển khai kế hoạch công tác năm 2025",
        to: "Ban Cơ yếu Chính phủ",
        date: "15/01/2026",
        creator: "Nguyễn Văn A",
        docType: "Công văn",
        status: "pending",
        priority: "normal",
        hasAttachment: true,
    },
    {
        id: "VBO002",
        number: "157/TTr-BCY",
        title: "Tờ trình về việc phê duyệt dự án nâng cấp hệ thống CNTT",
        to: "Văn phòng Chính phủ",
        date: "14/01/2026",
        creator: "Trần Thị B",
        docType: "Tờ trình",
        status: "processing",
        priority: "high",
        hasAttachment: true,
    },
    {
        id: "VBO003",
        number: "158/BC-BCY",
        title: "Báo cáo tổng kết công tác cơ yếu năm 2025",
        to: "Bộ Quốc phòng",
        date: "13/01/2026",
        creator: "Lê Văn C",
        docType: "Báo cáo",
        status: "done",
        priority: "normal",
        hasAttachment: false,
    },
    {
        id: "VBO004",
        number: "159/QĐ-BCY",
        title: "Quyết định về việc ban hành quy chế làm việc nội bộ",
        to: "Các đơn vị trực thuộc",
        date: "12/01/2026",
        creator: "Hoàng Minh E",
        docType: "Quyết định",
        status: "issued",
        priority: "urgent",
        isImportant: true,
        hasAttachment: true,
    },
];

// Mock data for Xử lý chính
export const documentOutMain: DocumentItem[] = [
    {
        id: "VBO005",
        number: "160/CV-BCY",
        title: "Công văn hướng dẫn thực hiện quy trình mã hóa văn bản",
        to: "Cục An ninh mạng",
        date: "15/01/2026",
        creator: "Nguyễn Văn A",
        docType: "Công văn",
        status: "pending",
        priority: "high",
        hasAttachment: true,
    },
    {
        id: "VBO006",
        number: "161/TTr-BCY",
        title: "Tờ trình xin phê duyệt kinh phí đào tạo cán bộ",
        to: "Bộ Tài chính",
        date: "14/01/2026",
        creator: "Phạm Thị D",
        docType: "Tờ trình",
        status: "processing",
        priority: "normal",
        hasAttachment: false,
    },
];

// Mock data for Phối hợp
export const documentOutCombine: DocumentItem[] = [
    {
        id: "VBO007",
        number: "162/CV-BCY",
        title: "Công văn phối hợp xây dựng hệ thống bảo mật liên ngành",
        to: "Bộ Công an",
        date: "15/01/2026",
        creator: "Lê Văn C",
        docType: "Công văn",
        status: "pending",
        priority: "high",
        hasAttachment: true,
    },
];

// Mock data for Nhận để biết
export const documentOutKnow: DocumentItem[] = [
    {
        id: "VBO008",
        number: "163/TB-BCY",
        title: "Thông báo lịch họp giao ban tháng 01/2026",
        to: "Các đơn vị",
        date: "15/01/2026",
        creator: "Văn phòng",
        docType: "Thông báo",
        status: "done",
        priority: "normal",
        hasAttachment: false,
    },
];

// Mock data for Văn bản quan trọng
export const documentOutImportant: DocumentItem[] = [
    {
        id: "VBO009",
        number: "164/QĐ-BCY",
        title: "Quyết định về chiến lược phát triển cơ yếu giai đoạn 2025-2030",
        to: "Thủ tướng Chính phủ",
        date: "10/01/2026",
        creator: "Ban lãnh đạo",
        docType: "Quyết định",
        status: "processing",
        priority: "urgent",
        isImportant: true,
        hasAttachment: true,
    },
];

// Mock data for Cho ý kiến
export const documentOutOpinion: DocumentItem[] = [
    {
        id: "VBO010",
        number: "165/CV-BCY",
        title: "Dự thảo công văn về việc tổ chức hội nghị toàn quốc",
        to: "Các cơ quan liên quan",
        date: "14/01/2026",
        creator: "Nguyễn Văn A",
        docType: "Công văn",
        status: "pending",
        priority: "normal",
        hasAttachment: true,
    },
];

// Mock data for Tra cứu
export const documentOutSearch: DocumentItem[] = [
    ...documentOutList,
    ...documentOutMain,
    ...documentOutCombine,
];
