"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    DownloadIcon,
    EyeOpenIcon,
    Share1Icon,
    PlusIcon,
    ChatBubbleIcon,
    CounterClockwiseClockIcon,
    ExitIcon,
    ReaderIcon,
    TargetIcon,
} from "@radix-ui/react-icons";
import { FileText, Paperclip, Send, Clock, CheckCircle2, Users, ListTodo, Info } from "lucide-react";

// Mock data
const mockDocument = {
    number: "Số công văn đến loại Thường/2025",
    arrivalNumber: "64701",
    senderParent: "",
    senderChild: "Khác",
    numberSign: "123",
    deadline: "",
    urgency: "Bình thường",
    securityLevel: "Thường",
    docDate: "12/12/2025",
    receiveDate: "12/12/2025",
    bookDate: "12/12/2025",
    method: "Văn bản giấy nhận",
    docType: "Công văn",
    status: "Đang xử lý",
    excerpt: "abc",
    storageUnit: "",
};

const mockAttachments = [
    { id: 1, name: "123_BNV_TCBC_DeAn.pdf", displayName: "Đề án tổ chức bộ máy cơ yếu", size: "2.5 MB", type: "pdf" },
    { id: 2, name: "123_BNV_TCBC_PhuLuc.xlsx", displayName: "Phụ lục kèm theo", size: "850 KB", type: "xlsx" },
];

const mockOpinionHistory = [
    { id: 1, user: "Nguyễn Thị Trang Phương", role: "Văn thư đơn vị", action: "Xử lý chính", target: "Phó Giám đốc Hoàng Anh Tú", date: "11:43:04 22/12/2025" },
    { id: 2, user: "Vũ Quốc Hồng", role: "Giám đốc", action: "Xử lý chính", target: "Văn thư đơn vị Nguyễn Thị Trang Phương", date: "11:16:29 22/12/2025" },
    { id: 3, user: "Đinh Mậu Tú", role: "Trưởng phòng Hành chính", action: "Xử lý chính", target: "Giám đốc Vũ Quốc Hồng", date: "10:33:53 12/12/2025" },
    { id: 4, user: "Nguyễn Thị Trang Phương", role: "Văn thư đơn vị", action: "Xử lý chính", target: "Trưởng phòng Hành chính Đinh Mậu Tú", date: "10:33:16 12/12/2025" },
];

const mockRelatedTasks = [
    { id: 1, name: "abc", assignedBy: "Đinh Mậu Tú" },
];

const mockSendReceiveInfo = [
    { id: 1, recipient: "Nguyễn Thị Trang Phương - Văn thư đơn vị - Phòng Chính trị - Tổ chức - Hành chính", status: "Xử lý chính", deadline: "", activity: "Đã xử lý", progress: 100 },
];

const mockProcessHistory = [
    { id: 1, action: "Tiếp nhận", from: "Văn thư Ban", to: "Trưởng ban", date: "15/01/2026 08:30", status: "done" },
    { id: 2, action: "Phân công", from: "Trưởng ban", to: "Phó Trưởng ban", date: "15/01/2026 08:45", status: "done" },
    { id: 3, action: "Giao xử lý", from: "Phó Trưởng ban", to: "Văn phòng Ban", date: "15/01/2026 09:45", status: "done" },
    { id: 4, action: "Đang xử lý", from: "Vũ Ngọc Thiềm", to: "", date: "15/01/2026 10:30", status: "current" },
];

// Collapsible card using v3 tokens
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

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", value === 100 ? "bg-green-500" : "bg-[hsl(var(--v3-primary))]")} style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs font-medium text-[hsl(var(--v3-muted-foreground))]">{value}%</span>
        </div>
    );
}

