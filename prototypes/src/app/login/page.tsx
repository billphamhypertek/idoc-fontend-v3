"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { EyeOpenIcon, EyeClosedIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        remember: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login
        await new Promise(resolve => setTimeout(resolve, 1000));

        router.push("/");
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(var(--v3-primary))] to-[hsl(var(--v3-primary-hover))] p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">DH</span>
                        </div>
                        <div>
                            <h1 className="text-white text-xl font-bold">Điều hành tác nghiệp</h1>
                            <p className="text-white/70 text-sm">Ban Cơ yếu Chính phủ</p>
                        </div>
                    </div>
                </div>

                <div className="text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Hệ thống Quản lý văn bản<br />và Điều hành tác nghiệp
                    </h2>
                    <p className="text-white/80 text-lg">
                        Giải pháp số hóa quy trình văn bản, nâng cao hiệu quả công việc
                    </p>
                </div>

                <div className="text-white/60 text-sm">
                    © 2026 Ban Cơ yếu Chính phủ. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[hsl(var(--v3-background))]">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--v3-primary))] flex items-center justify-center">
                            <span className="text-white text-xl font-bold">DH</span>
                        </div>
                        <div>
                            <h1 className="text-[hsl(var(--v3-card-foreground))] text-xl font-bold">Điều hành tác nghiệp</h1>
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white rounded-2xl border border-[hsl(var(--v3-border))] shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[hsl(var(--v3-card-foreground))]">Đăng nhập</h2>
                            <p className="text-[hsl(var(--v3-muted-foreground))] mt-2">Nhập thông tin để truy cập hệ thống</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--v3-card-foreground))] mb-2">
                                    Tên đăng nhập
                                </label>
                                <div className="relative">
                                    <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Nhập tên đăng nhập"
                                        className="w-full h-12 pl-10 pr-4 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-[hsl(var(--v3-card-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20 focus:border-[hsl(var(--v3-primary))]"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--v3-card-foreground))] mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Nhập mật khẩu"
                                        className="w-full h-12 pl-10 pr-12 rounded-lg border border-[hsl(var(--v3-border))] bg-white text-[hsl(var(--v3-card-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--v3-primary))]/20 focus:border-[hsl(var(--v3-primary))]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))]"
                                    >
                                        {showPassword ? <EyeClosedIcon className="w-5 h-5" /> : <EyeOpenIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.remember}
                                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                        className="w-4 h-4 rounded border-[hsl(var(--v3-border))] text-[hsl(var(--v3-primary))]"
                                    />
                                    <span className="text-sm text-[hsl(var(--v3-muted-foreground))]">Ghi nhớ đăng nhập</span>
                                </label>
                                <a href="#" className="text-sm text-[hsl(var(--v3-primary))] hover:underline">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    "w-full h-12 rounded-lg bg-[hsl(var(--v3-primary))] text-white font-semibold transition-all",
                                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[hsl(var(--v3-primary-hover))] shadow-lg shadow-[hsl(var(--v3-primary))]/30"
                                )}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Đang đăng nhập...
                                    </span>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-[hsl(var(--v3-muted-foreground))] text-sm mt-6">
                        Cần hỗ trợ? Liên hệ <a href="#" className="text-[hsl(var(--v3-primary))] hover:underline">Quản trị viên</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
