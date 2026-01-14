"use client";

import { useState, useRef, useEffect } from "react";
import OrganizationTable from "./OrganizationTable";
import OrganizationTreeList from "./OrganizationTreeList";
import BreadcrumbNavigation from "../common/BreadcrumbNavigation";

export default function OrganizationPage() {
  const [treeData, setTreeData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectOrganization = (org: any) => {
    setSelectedOrg(org);
  };

  const handleClearSelection = () => {
    setSelectedOrg(null);
  };

  // // Tự động chọn đơn vị đầu tiên khi treeData được load lần đầu
  // useEffect(() => {
  //   if (treeData && treeData.length > 0 && !selectedOrg) {
  //     // Tìm đơn vị đầu tiên trong tree (có thể là root hoặc đơn vị đầu tiên)
  //     const firstOrg = treeData[0];
  //     if (firstOrg) {
  //       setSelectedOrg(firstOrg);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [treeData]);

  return (
    <div className="space-y-4 py-0 px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý đơn vị"
        showHome={false}
      />
      <div className="flex gap-4">
        <div className="w-1/3">
          <OrganizationTreeList
            setTreeData={setTreeData}
            refreshTrigger={refreshTrigger}
            onSelectOrganization={handleSelectOrganization}
            selectedOrgId={selectedOrg?.id}
          />
        </div>
        <div className="w-2/3">
          <OrganizationTable
            treeData={treeData}
            onRefresh={handleRefresh}
            selectedOrg={selectedOrg}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>
    </div>
  );
}
