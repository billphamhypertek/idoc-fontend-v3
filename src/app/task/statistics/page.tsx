"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGetAllTaskStatistic } from "@/hooks/data/task.data";
import TaskFollowStatisticByUnit from "@/components/task/task-follow-statistic/TaskFollowStatisticByUnit";
import IncomingTaskFollowStatisticByUnit from "@/components/task/task-follow-statistic/IncomingTaskFollowStatisticByUnit";
import TaskStatisticStacked from "@/components/task/task-follow-statistic/TaskStatisticStacked";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Button } from "@/components/ui/button";
import { ChartBar, ChartColumnIncreasing, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskStatisticData {
  orgId: number;
  orgName: string;
  completedTaskCount: number;
  notCompletedTaskCount: number;
  outOfDateTaskCount: number;
}

const EXCLUDED_ORG_IDS: number[] = [451];
export default function TaskFollowStatistic() {
  const [weekNumber, setWeekNumber] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [chartType, setChartType] = useState<string>("horizontal");

  useEffect(() => {
    const today: Date = new Date();
    setCurrentYear(today.getFullYear());
    const weekNum = Math.ceil(
      ((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) /
        86400000 +
        1) /
        7
    );
    setWeekNumber(weekNum);
  }, []);

  const {
    data: rawData,
    isLoading,
    error,
  } = useGetAllTaskStatistic("", "", "", true);

  const dataOfUnits: TaskStatisticData[] = useMemo(() => {
    if (!rawData) return [];

    return rawData.filter(
      (item: TaskStatisticData) => !EXCLUDED_ORG_IDS.includes(item.orgId)
    );
  }, [rawData]);

  return (
    <div className="px-4">
      <BreadcrumbNavigation
        currentPage="Quản lý công việc"
        showHome={false}
        className="ml-3"
        items={[
          {
            href: "",
            label: "Thống kê công việc",
          },
        ]}
      />
      <div className="container-fluid mt-3 max-w-[1400px] mx-auto">
        <div className="row">
          <div className="col-md-12 bg-white border rounded-lg px-6 py-4 shadow-sm mb-3">
            <h2 className="text-[22px] font-bold text-black">
              Thống kê công việc đã giao cho các đơn vị
            </h2>
            <p className="mb-4 text-[15px] text-gray-500">
              Thời điểm thống kê tuần {weekNumber} năm {currentYear}
            </p>
          </div>

          <div className="p-3 mb-3 bg-gray-100 rounded-lg">
            <div className="flex items-center">
              <span className="m-3 font-semibold">Chọn loại biểu đồ:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setChartType("horizontal")}
                  className={cn(
                    chartType === "horizontal" &&
                      "bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                  )}
                >
                  <ChartBar className="w-4 h-4 mr-1" />
                  Biểu đồ ngang
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setChartType("stacked")}
                  className={cn(
                    chartType === "stacked" &&
                      "bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                  )}
                >
                  Biểu đồ cột chồng
                </Button>
              </div>
            </div>
          </div>

          {chartType === "horizontal" && (
            <div className="col-12 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Tình hình thực hiện công việc đã giao cho các đơn vị
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskFollowStatisticByUnit data={dataOfUnits} />
                </CardContent>
              </Card>
            </div>
          )}
          {chartType === "stacked" && (
            <div className="row">
              <div className="col-12 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Clock className="w-6 h-6 mr-1" /> Tình hình thực hiện
                      công việc
                    </CardTitle>
                    <CardDescription>
                      Phần trăm (%) theo trạng thái
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TaskStatisticStacked taskStatistic={dataOfUnits} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="col-12 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChartColumnIncreasing className="w-4 h-4 mr-1 text-blue-500" />{" "}
                  Bảng thống kê chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncomingTaskFollowStatisticByUnit dataOfUnits={dataOfUnits} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
