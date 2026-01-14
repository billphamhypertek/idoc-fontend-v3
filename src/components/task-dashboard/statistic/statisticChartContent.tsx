"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, CircleArrowLeft, Clock } from "lucide-react";
import { useMemo } from "react";

interface BarDataItem {
  orgId?: string;
  orgName: string;
  doingBcyTask: number;
  doneBcyTask: number;
  outDateBcyTask: number;
  totalBcyTask: number;
}

interface ChartProps {
  barData?: BarDataItem[];
  dashboardData?: {
    totalBcyTask: number;
    doingBcyTask: number;
    doneBcyTask: number;
    outDateBcyTask: number;
  };
  onBarClick?: (dept: BarDataItem, index: number) => void;
  isBarActive?: (item: BarDataItem) => boolean;
  callBack?: () => void;
  showBarChart?: boolean;
  showDonutChart?: boolean;
}

const STAT_ITEMS = [
  {
    key: "doingBcyTask" as const,
    label: "Đang xử lý",
    percentType: "doing" as const,
  },
  {
    key: "doneBcyTask" as const,
    label: "Hoàn thành",
    percentType: "done" as const,
  },
  {
    key: "outDateBcyTask" as const,
    label: "Quá hạn",
    percentType: "late" as const,
  },
] as const;

