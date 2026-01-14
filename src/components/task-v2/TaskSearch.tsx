"use client";

import TaskMonitor from "@/components/task/TaskMonitor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchTaskParams } from "@/definitions/types/task.type";
import { useDoSearchTask } from "@/hooks/data/task.data";
import { TaskService } from "@/services/task.service";
import {
  generateExcelTask,
  generatePDFTask,
  getAssetIcon,
  handleError,
  prettyJSON,
  prettyJSONtoPDF,
} from "@/utils/common.utils";
import { defaultSearchTaskParams } from "@/utils/formValue.utils";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { FileCheck, FileIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ToastUtils } from "@/utils/toast.utils";
import { TaskV2Service } from "@/services/taskv2.service";

enum PdfAction {
  VIEWPDF = "viewPDF",
  SUBMITPDF = "submitPDF",
  DOWNLOADPDF = "downloadPDF",
}
type Props = {
  isV2?: boolean;
};

export default function TaskSearch({ isV2 = false }: Props) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<searchTaskParams | null>({
    taskFieldId: null,
    priorityId: [],
    taskType: null,
    taskStatus: null,
    codeTask: null,
    startDate: "",
    endDate: "",
    dayLeft: "",
    orgId: "",
    userStatus: null,
    orgAssignOfTask: null,
    startReportDate: null,
    endReportDate: null,
    nameLeadSign: "",
    userAssignId: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState("inprogress");
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [isCreatingPdf, setIsCreatingPdf] = useState<boolean>(false);
  const [openCreatePdf, setOpenCreatePdf] = useState<boolean>(false);
  const [titlefilePDF, setTitlefilePDF] = useState<string>("");
  const [resultCopy, setResultCopy] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState<number | null>(null);

  const [selectedOrgName, setSelectedOrgName] = useState<string>("");

  const { data: taskResult, refetch: originalRefetch } = useDoSearchTask(
    searchParams || defaultSearchTaskParams,
    currentPage,
    isV2
  );

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (searchParams) {
      const newParams = { ...searchParams };
      switch (tab) {
        case "inprogress":
          newParams.taskStatus = false;
          break;
        case "finished":
          newParams.taskStatus = true;
          break;
        case "return":
          newParams.taskStatus = null;
          break;
      }
      setSearchParams(newParams);
      setCurrentPage(1);
    }
  };

  const onSearch = (params: searchTaskParams) => {
    setSearchParams(params);
    setCurrentPage(1);
  };

  const onRowClick = (row: any) => {
    if (isV2) {
      router.push(`/task-v2/search/detail/${row.id}`);
    } else {
      router.push(`/task/search/detail/${row.id}`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOrgNameChange = (orgName: string) => {
    setSelectedOrgName(orgName);
  };

  const formattedData = (taskResult?.objList || []).map(
    (item: any, index: number) => ({
      ...item,
      no: (currentPage - 1) * 10 + (index + 1),
      timeRange: `${item.startDate ? new Date(item.startDate).toLocaleDateString("vi-VN") : ""}-${item.endDate ? new Date(item.endDate).toLocaleDateString("vi-VN") : ""}`,
      assigners: isV2
        ? item.userAssignName || ""
        : item.assigners
            ?.map((assigner: any) => assigner.fullName)
            .join(", ") || "",
      result: item.result || "",
      actions: null,
    })
  );

  const filterResult = (objList: any[]) => {
    let filteredData: any[];
    if (selectedOption === "true") {
      filteredData = objList.filter(
        (item) => Array.isArray(item.assigners) && item.assigners[0].orgId === 2
      );
    } else if (selectedOption === "false") {
      filteredData = objList.filter(
        (item) => Array.isArray(item.assigners) && item.assigners[0].orgId !== 2
      );
    } else {
      filteredData = [...objList];
    }
    setResultCopy(filteredData);
    return filteredData;
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const formatted = dayjs().format("DD/MM/YYYY");

      const header = [
        "TT",
        "Nhiệm vụ",
        "Thời hạn hoàn thành",
        "Thời gian báo cáo",
        "Kết quả thực hiện",
        "Lãnh đạo chỉ đạo/căn cứ giao nhiệm vụ",
      ];

      const response = await (isV2
        ? TaskV2Service.doLoadTaskExport(searchParams)
        : TaskService.doLoadTaskExport(searchParams));
      const result = response || [];

      if (result && result.length === 0) {
        ToastUtils.error("Không tìm thấy dữ liệu công việc!");
        return;
      }

      const filteredResult = filterResult(result);
      const formattedData = prettyJSON(filteredResult, undefined);
      generateExcelTask(
        `Tổng hợp nhiệm vụ lãnh đạo Ban giao`,
        header,
        formattedData,
        "Tổng hợp nhiệm vụ"
      );
      ToastUtils.success("Xuất báo cáo Excel thành công");
    } catch (error) {
      handleError(error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export PDF
  const handleExportPdf = async (action: PdfAction) => {
    try {
      setIsCreatingPdf(true);
      const formatted = dayjs().format("DD/MM/YYYY");

      const response = await (isV2
        ? TaskV2Service.doLoadTaskExport(searchParams)
        : TaskService.doLoadTaskExport(searchParams));
      const result = response || [];

      if (result && result.length === 0) {
        ToastUtils.error("Không tìm thấy dữ liệu công việc!");
        return;
      }

      const filteredResult = filterResult(result);
      const formattedData = prettyJSONtoPDF(
        filteredResult,
        maxResults || undefined
      );

      // Determine organization export name
      let orgExport = null;
      if (
        searchParams?.orgId &&
        searchParams.orgId !== "all" &&
        selectedOrgName
      ) {
        orgExport = { id: searchParams.orgId, name: selectedOrgName };
      }

      const title = orgExport
        ? `Tổng hợp nhiệm vụ lãnh đạo Ban giao \n ${orgExport.name}`
        : `Tổng hợp nhiệm vụ lãnh đạo Ban giao`;

      const namedv = orgExport ? orgExport.name : "";
      const nameSign = searchParams?.nameLeadSign || "";

      generatePDFTask(title, formattedData, action, namedv, nameSign, (url) =>
        router.push(url)
      );
      const fileName = orgExport
        ? `Tổng hợp nhiệm vụ lãnh đạo Ban giao_${orgExport.name}_${formatted}.pdf`
        : `Tổng hợp nhiệm vụ_${formatted}.pdf`;
      setTitlefilePDF(fileName);
      setOpenCreatePdf(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsCreatingPdf(false);
    }
  };

  // View PDF
  const viewPdf = () => {
    const pdfBase64 = sessionStorage.getItem("pdfDocument");
    if (pdfBase64) {
      const pdfWindow = window.open("");
      pdfWindow?.document.write(`
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background-color: black;
            overflow: hidden;
          }
          iframe {
            width: 100vw;
            height: 100vh;
            border: none;
            display: block;
          }
        </style>
        <iframe src="data:application/pdf;base64,${encodeURI(pdfBase64)}"></iframe>
      `);
      pdfWindow?.document.close();
    } else {
      ToastUtils.error("Không tìm thấy PDF trong Session Storage");
    }
  };

  // Create draft
  const doCreateDraft = () => {
    handleExportPdf(PdfAction.SUBMITPDF);
  };

  // Download PDF
  const downloadPdf = () => {
    handleExportPdf(PdfAction.DOWNLOADPDF);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <div />;
    }
    const statusConfig = {
      "Đang thực hiện": {
        variant: "outline" as const,
        className: "text-orange-600 border-orange-200 bg-orange-50",
      },
      "Hoàn thành": {
        variant: "outline" as const,
        className: "text-green-600 border-green-200 bg-green-50",
      },
      "Hoàn thành (Chờ đánh giá)": {
        variant: "outline" as const,
        className: "text-green-600 border-green-200 bg-green-50",
      },
      "Chờ tiếp nhận": {
        variant: "outline" as const,
        className: "text-blue-600 border-blue-200 bg-blue-50",
      },
      "Mới tới": {
        variant: "outline" as const,
        className: "text-blue-600 border-blue-200 bg-blue-50",
      },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
      return (
        <Badge
          variant="outline"
          className="text-xs font-medium text-gray-600 border-gray-200 bg-gray-50"
        >
          {status}
        </Badge>
      );
    }

    return (
      <Badge
        variant={config.variant}
        className={`text-xs font-medium ${config.className}`}
      >
        {status}
      </Badge>
    );
  };

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
      header: "Thời gian",
      accessor: "timeRange",
      className: "w-10 text-center border-r",
    },
    {
      header: "Người giao việc",
      accessor: "assigners",
      className: "w-10 text-center border-r",
    },
    {
      header: "Người thực hiện",
      accessor: "userExcutePrimaryName",
      className: "w-10 text-center border-r",
    },
    {
      header: "Đơn vị xử lý",
      accessor: "orgName",
      className: "w-8 text-center border-r",
    },
    {
      header: "Kết quả xử lý",
      accessor: "result",
      className: "w-10 border-r",
    },
    {
      header: "Trạng thái",
      accessor: (item: any) => getStatusBadge(item.statusName as string),
      className: "w-10 text-center border-r",
    },
    {
      header: "Nhóm công việc",
      accessor: "priorityName",
      className: "w-10 text-center border-r",
    },
  ];

  const tabs = [
    {
      id: "inprogress",
      title: "Đang thực hiện",
      disabled: false,
      showDeadlineWarning: true,
    },
    {
      id: "finished",
      title: "Hoàn thành",
      disabled: false,
      showDeadlineWarning: false,
    },
    {
      id: "return",
      title: "Thu hồi",
      disabled: false,
      showDeadlineWarning: false,
    },
  ];

  const breadcrumbItems = [
    {
      label: "Quản lý công việc",
      href: "/task/search",
    },
  ];

  return (
    <>
      <TaskMonitor
        data={formattedData}
        searchParams={searchParams || defaultSearchTaskParams}
        onSearch={onSearch}
        isExportExcel={isExportingExcel}
        onExportExcel={handleExportExcel}
        isCreatePdf={isCreatingPdf}
        onCreatePdf={() => handleExportPdf(PdfAction.VIEWPDF)}
        columns={columns}
        tabs={tabs}
        onRowClick={onRowClick}
        headerTitle="Tìm kiếm tra cứu hồ sơ công việc"
        headerSubtitle="Thực hiện giao công việc cho các nhân"
        breadcrumbItems={breadcrumbItems}
        currentPage="Tra cứu tìm kiếm"
        handleTabChange={handleTabChange}
        currentPageNumber={currentPage}
        totalItems={taskResult?.totalRecord}
        onPageChange={handlePageChange}
        onOrgNameChange={handleOrgNameChange}
      />

      {openCreatePdf && (
        <Dialog open={openCreatePdf} onOpenChange={setOpenCreatePdf}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tạo báo cáo công việc</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <img
                src={getAssetIcon(titlefilePDF)}
                alt="PDF"
                className="w-4 h-4"
              />
              <span>{titlefilePDF}</span>
            </div>
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={viewPdf}
                  variant="outline"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileIcon className="mr-2 w-4 h-4" />
                  Xem báo cáo
                </Button>
                <Button
                  onClick={downloadPdf}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileIcon className="mr-2 w-4 h-4" />
                  Tải báo cáo
                </Button>
                {/* <Button
                  onClick={doCreateDraft}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileCheck className="mr-2 w-4 h-4" />
                  Nộp báo cáo
                </Button> */}
                <Button
                  onClick={() => setOpenCreatePdf(false)}
                  variant="outline"
                >
                  <X className="mr-2 w-4 h-4" />
                  Đóng
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
