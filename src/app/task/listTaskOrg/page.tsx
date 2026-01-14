"use client";
import TaskMonitor from "@/components/task/TaskMonitor";
import { searchTaskParams } from "@/definitions/types/task.type";
import {
  useGetTaskOrgUserLead,
  useGetTaskOrgUserLeadV2,
} from "@/hooks/data/task.data";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState } from "react";

export default function ListTaskOrg() {
  const [status, setStatus] = useState(false);
  const [page, setPage] = useState(1);
  const [dayLeft, setDayLeft] = useState("");
  const [currentTab, setCurrentTab] = useState("inprogress");
  const router = useRouter();
  const pathname = usePathname();
  const isV2 = useMemo(() => pathname?.includes("task-v2"), [pathname]);

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const [searchParams, setSearchParams] = useState<any | null>({
    taskStatus: null,
    dayLeft: "",
    orgId: UserInfo?.org,
    status: status,
  });

  const { data: taskUserLead } = useGetTaskOrgUserLead(
    status,
    page,
    dayLeft,
    UserInfo?.org,
    !isV2
  );

  const { data: taskUserLeadV2 } = useGetTaskOrgUserLeadV2(
    status,
    page,
    dayLeft,
    UserInfo?.org,
    isV2
  );

  const tabs = [
    {
      id: "inprogress",
      title: "Chưa hoàn thành",
      disabled: false,
      showDeadlineWarning: true,
    },
    {
      id: "completed",
      title: "Hoàn thành",
      disabled: false,
      showDeadlineWarning: true,
    },
  ];

  const columns = [
    {
      header: "STT",
      accessor: "no",
      className: "w-3 text-center border-r",
    },
    {
      header: "Tên công việc",
      accessor: "taskName",
      className: "w-20 border-r",
    },
    {
      header: "Ngày bắt đầu",
      accessor: "startDate",
      className: "w-10 text-center border-r",
    },
    {
      header: "Người kết thúc",
      accessor: "endDate",
      className: "w-10 text-center border-r",
    },
    {
      header: "Người giao việc",
      accessor: "userAssignName",
      className: "w-10 text-center border-r",
    },
    {
      header: "Mã công việc",
      accessor: "codeTask",
      className: "w-8 text-center border-r",
    },
  ];

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (searchParams) {
      const newParams = { ...searchParams };
      let newStatus: boolean | null;
      switch (tab) {
        case "inprogress":
          newParams.status = false;
          newStatus = false;
          break;
        case "completed":
          newParams.status = true;
          newStatus = true;
          break;
        default:
          newParams.status = null;
          newStatus = null;
          break;
      }
      setStatus(newStatus as boolean);
      setSearchParams(newParams);
      setPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const onRowClick = (row: any) => {
    if (isV2) {
      router.push(`/task-v2/listTaskOrg/detail/${row.id}`);
    } else {
      router.push(`/task/listTaskOrg/detail/${row.id}`);
    }
  };

  const breadcrumbItems = [
    {
      label: "Quản lý công việc",
      href: "/task/listTaskOrg",
    },
  ];

  const source = isV2 ? taskUserLeadV2 : taskUserLead;

  const formattedData = (source?.objList || []).map(
    (item: any, index: number) => ({
      ...item,
      no: (page - 1) * 10 + (index + 1),
      startDate: `${item.startDate ? new Date(item.startDate).toLocaleDateString("vi-VN") : ""}`,
      endDate: `${item.endDate ? new Date(item.endDate).toLocaleDateString("vi-VN") : ""}`,
      userAssignName: item.userAssignName || "",
      codeTask: item.codeTask || "",
      actions: null,
    })
  );

  return (
    <>
      <TaskMonitor
        data={formattedData || []}
        isDefaultFilter={false}
        columns={columns}
        searchParams={searchParams}
        tabs={tabs}
        onRowClick={onRowClick}
        headerTitle="Danh sách công việc trong cơ quan"
        headerSubtitle="Danh sách công việc trong cơ quan với vai trò lãnh đạo"
        breadcrumbItems={breadcrumbItems}
        currentPage="Danh sách công việc cơ quan"
        handleTabChange={handleTabChange}
        currentPageNumber={page}
        totalItems={source?.totalRecord}
        onPageChange={handlePageChange}
      />
    </>
  );
}