export default function DocumentDetailPage() {
    const router = useRouter();
    const [newOpinion, setNewOpinion] = useState("");
    const [showMore, setShowMore] = useState(false);

    const getFileIcon = (type: string) => ({ pdf: "📄", xlsx: "📊", docx: "📝" }[type] || "📎");

    return (
        <PageLayout activeModule="doc-in" activeSubMenu="doc-in">
            <div className="space-y-5">
                {/* Header */}
                {/* Header */}
                <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Chi tiết văn bản đến</h1>

                {/* Action Buttons */}
                <div className="v3-card flex items-center gap-2 flex-wrap p-3">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-lg border border-[hsl(var(--v3-border))] flex items-center justify-center text-[hsl(var(--v3-muted-foreground))] hover:bg-[hsl(var(--v3-muted))]">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-[hsl(var(--v3-border))] mx-1" />
                    <ActionButton icon={EyeOpenIcon} label="Theo dõi" variant="primary" />
                    <ActionButton icon={ExitIcon} label="Trả lại" variant="primary" />
                    <ActionButton icon={CounterClockwiseClockIcon} label="Thu hồi chuyển xử lý" variant="primary" />
                    <ActionButton icon={Share1Icon} label="Chuyển xử lý" variant="primary" hasDropdown />
                    <ActionButton icon={CheckCircle2} label="Hoàn thành xử lý" variant="success" />
                    <ActionButton icon={ReaderIcon} label="Nhật ký" variant="warning" />
                    <ActionButton icon={TargetIcon} label="Giao việc" />
                </div>

                {/* Two column layout */}
                <div className="flex gap-5">
                    {/* Left - Main content */}
                    <div className="flex-1 space-y-5 min-w-0">
                        {/* Thông tin chung */}
                        <CollapsibleCard title="Thông tin chung" icon={Info}>
                            <div className="grid grid-cols-2 gap-x-12">
                                <div>
                                    <InfoRow label="Số văn bản:" value={mockDocument.number} />
                                    <InfoRow label="Nơi gửi (cha):" value={mockDocument.senderParent} />
                                    <InfoRow label="Số, KH của VB đến:" value={mockDocument.numberSign} />
                                    <InfoRow label="Độ khẩn:" value={mockDocument.urgency} />
                                    <InfoRow label="Ngày văn bản:" value={mockDocument.docDate} />
                                    <InfoRow label="Ngày vào sổ:" value={mockDocument.bookDate} />
                                    <InfoRow label="Loại văn bản:" value={mockDocument.docType} />
                                    <InfoRow label="Hạn xử lý (bằng số):" value={mockDocument.deadline} />
                                    <InfoRow label="Đơn vị nhận lưu:" value={mockDocument.storageUnit} />
                                    <InfoRow label="Gán nhãn:" value={
                                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-xs font-medium hover:bg-[hsl(var(--v3-primary-hover))]">
                                            <PlusIcon className="w-3 h-3" /> Chọn nhãn
                                        </button>
                                    } />
                                </div>
                                <div>
                                    <InfoRow label="Số đến:" value={mockDocument.arrivalNumber} />
                                    <InfoRow label="Nơi gửi (con):" value={mockDocument.senderChild} />
                                    <InfoRow label="Hạn xử lý:" value={mockDocument.deadline} />
                                    <InfoRow label="Độ mật:" value={mockDocument.securityLevel} />
                                    <InfoRow label="Ngày nhận văn bản:" value={mockDocument.receiveDate} />
                                    <InfoRow label="Phương thức:" value={mockDocument.method} />
                                    <InfoRow label="Trạng thái văn bản:" value={<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[hsl(var(--v3-primary))]/10 text-[hsl(var(--v3-primary))]">{mockDocument.status}</span>} />
                                    <InfoRow label="Trích yếu:" value={mockDocument.excerpt} />
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <button onClick={() => setShowMore(!showMore)} className="text-sm font-medium text-[hsl(var(--v3-primary))] hover:underline">
                                    {showMore ? "Thu gọn" : "Xem thêm"}
                                </button>
                            </div>
                        </CollapsibleCard>

                        {/* Tệp đính kèm */}
                        <CollapsibleCard title="Tệp đính kèm" icon={Paperclip}>
                            <div className="space-y-2">
                                {mockAttachments.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--v3-border))] hover:bg-[hsl(var(--v3-muted))]/50 group">
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{getFileIcon(file.type)}</span>
                                            <div>
                                                <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{file.displayName}</p>
                                                <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">{file.name} • {file.size}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                            <button className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]"><EyeOpenIcon className="w-4 h-4" /></button>
                                            <button className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]"><DownloadIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 rounded-xl border-2 border-dashed border-[hsl(var(--v3-border))] text-sm font-medium text-[hsl(var(--v3-muted-foreground))] hover:border-[hsl(var(--v3-primary))] hover:text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/5">
                                    <PlusIcon className="w-4 h-4 inline mr-2" /> Thêm tệp đính kèm
                                </button>
                            </div>
                        </CollapsibleCard>

                        {/* Danh sách công việc liên quan */}
                        <CollapsibleCard title="Danh sách công việc liên quan" icon={ListTodo}>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--v3-border))]">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase w-16">STT</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase">Tên công việc</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase">Người giao việc</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockRelatedTasks.map((task, i) => (
                                        <tr key={task.id} className="hover:bg-[hsl(var(--v3-muted))]/50 border-b border-[hsl(var(--v3-border))] last:border-0">
                                            <td className="px-4 py-4 text-sm text-[hsl(var(--v3-muted-foreground))]">{i + 1}</td>
                                            <td className="px-4 py-4 text-sm text-[hsl(var(--v3-card-foreground))]">{task.name}</td>
                                            <td className="px-4 py-4 text-sm text-[hsl(var(--v3-muted-foreground))]">{task.assignedBy}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CollapsibleCard>

                        {/* Thông tin gửi nhận */}
                        <CollapsibleCard title="Thông tin gửi nhận" icon={Users}>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--v3-border))]">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase">Người gửi/nhận</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase w-24">Trạng thái</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase w-24">Hạn xử lý</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase w-24">Hoạt động</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase w-28">Tiến độ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockSendReceiveInfo.map((item) => (
                                        <tr key={item.id} className="hover:bg-[hsl(var(--v3-muted))]/50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <ChevronDownIcon className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                                                    <span className="text-sm text-[hsl(var(--v3-card-foreground))] truncate max-w-xs">{item.recipient}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-[hsl(var(--v3-muted-foreground))]">{item.status}</td>
                                            <td className="px-4 py-4 text-sm text-[hsl(var(--v3-muted-foreground))]">{item.deadline || "-"}</td>
                                            <td className="px-4 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">{item.activity}</span>
                                            </td>
                                            <td className="px-4 py-4"><ProgressBar value={item.progress} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CollapsibleCard>

                        {/* Lịch sử xử lý */}
                        <CollapsibleCard title="Lịch sử xử lý" icon={Clock}>
                            <div className="relative pl-8">
                                {mockProcessHistory.map((item, i) => (
                                    <div key={item.id} className="relative pb-6 last:pb-0">
                                        {i < mockProcessHistory.length - 1 && <div className="absolute left-[-20px] top-8 bottom-0 w-0.5 bg-[hsl(var(--v3-border))]" />}
                                        <div className={cn("absolute left-[-24px] top-1.5 w-3 h-3 rounded-full border-2", item.status === "current" ? "border-[hsl(var(--v3-primary))] bg-[hsl(var(--v3-primary))]" : "border-green-500 bg-green-500")} />
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">{item.action}</p>
                                                <p className="text-xs text-[hsl(var(--v3-muted-foreground))] mt-0.5">{item.from}{item.to && ` → ${item.to}`}</p>
                                            </div>
                                            <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleCard>
                    </div>

                    {/* Right - Ý kiến xử lý sidebar */}
                    <div className="w-[360px] shrink-0">
                        <div className="sticky top-4 v3-card overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                            {/* Header - using v3 primary */}
                            <div className="bg-[hsl(var(--v3-primary))] px-5 py-4 text-white">
                                <h3 className="font-semibold">Ý kiến xử lý</h3>
                            </div>

                            {/* Input */}
                            <div className="p-4 border-b border-[hsl(var(--v3-border))]">
                                <textarea
                                    value={newOpinion}
                                    onChange={(e) => setNewOpinion(e.target.value)}
                                    placeholder="Nhập nội dung ý kiến"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--v3-border))] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20 focus:border-[hsl(var(--v3-primary))]"
                                />
                                <div className="flex items-center justify-end gap-2 mt-3">
                                    <button className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] text-[hsl(var(--v3-muted-foreground))]">
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] shadow-sm">
                                        <Send className="w-4 h-4" />
                                        Gửi ý kiến
                                    </button>
                                </div>
                            </div>

                            {/* History header */}
                            <div className="px-5 py-3 border-b border-[hsl(var(--v3-border))] bg-[hsl(var(--v3-muted))]">
                                <h4 className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">Lịch sử ý kiến</h4>
                            </div>

                            {/* Opinion history */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {mockOpinionHistory.map((opinion) => (
                                    <div key={opinion.id} className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--v3-muted))] flex items-center justify-center shrink-0">
                                            <Users className="w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">
                                                {opinion.user}
                                                <span className="font-normal text-[hsl(var(--v3-muted-foreground))]">({opinion.role}):</span>
                                            </p>
                                            <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mt-0.5">
                                                - {opinion.action} : {opinion.target}
                                            </p>
                                            <p className="text-xs text-[hsl(var(--v3-primary))] mt-1">
                                                Vào lúc:{opinion.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-6 text-sm text-[hsl(var(--v3-muted-foreground))]">
                    Hệ thống Quản lý văn bản và Điều hành tác nghiệp
                </div>
            </div>
        </PageLayout>
    );
}
