"use client";

import React, { useMemo, useState, useEffect } from "react";
import { HscqFilters } from "@/components/document-record/HscqFilters";
import {
  useDoLoadHSCQ,
  useGetAllOrgAndSub,
} from "@/hooks/data/document-record.data";
import { getUserInfo } from "@/utils/authentication.utils";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Column } from "@/definitions/types/table.type";
import { Table } from "@/components/ui/table";
import { HosoItem } from "@/definitions/types/document-record.type";
import { formatDate } from "@/utils/datetime.utils";
import { useUserFromOrg } from "@/hooks/data/common.data";

export interface SearchParams {
  createBy?: string;
  folderName: string;
  orgQLId: string;
  monthCreate: string;
  yearCreate: string;
}

const tabs = [
  { id: "waitHandleTab", label: "Chờ tiếp nhận", tabValue: 1 },
  { id: "handledTab", label: "Đã tiếp nhận", tabValue: 2 },
];

export default function HscqPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tabRefreshKey, setTabRefreshKey] = useState(0);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setTabRefreshKey((prev) => prev + 1);
  };

  const [searchParams, setSearchParams] = useState<SearchParams>({
    createBy: "",
    folderName: "",
    orgQLId: "",
    monthCreate: "",
    yearCreate: "",
  });
  const [folderNameTemp, setFolderNameTemp] = useState("");
  const currentYear = new Date().getFullYear();
  const yearList = Array.from(
    { length: currentYear - 2018 + 1 },
    (_, i) => 2018 + i
  );

  const userInfo = getUserInfo();
  const orgId = userInfo?.org ?? "";

  const { data: users } = useUserFromOrg(orgId.toString(), {});

  const { data: orgList = [] } = useGetAllOrgAndSub(orgId, !!orgId);

  const orgTree = useMemo(() => {
    if (!Array.isArray(orgList)) return [];
    const list = JSON.parse(JSON.stringify(orgList));
    list.forEach((org: any) => {
      org.hasChild = Array.isArray(org.child) && org.child.length > 0;
      org.expanded = org.hasChild;
    });
    return list;
  }, [orgList]);

  const compileAction = (tab: string) => {
    const tabItem = tabs.find((t) => t.id === tab);
    return tabItem?.tabValue || 1;
  };

  const {
    data: hscqData,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useDoLoadHSCQ(
    compileAction(activeTab),
    { ...searchParams, page, pageSize },
    true
  );

  const handleSearch = () => {
    setPage(1);
    setSearchParams((p) => ({ ...p, folderName: folderNameTemp }));
    refetch();
  };
  const columns: Column<HosoItem>[] = [
    {
      header: <span className="font-normal not-italic">STT</span>,
      accessor: (_: HosoItem, index: number) =>
        (page - 1) * pageSize + index + 1,
      className: "text-center text-black",
    },
    {
      header: <span className="font-normal not-italic">Tên đơn vị</span>,
      accessor: (row: HosoItem) => row.orgQLName || "—",
      className: "text-center text-black",
    },
    {
      header: <span className="font-normal not-italic">Tiêu đề hồ sơ</span>,
      accessor: (row: HosoItem) =>
        row.title
          ? `${row.title}${row.fileCode ? ` - ${row.fileCode}` : ""}`
          : "—",
      className: "text-left font-medium text-black",
    },
    {
      header: <span className="font-normal not-italic">Thời gian hồ sơ</span>,
      accessor: (row: HosoItem) =>
        row.createDate ? formatDate(row.createDate) : "—",
      className: "text-center text-black",
    },
    {
      header: <span className="font-normal not-italic">Thời hạn bảo quản</span>,
      accessor: (row: HosoItem) => row.maintenanceObj || "—",
      className: "text-center text-black",
    },
    {
      header: <span className="font-normal not-italic">Người lập</span>,
      accessor: (row: HosoItem) => row.createBy || "—",
      className: "text-center text-black",
    },
    {
      header: <span className="font-normal not-italic">Người tiếp nhận</span>,
      accessor: (row: HosoItem) => row.receiveBy || "—",
      className: "text-center text-black",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <BreadcrumbNavigation
        items={[{ label: "Hồ sơ lưu trữ" }]}
        currentPage="Hồ sơ cơ quan"
        showHome={false}
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <ul className="flex border-b" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="mr-1">
              <button
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-block px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div className="p-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`${tab.id}-panel`}
              aria-labelledby={tab.id}
              className={activeTab === tab.id ? "block" : "hidden"}
            >
              {/* Bộ lọc */}
              <div className="mb-4">
                <HscqFilters
                  searchParams={searchParams}
                  folderNameTemp={folderNameTemp}
                  setFolderNameTemp={setFolderNameTemp}
                  setSearchParams={setSearchParams}
                  onSearch={handleSearch}
                  yearList={yearList}
                  users={users ?? []}
                  orgList={orgTree}
                />
              </div>
              {/* Bảng dữ liệu */}
              <Table<HosoItem>
                columns={columns}
                dataSource={hscqData?.content || []}
                loading={isFetching}
                showPagination={true}
                totalItems={hscqData?.totalElements || 0}
                currentPage={page}
                itemsPerPage={pageSize}
                onPageChange={(page) => setPage(page)}
                onItemsPerPageChange={(size) => setPageSize(size)}
                rowClassName={() => "hover:bg-blue-50 cursor-pointer"}
                rowTextColor={() => "text-gray-700"}
                emptyText={
                  isLoading
                    ? "Đang tải dữ liệu..."
                    : error
                      ? `Lỗi: ${error.message}`
                      : "Không tồn tại hồ sơ"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
