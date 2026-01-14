"use client";
import React, { useState } from "react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import CategoryTypeList from "@/components/categories/CategoryTypeList";
import CategoryList from "@/components/categories/CategoryList";

export default function CategoriesPage() {
  const [selectedCategoryTypeId, setSelectedCategoryTypeId] = useState<
    number | null
  >(null);

  const handleCategoryTypeSelect = (categoryTypeId: number) => {
    setSelectedCategoryTypeId(categoryTypeId);
  };

  return (
    <div className="space-y-4 p-3">
      <BreadcrumbNavigation
        items={[
          {
            href: "/categories",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý danh mục"
        showHome={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Type List - Left Column */}
        <div className="lg:col-span-1">
          <CategoryTypeList onCategoryTypeSelect={handleCategoryTypeSelect} />
        </div>

        {/* Category List - Right Column */}
        <div className="lg:col-span-2">
          <CategoryList categoryTypeId={selectedCategoryTypeId} />
        </div>
      </div>
    </div>
  );
}