export default function StatisticChartContent({
  barData = [],
  dashboardData,
  onBarClick,
  isBarActive,
  callBack,
  showBarChart = true,
  showDonutChart = true,
}: ChartProps) {
  // Calculate Y-axis ticks
  const { yTicks, maxTotal } = useMemo(() => {
    const rawMax =
      barData.length > 0
        ? Math.max(...barData.map((d) => d.totalBcyTask || 0))
        : 0;

    if (rawMax === 0) return { yTicks: [0], maxTotal: 0 };

    const numTicks = 6;
    const bufferMax = Math.ceil(rawMax * 1.15);
    const step = Math.ceil(bufferMax / numTicks);
    let roundedMax = step * numTicks;

    // Đảm bảo roundedMax lớn hơn rawMax
    if (roundedMax <= rawMax) {
      roundedMax += step;
    }

    const ticks: number[] = [];
    // Tạo các tick từ max xuống 0 (từ 0 đến numTicks, tức là 7 ticks)
    for (let i = 0; i <= numTicks; i++) {
      ticks.push(roundedMax - i * step);
    }

    // Đảm bảo có tick 0 ở cuối
    if (ticks[ticks.length - 1] !== 0) {
      ticks[ticks.length - 1] = 0;
    }

    // maxTotal phải là roundedMax để tính chiều cao bar đúng
    return { yTicks: ticks, maxTotal: roundedMax };
  }, [barData]);

  // Calculate bar dimensions (giống getter trong Angular)
  const barColumnWidthPx = useMemo(() => {
    const min = 16;
    const max = 35;
    const n = barData.length || 1;
    if (n > 50) return `${min}px`;
    if (n < 12) return `${max}px`;
    return `${Math.max(min, max - Math.round((n - 10) * 1.1))}px`;
  }, [barData]);

  const barGapPx = useMemo(() => {
    const n = barData.length || 1;
    if (n > 36) return "3px";
    if (n > 20) return "5px";
    return "9px";
  }, [barData]);

  const barLabelFontSizePx = useMemo(() => {
    const n = barData.length || 1;
    if (n > 45) return "9px";
    if (n > 34) return "10px";
    if (n > 16) return "11px";
    return "12px";
  }, [barData]);

  const getBarHeightPercent = (value: number): number => {
    if (!maxTotal || maxTotal === 0) return 0;
    return (value / maxTotal) * 100;
  };

  // Calculate donut percentages
  const getDonutGradient = useMemo(() => {
    if (!dashboardData) {
      return "conic-gradient(#e5e7eb 0 100%)";
    }

    const {
      doingBcyTask = 0,
      doneBcyTask = 0,
      outDateBcyTask = 0,
    } = dashboardData;
    const total = doingBcyTask + doneBcyTask + outDateBcyTask;

    if (total === 0) {
      return "conic-gradient(#e5e7eb 0 100%)";
    }

    const doingPercent = (doingBcyTask / total) * 100;
    const donePercent = (doneBcyTask / total) * 100;

    const doingEnd = doingPercent;
    const doneEnd = doingEnd + donePercent;

    return `conic-gradient(#F59E0B 0% ${doingEnd}%, #10B981 ${doingEnd}% ${doneEnd}%, #EF4444 ${doneEnd}% 100%)`;
  }, [dashboardData]);

  const getPercent = (type: "doing" | "done" | "late"): string => {
    if (!dashboardData) return "0";

    const {
      doingBcyTask = 0,
      doneBcyTask = 0,
      outDateBcyTask = 0,
    } = dashboardData;
    const total = doingBcyTask + doneBcyTask + outDateBcyTask;

    if (total === 0) return "0";

    let value = 0;
    if (type === "doing") value = doingBcyTask;
    else if (type === "done") value = doneBcyTask;
    else value = outDateBcyTask;

    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {showBarChart && (
        <div className={`col-span-${showDonutChart ? 7 : 12}`}>
          <div className="bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-gray-100 h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-100">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold">
                  Khối lượng công việc theo phòng ban
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {callBack && (
                  <div
                    onClick={() => callBack?.()}
                    className="w-fit bg-transparent border-none hover:bg-transparent outline-none shadow-none cursor-pointer"
                  >
                    <CircleArrowLeft className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                  <span>Đang xử lý</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                  <span>Hoàn thành</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                  <span>Quá hạn</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col overflow-x-auto overflow-y-hidden">
                <div className="flex items-end">
                  <div className="flex flex-col justify-between text-xs text-gray-500 min-w-[40px] pr-4 h-[300px]">
                    {yTicks.map((tick, index) => (
                      <div
                        key={index}
                        className="text-right relative flex items-end justify-end"
                        style={{ flex: 1 }}
                      >
                        <span style={{ transform: "translateY(30%)" }}>
                          {tick}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex-1 flex items-end justify-around border-l-2 border-b-2 border-gray-300 h-[250px] relative"
                    style={{
                      gap: barGapPx,
                      padding: "0",
                      background: `repeating-linear-gradient(to top, transparent, transparent calc(100% / 6 - 1px), #f3f4f6 calc(100% / 6 - 1px), #f3f4f6 calc(100% / 6))`,
                    }}
                  >
                    {barData.map((dept, index) => {
                      const isActive = isBarActive?.(dept) || false;
                      return (
                        <div
                          key={index}
                          className={`flex flex-col justify-end items-center cursor-pointer h-full transition-all duration-300`}
                          style={{
                            minWidth: barColumnWidthPx,
                            maxWidth: barColumnWidthPx,
                          }}
                          title={`Xem chi tiết: ${dept.orgName}`}
                          onClick={() => onBarClick?.(dept, index)}
                        >
                          <div className="w-full flex flex-col justify-end items-center h-full">
                            {dept.doingBcyTask > 0 && (
                              <div
                                className={`w-full bg-[#F59E0B] transition-all duration-300 ${
                                  isActive ? "brightness-110" : ""
                                }`}
                                style={{
                                  height: `${getBarHeightPercent(dept.doingBcyTask)}%`,
                                }}
                              ></div>
                            )}
                            {dept.doneBcyTask > 0 && (
                              <div
                                className={`w-full bg-[#10B981] transition-all duration-300 ${
                                  isActive ? "brightness-110" : ""
                                }`}
                                style={{
                                  height: `${getBarHeightPercent(dept.doneBcyTask)}%`,
                                }}
                              ></div>
                            )}
                            {dept.outDateBcyTask > 0 && (
                              <div
                                className={`w-full bg-[#EF4444] transition-all duration-300 ${
                                  isActive ? "brightness-110" : ""
                                }`}
                                style={{
                                  height: `${getBarHeightPercent(dept.outDateBcyTask)}%`,
                                }}
                              ></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex pl-[40px] mt-2">
                  <div
                    className="flex-1 flex justify-around"
                    style={{ gap: barGapPx, padding: "0" }}
                  >
                    {barData.map((dept, index) => (
                      <div
                        key={index}
                        className="flex justify-center items-start h-20"
                        style={{
                          minWidth: barColumnWidthPx,
                          maxWidth: barColumnWidthPx,
                        }}
                      >
                        <div
                          className="text-center text-gray-600 overflow-hidden max-w-[100px] break-words line-clamp-3 leading-[1.35] -rotate-12 origin-top"
                          style={{
                            fontSize: barLabelFontSizePx,
                          }}
                          title={dept.orgName}
                        >
                          {dept.orgName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDonutChart && (
        <div className={`col-span-${showBarChart ? 5 : 0}`}>
          <div className="bg-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-gray-100 h-full">
            <div className="flex items-center gap-2 p-4 border-b">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-100">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold">Phân bố trạng thái</span>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div
                className="rounded-full mb-4 relative"
                style={{
                  width: "220px",
                  height: "220px",
                  background: getDonutGradient,
                }}
              >
                <div
                  className="absolute rounded-full bg-white"
                  style={{
                    inset: "20%",
                  }}
                ></div>
              </div>

              <div className="flex items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                  <span>Đang xử lý</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                  <span>Hoàn thành</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                  <span>Quá hạn</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full text-center">
                {STAT_ITEMS.map((item) => (
                  <div key={item.key}>
                    <div className="text-xl font-bold text-gray-900">
                      {dashboardData?.[item.key] || 0}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getPercent(item.percentType)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
