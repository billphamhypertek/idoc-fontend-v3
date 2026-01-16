"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    CheckCircledIcon,
    ClockIcon,
    PersonIcon,
    ChatBubbleIcon,
    CalendarIcon,
} from "@radix-ui/react-icons";
import { Send, FileText, History, Target, Clock, CheckCircle2, AlertCircle, Paperclip, Users } from "lucide-react";

// Mock task data
const mockTask = {
    id: "NV001",
    title: "Hoàn thành báo cáo công tác tháng 01/2026",
    description: "Tổng hợp kết quả công việc và lập báo cáo theo mẫu quy định. Báo cáo cần bao gồm: tiến độ các nhiệm vụ được giao, kết quả đạt được, khó khăn vướng mắc và đề xuất giải pháp.",
    assigner: "Nguyễn Văn B",
    assignerDept: "Ban lãnh đạo",
    dueDate: "20/01/2026",
    startDate: "10/01/2026",
    status: "in-progress",
    priority: "high",
    progress: 60,
    category: "Báo cáo",
    relatedDoc: "CV-2026-001",
};

const subtasks = [
    { id: 1, title: "Thu thập dữ liệu từ các phòng ban", completed: true },
    { id: 2, title: "Tổng hợp số liệu thống kê", completed: true },
    { id: 3, title: "Lập báo cáo theo mẫu", completed: false },
    { id: 4, title: "Trình lãnh đạo phê duyệt", completed: false },
];

const comments = [
    {
        id: 1,
        user: "Nguyễn Văn B",
        avatar: "NB",
        role: "Người giao việc",
        content: "Lưu ý bổ sung thêm phần đánh giá hiệu quả công việc.",
        time: "14:30 15/01/2026",
    },
    {
        id: 2,
        user: "Trần Thị C",
        avatar: "TC",
        role: "Phối hợp",
        content: "Đã gửi số liệu phòng Hành chính.",
        time: "10:00 14/01/2026",
    },
];

const history = [
    { action: "Cập nhật tiến độ 60%", user: "Nguyễn Văn A", time: "15/01/2026 10:30" },
    { action: "Hoàn thành: Tổng hợp số liệu", user: "Nguyễn Văn A", time: "14/01/2026 16:00" },
    { action: "Hoàn thành: Thu thập dữ liệu", user: "Nguyễn Văn A", time: "12/01/2026 14:00" },
    { action: "Nhận nhiệm vụ", user: "Nguyễn Văn A", time: "10/01/2026 08:00" },
];

