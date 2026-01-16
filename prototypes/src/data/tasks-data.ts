"use client";

// Task item interface
export interface TaskItem {
    id: string;
    title: string;
    description?: string;
    assignee?: string;
    assigner?: string;
    department?: string;
    dueDate: string;
    startDate?: string;
    status: "pending" | "in-progress" | "completed" | "overdue" | "cancelled";
    priority: "low" | "normal" | "high" | "urgent";
    progress?: number;
    category?: string;
    relatedDoc?: string;
}

// Mock data for Nhiệm vụ được giao
export const tasksAssigned: TaskItem[] = [
    {
        id: "NV001",
        title: "Hoàn thành báo cáo công tác tháng 01/2026",
        description: "Tổng hợp kết quả công việc và lập báo cáo theo mẫu",
        assigner: "Nguyễn Văn B",
        department: "Ban lãnh đạo",
        dueDate: "20/01/2026",
        startDate: "10/01/2026",
        status: "in-progress",
        priority: "high",
        progress: 60,
        category: "Báo cáo",
    },
    {
        id: "NV002",
        title: "Chuẩn bị tài liệu họp giao ban tuần 3",
        description: "Thu thập và tổng hợp các báo cáo từ các phòng ban",
        assigner: "Trần Thị C",
        department: "Phòng Tổng hợp",
        dueDate: "17/01/2026",
        startDate: "15/01/2026",
        status: "pending",
        priority: "urgent",
        progress: 20,
        category: "Hành chính",
    },
    {
        id: "NV003",
        title: "Rà soát quy trình xử lý văn bản đến",
        description: "Đánh giá và đề xuất cải tiến quy trình hiện tại",
        assigner: "Lê Văn D",
        department: "Phòng CNTT",
        dueDate: "25/01/2026",
        startDate: "12/01/2026",
        status: "in-progress",
        priority: "normal",
        progress: 40,
        category: "Quy trình",
    },
    {
        id: "NV004",
        title: "Hoàn thiện tài liệu đào tạo sử dụng hệ thống",
        description: "Biên soạn hướng dẫn sử dụng cho người dùng mới",
        assigner: "Phạm Thị E",
        department: "Phòng Đào tạo",
        dueDate: "15/01/2026",
        startDate: "05/01/2026",
        status: "overdue",
        priority: "high",
        progress: 80,
        category: "Đào tạo",
    },
];

// Mock data for Nhiệm vụ đã giao
export const tasksCreated: TaskItem[] = [
    {
        id: "NV005",
        title: "Kiểm tra hệ thống backup",
        description: "Thực hiện kiểm tra định kỳ hệ thống sao lưu",
        assignee: "Nguyễn Văn F",
        department: "Phòng CNTT",
        dueDate: "18/01/2026",
        startDate: "15/01/2026",
        status: "in-progress",
        priority: "high",
        progress: 30,
        category: "CNTT",
    },
    {
        id: "NV006",
        title: "Cập nhật danh bạ liên hệ",
        description: "Cập nhật thông tin liên lạc của CBCC",
        assignee: "Trần Thị G",
        department: "Phòng Hành chính",
        dueDate: "20/01/2026",
        startDate: "16/01/2026",
        status: "pending",
        priority: "normal",
        progress: 0,
        category: "Hành chính",
    },
];

// Mock data for Đang theo dõi
export const tasksFollowing: TaskItem[] = [
    {
        id: "NV007",
        title: "Dự án nâng cấp hệ thống CNTT",
        description: "Theo dõi tiến độ triển khai dự án",
        assignee: "Phòng CNTT",
        department: "Ban Dự án",
        dueDate: "30/03/2026",
        startDate: "01/01/2026",
        status: "in-progress",
        priority: "urgent",
        progress: 25,
        category: "Dự án",
    },
];

// Mock data for Đã hoàn thành
export const tasksCompleted: TaskItem[] = [
    {
        id: "NV008",
        title: "Báo cáo tổng kết năm 2025",
        description: "Hoàn thành và nộp báo cáo tổng kết",
        assigner: "Ban lãnh đạo",
        department: "Phòng Tổng hợp",
        dueDate: "31/12/2025",
        startDate: "15/12/2025",
        status: "completed",
        priority: "high",
        progress: 100,
        category: "Báo cáo",
    },
    {
        id: "NV009",
        title: "Hoàn thành kiểm kê tài sản cuối năm",
        description: "Kiểm kê và lập biên bản tài sản cố định",
        assigner: "Phòng Kế toán",
        department: "Các phòng ban",
        dueDate: "28/12/2025",
        startDate: "20/12/2025",
        status: "completed",
        priority: "normal",
        progress: 100,
        category: "Hành chính",
    },
];

// All tasks for search
export const tasksAll: TaskItem[] = [
    ...tasksAssigned,
    ...tasksCreated,
    ...tasksFollowing,
    ...tasksCompleted,
];
