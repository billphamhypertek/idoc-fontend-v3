// Mock data for ĐHTN v3 Dashboard Prototype

export const currentUser = {
    id: "1",
    name: "Nguyễn Văn An",
    role: "Lãnh đạo Ban",
    avatar: "",
    department: "Ban Cơ yếu Chính phủ",
};

// Menu items with groups
export const menuGroups = [
    {
        id: "main",
        items: [
            {
                id: "dashboard",
                label: "Bảng điều khiển",
                icon: "Dashboard",
                href: "/",
                active: true,
            },
        ],
    },
    {
        id: "documents",
        items: [
            {
                id: "doc-in",
                label: "Văn bản đến",
                icon: "Download",
                href: "/document-in",
                badge: 12,
            },
            {
                id: "doc-out",
                label: "Văn bản đi",
                icon: "Upload",
                href: "/document-out",
                badge: 5,
            },
            {
                id: "doc-internal",
                label: "Văn bản nội bộ",
                icon: "File",
                href: "/document-internal",
                badge: 3,
            },
        ],
    },
    {
        id: "work",
        items: [
            {
                id: "tasks",
                label: "Quản lý công việc",
                icon: "CheckCircled",
                href: "/tasks",
                badge: 23,
            },
            {
                id: "kpi",
                label: "KPI",
                icon: "Target",
                href: "/kpi",
            },
            {
                id: "calendar",
                label: "Lịch",
                icon: "Calendar",
                href: "/calendar",
            },
            {
                id: "duty",
                label: "Lịch trực nghiệp vụ",
                icon: "Clock",
                href: "/duty",
            },
        ],
    },
    {
        id: "other",
        items: [
            {
                id: "reports",
                label: "Báo cáo",
                icon: "BarChart",
                href: "/reports",
                badge: 2,
            },
            {
                id: "delegate",
                label: "Ủy quyền xử lý",
                icon: "Share2",
                href: "/delegate",
            },
        ],
    },
    {
        id: "admin",
        items: [
            {
                id: "vehicles",
                label: "Quản lý xe",
                icon: "Car",
                href: "/vehicles",
            },
            {
                id: "labels",
                label: "Quản lý nhãn",
                icon: "BookmarkFilled",
                href: "/labels",
            },
        ],
    },
];

// Flatten menu items for backward compatibility
export const menuItems = menuGroups.flatMap(group => group.items);

// Sub-menu items for each module
export const subMenuItems: Record<string, { id: string; label: string; href: string }[]> = {
    dashboard: [
        { id: "personal", label: "Thống kê cá nhân", href: "/?tab=personal" },
        { id: "unit", label: "Thống kê phòng ban", href: "/?tab=unit" },
    ],
    "doc-in": [
        { id: "receive", label: "Tiếp nhận văn bản", href: "/document-in/receive" },
        { id: "main", label: "Xử lý chính", href: "/document-in/main" },
        { id: "coordinate", label: "Phối hợp", href: "/document-in/coordinate" },
        { id: "info", label: "Nhận để biết", href: "/document-in/info" },
        { id: "important", label: "Văn bản quan trọng", href: "/document-in/important" },
        { id: "opinion", label: "Cho ý kiến văn bản", href: "/document-in/opinion" },
        { id: "search", label: "Tra cứu văn bản", href: "/document-in/search" },
    ],
    "doc-out": [
        { id: "draft", label: "Soạn văn bản", href: "/document-out/draft" },
        { id: "pending", label: "Chờ duyệt", href: "/document-out/pending" },
        { id: "approved", label: "Đã duyệt", href: "/document-out/approved" },
        { id: "issued", label: "Đã phát hành", href: "/document-out/issued" },
        { id: "search", label: "Tra cứu", href: "/document-out/search" },
    ],
    tasks: [
        { id: "assigned", label: "Nhiệm vụ được giao", href: "/tasks/assigned" },
        { id: "created", label: "Nhiệm vụ đã giao", href: "/tasks/created" },
        { id: "following", label: "Đang theo dõi", href: "/tasks/following" },
        { id: "completed", label: "Đã hoàn thành", href: "/tasks/completed" },
    ],
    calendar: [
        { id: "board", label: "Lịch Ban", href: "/calendar/board" },
        { id: "unit", label: "Lịch Đơn vị", href: "/calendar/unit" },
        { id: "room", label: "Đặt phòng họp", href: "/calendar/room" },
    ],
    reports: [
        { id: "weekly", label: "Báo cáo tuần", href: "/reports/weekly" },
        { id: "monthly", label: "Báo cáo tháng", href: "/reports/monthly" },
        { id: "quarterly", label: "Báo cáo quý", href: "/reports/quarterly" },
    ],
};

// Theme color palettes
export const themePalettes = [
    {
        id: "blue",
        name: "Xanh dương",
        primary: "220 95% 45%",
        primaryHover: "220 95% 40%",
        sidebar: "215 25% 18%",
        accent: "45 100% 51%",
    },
    {
        id: "teal",
        name: "Xanh ngọc",
        primary: "173 80% 40%",
        primaryHover: "173 80% 35%",
        sidebar: "173 40% 18%",
        accent: "38 92% 50%",
    },
    {
        id: "purple",
        name: "Tím",
        primary: "262 83% 58%",
        primaryHover: "262 83% 50%",
        sidebar: "262 40% 20%",
        accent: "45 100% 51%",
    },
    {
        id: "green",
        name: "Xanh lá",
        primary: "142 72% 35%",
        primaryHover: "142 72% 30%",
        sidebar: "142 30% 18%",
        accent: "38 92% 50%",
    },
    {
        id: "orange",
        name: "Cam",
        primary: "25 95% 53%",
        primaryHover: "25 95% 48%",
        sidebar: "25 30% 20%",
        accent: "199 89% 48%",
    },
    {
        id: "red",
        name: "Đỏ",
        primary: "0 72% 51%",
        primaryHover: "0 72% 45%",
        sidebar: "0 30% 18%",
        accent: "45 100% 51%",
    },
];