function CollapsibleCard({ title, icon: Icon, children, defaultOpen = true }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="v3-card overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[hsl(var(--v3-muted))]/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[hsl(var(--v3-primary))]" />
                    </div>
                    <span className="font-semibold text-[hsl(var(--v3-card-foreground))]">{title}</span>
                </div>
                <ChevronDownIcon className={cn("w-4 h-4 text-[hsl(var(--v3-muted-foreground))] transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="px-5 pb-5">{children}</div>}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; class: string; icon: React.ElementType }> = {
        pending: { label: "Chờ xử lý", class: "bg-gray-100 text-gray-700", icon: Clock },
        "in-progress": { label: "Đang thực hiện", class: "bg-blue-100 text-blue-700", icon: Clock },
        completed: { label: "Hoàn thành", class: "bg-green-100 text-green-700", icon: CheckCircle2 },
        overdue: { label: "Quá hạn", class: "bg-red-100 text-red-700", icon: AlertCircle },
    };
    const { label, class: className, icon: Icon } = config[status] || config.pending;
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium", className)}>
            <Icon className="w-4 h-4" />
            {label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const config: Record<string, { label: string; class: string }> = {
        low: { label: "Thấp", class: "bg-gray-100 text-gray-600" },
        normal: { label: "Bình thường", class: "bg-blue-100 text-blue-600" },
        high: { label: "Cao", class: "bg-orange-100 text-orange-600" },
        urgent: { label: "Khẩn cấp", class: "bg-red-100 text-red-600" },
    };
    const { label, class: className } = config[priority] || config.normal;
    return (
        <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", className)}>
            {label}
        </span>
    );
}

export default function TaskDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [newComment, setNewComment] = useState("");

    return (
        <PageLayout activeModule="tasks" activeSubMenu="assigned">
            <div className="space-y-4">
                {/* Header & Back */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg border border-[hsl(var(--v3-border))] bg-white hover:bg-[hsl(var(--v3-muted))] transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Chi tiết nhiệm vụ</h1>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-sm font-medium text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))] transition-all">
                        <ChatBubbleIcon className="w-4 h-4" />
                        Báo cáo tiến độ
                    </button>
                    <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-sm font-medium text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))] transition-all">
                        <Users className="w-4 h-4" />
                        Chuyển giao
                    </button>
                    <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-green-500 border-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all shadow-sm">
                        <CheckCircledIcon className="w-4 h-4" />
                        Hoàn thành
                    </button>
                    <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-sm font-medium text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))] transition-all">
                        <History className="w-4 h-4" />
                        Nhật ký
                    </button>
                </div>

                {/* Main Content - 2 columns */}
                <div className="flex gap-6">
                    {/* Left Column */}
                    <div className="flex-1 space-y-4 min-w-0">
                        {/* Task Info Card */}
                        <CollapsibleCard title="Thông tin nhiệm vụ" icon={Target}>
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <h2 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))]">
                                        {mockTask.title}
                                    </h2>
                                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mt-1">
                                        {mockTask.description}
                                    </p>
                                </div>

                                {/* Meta info */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[hsl(var(--v3-border))]">
                                    <div>
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Người giao</span>
                                        <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{mockTask.assigner}</p>
                                        <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{mockTask.assignerDept}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Phân loại</span>
                                        <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{mockTask.category}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Ngày bắt đầu</span>
                                        <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{mockTask.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">Hạn hoàn thành</span>
                                        <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{mockTask.dueDate}</p>
                                    </div>
                                </div>

                                {/* Status & Priority */}
                                <div className="flex items-center gap-3 pt-4 border-t border-[hsl(var(--v3-border))]">
                                    <StatusBadge status={mockTask.status} />
                                    <PriorityBadge priority={mockTask.priority} />
                                </div>

                                {/* Progress */}
                                <div className="pt-4 border-t border-[hsl(var(--v3-border))]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">Tiến độ</span>
                                        <span className="text-sm font-semibold text-[hsl(var(--v3-primary))]">{mockTask.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[hsl(var(--v3-primary))] rounded-full transition-all"
                                            style={{ width: `${mockTask.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CollapsibleCard>

                        {/* Subtasks */}
                        <CollapsibleCard title="Danh sách công việc con" icon={CheckCircledIcon}>
                            <div className="space-y-2">
                                {subtasks.map((task) => (
                                    <label key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--v3-muted))]/50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            readOnly
                                            className="w-4 h-4 rounded border-gray-300 text-[hsl(var(--v3-primary))]"
                                        />
                                        <span className={cn(
                                            "text-sm",
                                            task.completed
                                                ? "text-[hsl(var(--v3-muted-foreground))] line-through"
                                                : "text-[hsl(var(--v3-card-foreground))]"
                                        )}>
                                            {task.title}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </CollapsibleCard>

                        {/* History */}
                        <CollapsibleCard title="Lịch sử thao tác" icon={History} defaultOpen={false}>
                            <div className="space-y-3">
                                {history.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--v3-primary))] mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-[hsl(var(--v3-card-foreground))]">{item.action}</p>
                                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{item.user} • {item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleCard>
                    </div>

                    {/* Right Column - Comments Sidebar */}
                    <div className="w-[360px] shrink-0">
                        <div className="v3-card overflow-hidden sticky top-4">
                            {/* Header */}
                            <div className="bg-[hsl(var(--v3-primary))] px-4 py-3">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <ChatBubbleIcon className="w-4 h-4" />
                                    Trao đổi
                                </h3>
                            </div>

                            {/* Comment Input */}
                            <div className="p-4 border-b border-[hsl(var(--v3-border))]">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Nhập nội dung trao đổi..."
                                    className="w-full h-20 px-3 py-2 text-sm rounded-lg border border-[hsl(var(--v3-border))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20 focus:border-[hsl(var(--v3-primary))]"
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <button className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]">
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <button className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors">
                                        <Send className="w-3.5 h-3.5" />
                                        Gửi
                                    </button>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="p-4">
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--v3-primary))] to-[hsl(var(--v3-primary-hover))] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                                {comment.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{comment.user}</p>
                                                <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{comment.role}</p>
                                                <p className="text-sm text-[hsl(var(--v3-card-foreground))] mt-1">{comment.content}</p>
                                                <p className="text-xs text-[hsl(var(--v3-muted-foreground))] mt-1">{comment.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
