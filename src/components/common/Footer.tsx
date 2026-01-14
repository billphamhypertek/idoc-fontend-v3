import React from "react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`py-2 mt-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-[14px] ">
            Hệ thống Quản lý văn bản và Điều hành tác nghiệp
          </p>
        </div>
      </div>
    </footer>
  );
}
