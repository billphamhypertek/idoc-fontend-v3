"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    FileTextIcon,
    Pencil1Icon,
    Share1Icon,
    CheckCircledIcon,
    ReloadIcon,
    ClockIcon,
    PersonIcon,
    ChatBubbleIcon,
    PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { Paperclip, Send, FileText, Eye, History, ClipboardList, Users } from "lucide-react";

// Mock document data
const mockDocument = {
    id: "VBO001",
    number: "156/CV-BCY",
    title: "Công văn về việc triển khai kế hoạch công tác năm 2025",
    to: "Ban Cơ yếu Chính phủ",
    docType: "Công văn",
    urgency: "Bình thường",
    security: "Thường",
    status: "Chờ duyệt",
    date: "15/01/2026",
    createdBy: "Nguyễn Văn A",
    department: "Phòng Tổng hợp",
    excerpt: "V/v triển khai kế hoạch công tác năm 2025 của Ban Cơ yếu Chính phủ trong lĩnh vực an ninh mạng và bảo mật thông tin.",
};

const attachments = [
    { id: 1, name: "Công văn 156-CV-BCY.pdf", size: "2.3 MB", type: "pdf" },
    { id: 2, name: "Phụ lục kế hoạch.xlsx", size: "856 KB", type: "xlsx" },
];

const comments = [
    {
        id: 1,
        user: "Nguyễn Thị Trang Phương",
        avatar: "NP",
        role: "Xử lý chính - Phó Giám đốc",
        content: "Văn bản đã được rà soát và sẵn sàng trình duyệt.",
        time: "10:30 15/01/2026",
    },
    {
        id: 2,
        user: "Vũ Quang Nam",
        avatar: "VN",
        role: "Người soạn thảo",
        content: "Đã hoàn thành chỉnh sửa theo góp ý.",
        time: "09:15 15/01/2026",
    },
];

const processHistory = [
    { step: "Soạn thảo", user: "Nguyễn Văn A", time: "08:00 14/01/2026", status: "done" },
    { step: "Trình duyệt", user: "Nguyễn Văn A", time: "09:00 14/01/2026", status: "done" },
    { step: "Phê duyệt", user: "Nguyễn Thị Trang Phương", time: "10:30 15/01/2026", status: "current" },
    { step: "Phát hành", user: "-", time: "-", status: "pending" },
];

function ActionButton({ icon: Icon, label, variant = "default", hasDropdown = false }: {
    icon: React.ElementType;
    label: string;
    variant?: "default" | "primary" | "success" | "warning";
    hasDropdown?: boolean;
}) {
    const variants = {
        default: "bg-white border-[hsl(var(--v3-border))] text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))]",
        primary: "bg-[hsl(var(--v3-primary))] border-[hsl(var(--v3-primary))] text-white hover:bg-[hsl(var(--v3-primary-hover))] shadow-sm",
        success: "bg-green-500 border-green-500 text-white hover:bg-green-600 shadow-sm",
        warning: "bg-amber-500 border-amber-500 text-white hover:bg-amber-600 shadow-sm",
    };
    return (
        <button className={cn("inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border text-sm font-medium transition-all", variants[variant])}>
            <Icon className="w-4 h-4" />
            {label}
            {hasDropdown && <ChevronDownIcon className="w-3 h-3 ml-0.5" />}
        </button>
    );
}

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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start py-2.5 border-b border-[hsl(var(--v3-border))] last:border-0">
            <span className="w-40 shrink-0 text-sm font-medium text-[hsl(var(--v3-muted-foreground))]">{label}</span>
            <span className="text-sm text-[hsl(var(--v3-card-foreground))]">{value || "-"}</span>
        </div>
    );
}