export const scheduleItems = [
    {
        id: "1",
        time: "08:00 - 09:30",
        period: "morning" as const,
        title: "Họp giao ban Ban lãnh đạo",
        location: "Phòng họp A1",
        participants: "Ban lãnh đạo",
        type: "board" as const,
    },
    {
        id: "2",
        time: "09:45 - 11:00",
        period: "morning" as const,
        title: "Làm việc với Đoàn kiểm tra Bộ Nội vụ",
        location: "Phòng họp B2",
        participants: "Lãnh đạo Ban, Cục QLNS",
        type: "board" as const,
    },
    {
        id: "3",
        time: "14:00 - 15:30",
        period: "afternoon" as const,
        title: "Báo cáo tiến độ dự án CNTT",
        location: "Phòng họp C1",
        participants: "TT CNTT, Văn phòng",
        type: "unit" as const,
    },
    {
        id: "4",
        time: "16:00 - 17:00",
        period: "afternoon" as const,
        title: "Ký duyệt văn bản",
        location: "Phòng làm việc",
        participants: "",
        type: "board" as const,
    },
];

export const incomingDocuments = [
    {
        id: "VB001",
        number: "123/BNV-TCBC",
        title: "V/v xin ý kiến về Đề án tổ chức bộ máy cơ yếu",
        from: "Bộ Nội vụ",
        date: "15/01/2026",
        priority: "urgent" as const,
        status: "pending" as const,
        deadline: "18/01/2026",
    },
    {
        id: "VB002",
        number: "456/VPCP-NC",
        title: "V/v triển khai Chỉ thị số 21/CT-TTg",
        from: "Văn phòng Chính phủ",
        date: "14/01/2026",
        priority: "normal" as const,
        status: "processing" as const,
        deadline: "20/01/2026",
    },
    {
        id: "VB003",
        number: "789/BCA-A05",
        title: "V/v phối hợp bảo mật thông tin",
        from: "Bộ Công an",
        date: "14/01/2026",
        priority: "high" as const,
        status: "pending" as const,
        deadline: "17/01/2026",
    },
    {
        id: "VB004",
        number: "012/BNG-VH",
        title: "V/v cử cán bộ tham gia đoàn công tác",
        from: "Bộ Ngoại giao",
        date: "13/01/2026",
        priority: "normal" as const,
        status: "done" as const,
        deadline: "16/01/2026",
    },
];

export const outgoingDocuments = [
    {
        id: "VBD001",
        number: "",
        title: "Báo cáo công tác Quý I/2026",
        to: "Thủ tướng Chính phủ",
        date: "15/01/2026",
        status: "draft" as const,
        step: "Chờ Trưởng ban duyệt",
    },
    {
        id: "VBD002",
        number: "",
        title: "Đề xuất kế hoạch triển khai CKS tập trung",
        to: "Văn phòng Chính phủ",
        date: "14/01/2026",
        status: "reviewing" as const,
        step: "Phó Trưởng ban đã ký nháy",
    },
    {
        id: "VBD003",
        number: "",
        title: "V/v xin phê duyệt dự toán năm 2026",
        to: "Bộ Tài chính",
        date: "12/01/2026",
        status: "approved" as const,
        step: "Chờ phát hành",
    },
];

export const assignedTasks = [
    {
        id: "NV001",
        title: "Rà soát báo cáo tổng kết công tác năm 2025",
        assignedBy: "Trưởng ban",
        assignees: ["Văn phòng", "Cục QLNS"],
        deadline: "18/01/2026",
        status: "processing" as const,
        progress: 65,
    },
    {
        id: "NV002",
        title: "Triển khai phần mềm quản lý văn bản mới",
        assignedBy: "Phó Trưởng ban",
        assignees: ["TT CNTT"],
        deadline: "30/01/2026",
        status: "ontrack" as const,
        progress: 40,
    },
    {
        id: "NV003",
        title: "Tổng hợp ý kiến góp ý Luật sửa đổi",
        assignedBy: "Trưởng ban",
        assignees: ["Vụ Pháp chế"],
        deadline: "20/01/2026",
        status: "delayed" as const,
        progress: 25,
    },
];

export const pendingTasks = [
    {
        id: "CXL001",
        title: "Duyệt kế hoạch đào tạo năm 2026",
        from: "Vụ TCCB",
        type: "approve" as const,
        deadline: "16/01/2026",
        priority: "high" as const,
    },
    {
        id: "CXL002",
        title: "Phê duyệt dự thảo văn bản",
        from: "Văn phòng",
        type: "sign" as const,
        deadline: "16/01/2026",
        priority: "urgent" as const,
    },
    {
        id: "CXL003",
        title: "Duyệt công văn gửi Bộ Nội vụ",
        from: "Cục QLNS",
        type: "sign" as const,
        deadline: "17/01/2026",
        priority: "normal" as const,
    },
];

export const stats = {
    documents: {
        incoming: { pending: 12, processing: 8, done: 156 },
        outgoing: { draft: 5, reviewing: 3, issued: 89 },
    },
    tasks: {
        assigned: 15,
        pending: 23,
        completed: 127,
        delayed: 3,
    },
    reports: {
        submitted: 8,
        pending: 2,
        total: 10,
    },
};
