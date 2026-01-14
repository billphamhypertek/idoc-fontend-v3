"use client";

import React, { useState, useMemo } from "react";
import "./styles.css";
import ReactECharts from "echarts-for-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GanttModal from "@/components/task-dashboard/statistic/GanttModal";

interface TaskStatisticData {
  orgId: number;
  orgName: string;
  completedTaskCount: number;
  notCompletedTaskCount: number;
  outOfDateTaskCount: number;
}

interface TaskFollowStatisticByUnitProps {
  data: TaskStatisticData[];
}

interface ChartData {
  name: string;
  series: Array<{
    name: string;
    value: number;
  }>;
}

const TaskFollowStatisticByUnit: React.FC<TaskFollowStatisticByUnitProps> = ({
  data,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [ganttModalOpen, setGanttModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string | null>(null);

  const chartData: ChartData[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data].sort((a, b) => {
      const aTotal =
        a.completedTaskCount + a.notCompletedTaskCount + a.outOfDateTaskCount;
      const bTotal =
        b.completedTaskCount + b.notCompletedTaskCount + b.outOfDateTaskCount;
      const aRate = aTotal > 0 ? a.completedTaskCount / aTotal : 0;
      const bRate = bTotal > 0 ? b.completedTaskCount / bTotal : 0;
      return bRate - aRate;
    });

    return sortedData.map((item) => ({
      name: item.orgName,
      series: [
        {
          name: "Hoàn thành",
          value: item.completedTaskCount || 0,
        },
        {
          name: "Chưa hoàn thành",
          value: item.notCompletedTaskCount || 0,
        },
        {
          name: "Quá hạn",
          value: item.outOfDateTaskCount || 0,
        },
      ],
    }));
  }, [data]);

  const sampleData = useMemo(() => {
    return chartData.slice(0, 17);
  }, [chartData]);

  const colors = {
    complete: "#22c55e",
    not_complete: "#f59e0b",
    expired: "#ef4444",
  };

  // ECharts option cho horizontal bar chart (multiple series)
  const getHorizontalChartOption = (data: ChartData[]) => {
    const systemFont =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const categories = data.map((item) => item.name);
    const seriesData = [
      {
        name: "Hoàn thành",
        type: "bar",
        data: data.map((item) => item.series[0].value),
        itemStyle: {
          color: colors.complete,
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 18,
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          fontSize: 12,
          color: "#000",
          fontFamily: systemFont,
        },
      },
      {
        name: "Chưa hoàn thành",
        type: "bar",
        data: data.map((item) => item.series[1].value),
        itemStyle: {
          color: colors.not_complete,
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 18,
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          fontSize: 12,
          color: "#000",
          fontFamily: systemFont,
        },
      },
      {
        name: "Quá hạn",
        type: "bar",
        data: data.map((item) => item.series[2].value),
        barWidth: 18,
        itemStyle: {
          color: colors.expired,
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          fontSize: 12,
          color: "#000",
          fontFamily: systemFont,
        },
      },
    ];

    return {
      textStyle: {
        fontFamily: systemFont,
      },
      tooltip: {
        trigger: "item",
        textStyle: {
          fontFamily: systemFont,
        },
        formatter: function (params: any) {
          return `
            <div style="padding: 4px 0; font-size: 14px; font-weight: normal; color: #000; font-family: ${systemFont};">
              <strong>${params.name}</strong><br/>
              ${params.marker} ${params.seriesName}: ${params.value}
            </div>
          `;
        },
      },
      legend: {
        data: ["Hoàn thành", "Chưa hoàn thành", "Quá hạn"],
        bottom: 5,
        textStyle: {
          fontSize: 12,
          fontFamily: systemFont,
        },
      },
      grid: {
        left: "1%",
        right: "5%",
        bottom: "5%",
        top: "1%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "",
        nameLocation: "middle",
        nameGap: 40,
        nameTextStyle: {
          fontFamily: systemFont,
        },
        axisLabel: {
          fontFamily: systemFont,
        },
      },
      yAxis: {
        type: "category",
        data: categories,
        inverse: true,
        triggerEvent: true, // Enable click event cho yAxis
        axisLabel: {
          fontSize: 12,
          width: 130,
          overflow: "truncate",
          ellipsis: "...",
          maxLines: 1,
          minLines: 1,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "left",
          fontFamily: systemFont,
          color: "#000",
        },
      },
      series: seriesData.map((series) => ({
        ...series,
        barGap: "50%", // Tăng khoảng cách giữa các hàng (categories) trên trục y
      })),
    };
  };

  // ECharts option cho vertical bar chart (mỗi đơn vị 1 cột với 3 màu stacked) - cho popup
  const getVerticalChartOption = (data: ChartData[]) => {
    const systemFont =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const categories = data.map((item) => item.name);
    const seriesData = [
      {
        name: "Hoàn thành",
        type: "bar",
        stack: "total",
        data: data.map((item) => item.series[0].value),
        itemStyle: {
          color: colors.complete,
        },
      },
      {
        name: "Chưa hoàn thành",
        type: "bar",
        stack: "total",
        data: data.map((item) => item.series[1].value),
        itemStyle: {
          color: colors.not_complete,
        },
      },
      {
        name: "Quá hạn",
        type: "bar",
        stack: "total",
        data: data.map((item) => item.series[2].value),
        itemStyle: {
          color: colors.expired,
        },
      },
    ];

    return {
      textStyle: {
        fontFamily: systemFont,
      },
      tooltip: {
        trigger: "item",
        textStyle: {
          fontSize: 12, // 0.75rem - theo hệ thống xs
          fontFamily: systemFont,
        },
        formatter: function (params: any) {
          return `
            <div style="padding: 4px 0; font-size: 14px; font-weight: normal; color: #000; font-family: ${systemFont};">
              <strong>${params.name}</strong><br/>
              ${params.marker} ${params.seriesName}: ${params.value}
            </div>
          `;
        },
      },
      legend: {
        data: ["Hoàn thành", "Chưa hoàn thành", "Quá hạn"],
        bottom: 30,
        textStyle: {
          fontSize: 12, // 0.75rem - theo hệ thống xs
          fontFamily: systemFont,
        },
      },
      grid: {
        left: "3%",
        right: "3%",
        // bottom: 160, // thêm khoảng trống để không cắt nhãn xoay
        top: "12%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          rotate: 0,
          fontSize: 12, // 0.75rem - theo hệ thống xs
          interval: 0,
          width: 50,
          overflow: "truncate",
          ellipsis: "...",
          maxLines: 1,
          minLines: 1,
          lineHeight: 1.2,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "left",
          fontFamily: systemFont,
        },
      },
      yAxis: {
        type: "value",
        name: "Số lượng công việc",
        nameLocation: "middle",
        nameGap: 40,
        nameTextStyle: {
          fontSize: 12, // 0.75rem - theo hệ thống xs
          fontFamily: systemFont,
        },
        axisLabel: {
          fontSize: 12, // 0.75rem - theo hệ thống xs
          fontFamily: systemFont,
        },
      },
      series: seriesData.map((series) => ({
        ...series,
        barCategoryGap: "30%", // Tăng khoảng cách giữa các cột
      })),
    };
  };

  return (
    <div className="document-statistics-container">
      <div className="document-statistics-container--chart">
        <ReactECharts
          option={getHorizontalChartOption(sampleData)}
          style={{ height: "1600px", width: "100%" }}
          opts={{ renderer: "canvas" }}
          onEvents={{
            click: (params: any) => {
              let categoryName: string | undefined;

              if (params.componentType === "series") {
                categoryName = params.name;
              }
              // Xử lý click vào label trên trục Y
              else if (
                params.componentType === "yAxis" ||
                params.componentType === "yAxisLabel"
              ) {
                categoryName = params.value || params.name;
              }

              if (categoryName) {
                const selectedData = data.find(
                  (item) => item.orgName === categoryName
                );
                if (selectedData) {
                  setSelectedOrgId(selectedData.orgId);
                  setSelectedOrgName(categoryName);
                  setGanttModalOpen(true);
                }
              }
            },
          }}
        />
      </div>

      <div className="document-statistics-container--footer">
        <Button
          variant="link"
          onClick={() => setModalOpen(true)}
          className="text-black-600 hover:text-black-800 font-semibold underline italic"
        >
          Chi tiết
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[1400px]">
          <DialogHeader>
            <DialogTitle>
              Chi tiết thống kê công việc đã giao cho các đơn vị
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ReactECharts
              option={getVerticalChartOption(chartData)}
              style={{ height: "80vh", width: "1400px" }}
              opts={{ renderer: "canvas" }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <GanttModal
        show={ganttModalOpen}
        selectedOrgId={selectedOrgId}
        onClose={() => {
          setGanttModalOpen(false);
          setSelectedOrgId(null);
        }}
        filterParams={{
          weekCheck: false,
          monthCheck: false,
          yearCheck: false,
          fromDate: "",
          toDate: "",
        }}
        selectedUsers={null}
        isStatisticDetail={true}
        taskName={selectedOrgName ? selectedOrgName : ""}
      />
    </div>
  );
};

export default TaskFollowStatisticByUnit;
