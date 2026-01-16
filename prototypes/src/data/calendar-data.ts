"use client";

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    organizer?: string;
    attendees?: string[];
    type: "meeting" | "event" | "reminder" | "deadline";
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    priority: "low" | "normal" | "high";
}

// Lịch Ban
export const calendarBoard: CalendarEvent[] = [
    {
        id: "LB001",
        title: "Họp giao ban đầu tuần",
        description: "Họp giao ban tuần 3 tháng 01/2026",
        date: "20/01/2026",
        startTime: "08:00",
        endTime: "09:30",
        location: "Phòng họp A1",
        organizer: "Ban lãnh đạo",
        attendees: ["Giám đốc", "Phó Giám đốc", "Trưởng các phòng ban"],
        type: "meeting",
        status: "upcoming",
        priority: "high",
    },
    {
        id: "LB002",
        title: "Họp tổng kết công tác tháng",
        description: "Tổng kết và đánh giá kết quả công việc tháng 01/2026",
        date: "31/01/2026",
        startTime: "14:00",
        endTime: "16:00",
        location: "Hội trường lớn",
        organizer: "Văn phòng",
        type: "meeting",
        status: "upcoming",
        priority: "high",
    },
    {
        id: "LB003",
        title: "Tiếp đoàn công tác Bộ Quốc phòng",
        description: "Đón tiếp và làm việc với đoàn công tác",
        date: "22/01/2026",
        startTime: "09:00",
        endTime: "11:30",
        location: "Phòng khách VIP",
        organizer: "Ban lãnh đạo",
        type: "event",
        status: "upcoming",
        priority: "high",
    },
];

// Lịch Đơn vị
export const calendarUnit: CalendarEvent[] = [
    {
        id: "LDV001",
        title: "Họp phòng Tổng hợp",
        description: "Họp triển khai công việc tuần",
        date: "17/01/2026",
        startTime: "08:30",
        endTime: "09:30",
        location: "Phòng họp B2",
        organizer: "Trưởng phòng Tổng hợp",
        type: "meeting",
        status: "upcoming",
        priority: "normal",
    },
    {
        id: "LDV002",
        title: "Đào tạo nội bộ - Sử dụng hệ thống",
        description: "Hướng dẫn sử dụng module văn bản",
        date: "18/01/2026",
        startTime: "14:00",
        endTime: "16:00",
        location: "Phòng đào tạo",
        organizer: "Phòng CNTT",
        type: "event",
        status: "upcoming",
        priority: "normal",
    },
];

// Đặt phòng họp
export interface MeetingRoom {
    id: string;
    name: string;
    capacity: number;
    equipment: string[];
    location: string;
    status: "available" | "booked" | "maintenance";
}

export const meetingRooms: MeetingRoom[] = [
    {
        id: "PH001",
        name: "Phòng họp A1",
        capacity: 30,
        equipment: ["Máy chiếu", "Loa", "Micro", "Video conference"],
        location: "Tầng 1",
        status: "available",
    },
    {
        id: "PH002",
        name: "Phòng họp B2",
        capacity: 15,
        equipment: ["Máy chiếu", "Loa", "Micro"],
        location: "Tầng 2",
        status: "booked",
    },
    {
        id: "PH003",
        name: "Hội trường lớn",
        capacity: 100,
        equipment: ["Máy chiếu", "Hệ thống âm thanh", "Video conference", "Phiên dịch"],
        location: "Tầng 1",
        status: "available",
    },
    {
        id: "PH004",
        name: "Phòng khách VIP",
        capacity: 20,
        equipment: ["Máy chiếu", "Loa", "Micro", "Video conference"],
        location: "Tầng 3",
        status: "available",
    },
];

export const roomBookings: CalendarEvent[] = [
    {
        id: "DP001",
        title: "Họp giao ban - Phòng A1",
        date: "20/01/2026",
        startTime: "08:00",
        endTime: "09:30",
        location: "Phòng họp A1",
        organizer: "Ban lãnh đạo",
        type: "meeting",
        status: "upcoming",
        priority: "high",
    },
];
