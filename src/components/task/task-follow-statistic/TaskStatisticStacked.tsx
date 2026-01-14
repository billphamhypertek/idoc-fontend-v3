"use client";

import React, { useMemo } from "react";
import "./styles.css";
import ReactECharts from "echarts-for-react";

interface TaskStatisticData {
  orgId: number;
  orgName: string;
  completedTaskCount: number;
  notCompletedTaskCount: number;
  outOfDateTaskCount: number;
}

interface TaskStatisticStackedProps {
  taskStatistic: TaskStatisticData[];
}

interface ChartData {
  name: string;
  complete: number;
  not_complete: number;
  expired: number;
}

const TaskStatisticStacked: React.FC<TaskStatisticStackedProps> = ({
  taskStatistic,
}) => {
  const percentage = (partialValue: number, totalValue: number): number => {
    return (100 * partialValue) / totalValue;
  };

  const chartData: ChartData[] = useMemo(() => {
    if (!taskStatistic || taskStatistic.length === 0) return [];

    const sortedData = [...taskStatistic].sort((a, b) => {
      const aTotal =
        a.completedTaskCount + a.notCompletedTaskCount + a.outOfDateTaskCount;
      const bTotal =
        b.completedTaskCount + b.notCompletedTaskCount + b.outOfDateTaskCount;
      const aRate = aTotal > 0 ? percentage(a.completedTaskCount, aTotal) : 0;
      const bRate = bTotal > 0 ? percentage(b.completedTaskCount, bTotal) : 0;
      return bRate - aRate;
    });

    return sortedData.map((item) => ({
      name: item.orgName,
      complete: item.completedTaskCount || 0,
      not_complete: item.notCompletedTaskCount || 0,
      expired: item.outOfDateTaskCount || 0,
    }));
  }, [taskStatistic]);

  const colors = {
    expired: "#ef4444",
    not_complete: "#f59e0b",
    complete: "#22c55e",
  };

  // ECharts option cho bar-stack-normalization
  const getChartOption = (data: ChartData[]) => {
    const systemFont =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
          const percentage = params.value || 0;
          return `
            <div style="padding: 4px 0; font-size: 14px; font-weight: normal; color: #000; font-family: ${systemFont};">
              <strong>${params.name}</strong><br/>
              ${params.marker} ${params.seriesName}: ${percentage.toFixed(2)}%
            </div>
          `;
        },
      },
      legend: {
        data: ["Quá hạn", "Chưa hoàn thành", "Đã hoàn thành"],
        bottom: 30,
        textStyle: {
          fontSize: 12,
          fontFamily: systemFont,
        },
      },
      grid: {
        left: "5%",
        right: "5%",
        bottom: "18%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        name: "Đơn vị",
        nameLocation: "middle",
        nameGap: 150,
        nameTextStyle: {
          fontSize: 16,
          fontWeight: "semibold",
          color: "#000",
          fontFamily: systemFont,
        },
        data: data.map((item) => item.name),
        axisLabel: {
          rotate: 90,
          width: 120,
          overflow: "truncate",
          ellipsis: "...",
          maxLines: 1,
          minLines: 1,
          lineHeight: 1.2,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "left",
          fontFamily: systemFont,
          color: "#000",
        },
      },
      yAxis: {
        type: "value",
        name: "Phần trăm (%)",
        nameLocation: "middle",
        nameGap: 60,
        max: 100,
        axisLabel: {
          formatter: "{value}%",
        },
        nameTextStyle: {
          fontSize: 16,
          fontFamily: systemFont,
          color: "#000",
        },
      },
      series: [
        {
          name: "Quá hạn",
          type: "bar",
          stack: "total",
          data: data.map((item) => {
            const total = item.complete + item.not_complete + item.expired;
            const percent = total > 0 ? percentage(item.expired, total) : 0;
            return Math.round(percent * 100) / 100; // Làm tròn đến 2 chữ số thập phân
          }),
          itemStyle: {
            color: colors.expired,
          },
        },
        {
          name: "Chưa hoàn thành",
          type: "bar",
          stack: "total",
          data: data.map((item) => {
            const total = item.complete + item.not_complete + item.expired;
            const percent =
              total > 0 ? percentage(item.not_complete, total) : 0;
            return Math.round(percent * 100) / 100; // Làm tròn đến 2 chữ số thập phân
          }),
          itemStyle: {
            color: colors.not_complete,
          },
        },
        {
          name: "Đã hoàn thành",
          type: "bar",
          stack: "total",
          data: data.map((item) => {
            const total = item.complete + item.not_complete + item.expired;
            const percent = total > 0 ? percentage(item.complete, total) : 0;
            return Math.round(percent * 100) / 100; // Làm tròn đến 2 chữ số thập phân
          }),
          itemStyle: {
            color: colors.complete,
          },
        },
      ],
    };
  };

  return (
    <div className="task-statistic-stacked-container">
      <div className="task-statistic-stacked-container--chart">
        <ReactECharts
          option={getChartOption(chartData)}
          style={{ height: "750px", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
    </div>
  );
};

export default TaskStatisticStacked;
