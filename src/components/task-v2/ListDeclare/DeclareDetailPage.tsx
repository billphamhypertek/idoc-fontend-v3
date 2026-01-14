"use client";

import { useGetDetail } from "@/hooks/data/taskv2.data";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import LoadingFull from "@/components/common/LoadingFull";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  Info,
  Users,
  User,
  Briefcase,
} from "lucide-react";
import { formatDateVN } from "@/utils/datetime.utils";
import { ToastUtils } from "@/utils/toast.utils";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

export default function DeclareDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab");

  const {
    data: taskDetail,
    isLoading,
    error,
  } = useGetDetail(id, !!id) as { data: any; isLoading: boolean; error: any };

  useEffect(() => {
    if (!id) {
      ToastUtils.error("Không tìm thấy ID công việc!");
      back();
    }
  }, [id]);

  useEffect(() => {
    if (error) {
      ToastUtils.error("Không tải được chi tiết công việc!");
      back();
    }
  }, [error]);

  const back = () => {
    router.push(`/task-v2/declare` + (tab ? `?tab=${tab}` : ""));
  };

  const getStatusText = (status: string): string => {
    const map: Record<string, string> = {
      NEW: "Mới tạo",
      ACCEPTED: "Đã duyệt",
      REJECTED: "Từ chối",
    };
    return map[status] || status;
  };

  const getStatusClass = (status: string): string => {
    const map: Record<string, string> = {
      NEW: "bg-blue-500 text-white",
      ACCEPTED: "bg-green-500 text-white",
      REJECTED: "bg-red-500 text-white",
    };
    return map[status] || "bg-gray-500 text-white";
  };

  const formatDate = (date: any): string => {
    if (!date) return "N/A";
    try {
      return formatDateVN(new Date(date));
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <LoadingFull isLoading={false} />

      <BreadcrumbNavigation
        items={[
          { label: "Quản lý công việc", href: "/task-v2/declare" },
          { label: "Khai báo công việc", href: "/task-v2/declare" },
        ]}
        currentPage="Chi tiết công việc"
        showHome={false}
      />

      {!isLoading && taskDetail && (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-5 rounded-lg  mb-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xl md:text-2xl font-semibold mb-0">
                Chi tiết công việc
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white rounded-lg border-0 overflow-hidden mb-4">
                <div className="bg-blue-600 text-white px-5 py-4 border-b-2 border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    <h5 className="mb-0 font-semibold">Thông tin công việc</h5>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                    onClick={back}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <label className="font-semibold text-gray-700 block mb-2">
                      Tên công việc:
                    </label>
                    <p className="text-gray-900">
                      {taskDetail.taskName || "N/A"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="font-semibold text-gray-700 block mb-2">
                      Mô tả:
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {taskDetail.description || "Không có mô tả"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Mức độ phức tạp:
                      </label>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {taskDetail.complexityName || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Trạng thái:
                      </label>
                      <Badge
                        variant="outline"
                        className={getStatusClass(taskDetail.status)}
                      >
                        {getStatusText(taskDetail.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Ngày giao việc:
                      </label>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        {formatDate(taskDetail.startDate)}
                      </p>
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Hạn xử lý:
                      </label>
                      <p className="text-gray-900 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-red-600" />
                        {formatDate(taskDetail.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 mb-4">
                <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <h5 className="mb-0 font-semibold">
                      Thông tin người tham gia
                    </h5>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 text-sm font-semibold mb-1.5 block">
                        Người giao:
                      </label>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        {taskDetail.assignerName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm font-semibold mb-1.5 block">
                        Người thực hiện:
                      </label>
                      <p className="text-gray-800 text-base mb-0 py-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-green-600" />
                        {taskDetail.handlerName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