export default function DocumentOutDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [newComment, setNewComment] = useState("");
    const [showAllInfo, setShowAllInfo] = useState(false);

    return (
        <PageLayout activeModule="doc-out" activeSubMenu="doc-out">
            <div className="space-y-4">
                {/* Header & Back */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg border border-[hsl(var(--v3-border))] bg-white hover:bg-[hsl(var(--v3-muted))] transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Chi tiết văn bản đi</h1>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <ActionButton icon={Eye} label="Xem trước" />
                    <ActionButton icon={Pencil1Icon} label="Chỉnh sửa" />
                    <ActionButton icon={Share1Icon} label="Trình duyệt" variant="primary" />
                    <ActionButton icon={ReloadIcon} label="Thu hồi" />
                    <ActionButton icon={CheckCircledIcon} label="Phát hành" variant="success" />
                    <ActionButton icon={History} label="Nhật ký" />
                    <ActionButton icon={ClipboardList} label="Giao việc" />
                </div>

                {/* Main Content - 2 columns */}
                <div className="flex gap-6">
                    {/* Left Column - Main Info */}
                    <div className="flex-1 space-y-4 min-w-0">
                        {/* General Info */}
                        <CollapsibleCard title="Thông tin chung" icon={FileTextIcon}>
                            <div className="space-y-0">
                                <InfoRow label="Số văn bản:" value={mockDocument.number} />
                                <InfoRow label="Nơi nhận:" value={mockDocument.to} />
                                <InfoRow label="Loại văn bản:" value={mockDocument.docType} />
                                <InfoRow label="Độ khẩn:" value={mockDocument.urgency} />
                                <InfoRow label="Ngày văn bản:" value={mockDocument.date} />
                                <InfoRow label="Người soạn:" value={mockDocument.createdBy} />
                                {showAllInfo && (
                                    <>
                                        <InfoRow label="Đơn vị soạn:" value={mockDocument.department} />
                                        <InfoRow label="Độ mật:" value={mockDocument.security} />
                                        <InfoRow
                                            label="Trạng thái:"
                                            value={
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    {mockDocument.status}
                                                </span>
                                            }
                                        />
                                    </>
                                )}
                                <InfoRow label="Trích yếu:" value={mockDocument.excerpt} />
                                <div className="pt-2">
                                    <button
                                        onClick={() => setShowAllInfo(!showAllInfo)}
                                        className="text-sm text-[hsl(var(--v3-primary))] hover:underline"
                                    >
                                        {showAllInfo ? "Thu gọn" : "Xem thêm"}
                                    </button>
                                </div>
                            </div>
                        </CollapsibleCard>

                        {/* Attachments */}
                        <CollapsibleCard title="Tệp đính kèm" icon={Paperclip}>
                            <div className="space-y-2">
                                {attachments.map((file) => (
                                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--v3-muted))]/50 hover:bg-[hsl(var(--v3-muted))] transition-colors cursor-pointer">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                            file.type === "pdf" ? "bg-red-100" : "bg-green-100"
                                        )}>
                                            <FileText className={cn(
                                                "w-5 h-5",
                                                file.type === "pdf" ? "text-red-600" : "text-green-600"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] truncate">{file.name}</p>
                                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{file.size}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleCard>

                        {/* Process History */}
                        <CollapsibleCard title="Lịch sử xử lý" icon={History}>
                            <div className="space-y-3">
                                {processHistory.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            step.status === "done" && "bg-green-100",
                                            step.status === "current" && "bg-[hsl(var(--v3-primary))]/10",
                                            step.status === "pending" && "bg-[hsl(var(--v3-muted))]"
                                        )}>
                                            {step.status === "done" && <CheckCircledIcon className="w-4 h-4 text-green-600" />}
                                            {step.status === "current" && <ClockIcon className="w-4 h-4 text-[hsl(var(--v3-primary))]" />}
                                            {step.status === "pending" && <div className="w-2 h-2 rounded-full bg-[hsl(var(--v3-muted-foreground))]" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{step.step}</p>
                                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{step.user} • {step.time}</p>
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
                                    Ý kiến xử lý
                                </h3>
                            </div>

                            {/* Comment Input */}
                            <div className="p-4 border-b border-[hsl(var(--v3-border))]">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Nhập ý kiến xử lý..."
                                    className="w-full h-20 px-3 py-2 text-sm rounded-lg border border-[hsl(var(--v3-border))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20 focus:border-[hsl(var(--v3-primary))]"
                                />
                                <div className="flex justify-end mt-2">
                                    <button className="inline-flex items-center gap-2 h-8 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors">
                                        <Send className="w-3.5 h-3.5" />
                                        Gửi ý kiến
                                    </button>
                                </div>
                            </div>

                            {/* Comments History */}
                            <div className="p-4">
                                <h4 className="text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase tracking-wider mb-3">
                                    Lịch sử ý kiến
                                </h4>
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
