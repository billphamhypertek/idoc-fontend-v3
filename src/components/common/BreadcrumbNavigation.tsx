"use client";

import React from "react";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  href?: string;
  label: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  currentPage: string;
  showHome?: boolean;
  className?: string;
}

export default function BreadcrumbNavigation({
  items,
  currentPage,
  showHome = true,
  className = "",
}: BreadcrumbNavigationProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Home item */}
        {showHome && (
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="flex items-center text-blue-600 hover:text-blue-800 font-bold"
            >
              <Home className="w-4 h-4 mr-1" />
              Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {/* Dynamic items */}
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {(showHome || index > 0) && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink
                  href={item.href}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-bold"
                >
                  {item.icon && (
                    <span className="w-4 h-4 mr-1">{item.icon}</span>
                  )}
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <span className="flex items-center text-blue-600 font-bold">
                  {item.icon && (
                    <span className="w-4 h-4 mr-1">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}

        {/* Current page */}
        {(showHome || items.length > 0) && <BreadcrumbSeparator />}
        <BreadcrumbItem>
          <BreadcrumbPage className="font-bold">{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
