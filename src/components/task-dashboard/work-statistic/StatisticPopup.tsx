"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CircleCheck,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatisticCard from "../statistic/statisticCard";
import StatisticChartContent from "../statistic/statisticChartContent";
import {
  useGetTaskDashboardByDepartment,
  useGetTaskDashboardData,
} from "@/hooks/data/task.data";
import {
  useLoadDashboardList,
  useLoadDepartmentData,
} from "@/hooks/data/task-dashboard.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import GanttModal from "../statistic/GanttModal";

interface StatisticPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgIdSelected?: number | string | null;
  listUser?: any[];
  listPhong?: any[];
  //   orgsList?: any[];
}

interface DrillStackItem {
  level: "department" | "room" | "user";
  id: string;
  barData: any[];
}

export default function StatisticPopup({
  open,
  onOpenChange,
  orgIdSelected,
  listUser = [],
  listPhong = [],
  //   orgsList = [],
}: StatisticPopupProps) {
  const [drillLevel, setDrillLevel] = useState<"department" | "room" | "user">(
    "department"
  );
  const [drillStack, setDrillStack] = useState<DrillStackItem[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>("");
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(
    null
  );
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [customBarData, setCustomBarData] = useState<any[] | null>(null);
  const [showPopupUser, setShowPopupUser] = useState(false);
  const [selectedUserForPopup, setSelectedUserForPopup] = useState<{
    orgId: string;
    orgName: string;
  } | null>(null);

  const loadDepartmentMutation = useLoadDepartmentData();
  const loadDashboardListMutation = useLoadDashboardList();

  const normalizedOrgId = useMemo(() => {
    if (!orgIdSelected) return "";
    return String(orgIdSelected);
  }, [orgIdSelected]);

  const shouldLoad = open && !!normalizedOrgId;

  const { data: dashboardData } = useGetTaskDashboardData(
    normalizedOrgId,
    "",
    false,
    false,
    false,
    "",
    "",
    shouldLoad
  );

  const { data: barChartData } = useGetTaskDashboardByDepartment(
    normalizedOrgId,
    false,
    false,
    false,
    "",
    "",
    shouldLoad
  );

  const barData = useMemo(() => {
    if (
      drillLevel !== "department" &&
      customBarData &&
      customBarData.length > 0
    ) {
      return customBarData;
    }

    if (!barChartData || !Array.isArray(barChartData)) return [];

    return barChartData.map((item: any) => ({
      orgId: item.orgId,
      orgName: item.orgName || item.name || "N/A",
      doingBcyTask: item.doingBcyTask || 0,
      doneBcyTask: item.doneBcyTask || 0,
      outDateBcyTask: item.outDateBcyTask || 0,
      totalBcyTask:
        (item.doingBcyTask || 0) +
        (item.doneBcyTask || 0) +
        (item.outDateBcyTask || 0),
      checkUser: item.checkUser,
    }));
  }, [barChartData, customBarData, drillLevel]);

  const statisticCards = useMemo(
    () => [
      {
        title: "Tổng công việc",
        value: dashboardData?.totalBcyTask || 0,
        icon: <BriefcaseBusiness />,
        borderColor: "#4f46e5",
        iconBgColor: "#E0E7FF",
        iconColor: "#4f46e5",
      },
      {
        title: "Đã hoàn thành",
        value: dashboardData?.doneBcyTask || 0,
        icon: <CircleCheck />,
        borderColor: "#10B981",
        iconBgColor: "#D1FAE5",
        iconColor: "#10B981",
      },
      {
        title: "Đang xử lý",
        value: dashboardData?.doingBcyTask || 0,
        icon: <Clock />,
        borderColor: "#F59E0B",
        iconBgColor: "#FEF3C7",
        iconColor: "#F59E0B",
      },
      {
        title: "Quá hạn",
        value: dashboardData?.outDateBcyTask || 0,
        icon: <AlertCircle />,
        borderColor: "#EF4444",
        iconBgColor: "#FEE2E2",
        iconColor: "#EF4444",
      },
    ],
    [dashboardData]
  );

  const resetDrill = () => {
    setDrillLevel("department");
    setDrillStack([]);
    setCustomBarData(null);
    setCurrentOrgId("");
    setActiveDepartmentId(null);
    setActiveRoomId(null);
    setActiveUserId(null);
  };

  const loadBarLevel = async (
    level: "department" | "room" | "user",
    id: string
  ) => {
    if (level === "department") {
      setCustomBarData(null);
      setDrillLevel("department");
      return;
    }

    try {
      const safeId = id || "";
      const data = await loadDepartmentMutation.mutateAsync({
        orgId: safeId,
      });

      if (data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          orgId: d.orgId,
          orgName: d.orgName || d.name || "N/A",
          doingBcyTask: d.doingBcyTask || 0,
          doneBcyTask: d.doneBcyTask || 0,
          outDateBcyTask: d.outDateBcyTask || 0,
          totalBcyTask:
            (d.doingBcyTask || 0) +
            (d.doneBcyTask || 0) +
            (d.outDateBcyTask || 0),
          checkUser: d.checkUser,
        }));
        setCustomBarData(mapped);
        setDrillLevel(level);
        return;
      }

      const listData = await loadDashboardListMutation.mutateAsync({
        userIds: safeId,
      });

      if (listData) {
        const mapped = (Array.isArray(listData) ? listData : []).map(
          (u: any) => ({
            orgId: u.orgId || u.handlerId || u.id,
            orgName:
              u.name ||
              u.handlerName ||
              u.fullName ||
              u.userFullName ||
              u.userName ||
              "N/A",
            doingBcyTask: u.doingBcyTask || 0,
            doneBcyTask: u.doneBcyTask || 0,
            outDateBcyTask: u.outDateBcyTask || 0,
            totalBcyTask:
              u.count ||
              u.totalBcyTask ||
              (u.doingBcyTask || 0) +
                (u.doneBcyTask || 0) +
                (u.outDateBcyTask || 0),
            checkUser: u.checkUser,
          })
        );
        setCustomBarData(mapped);
        setDrillLevel(level);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const goBack = () => {
    if (!drillStack || drillStack.length === 0) {
      resetDrill();
      return;
    }

    const prev = drillStack[drillStack.length - 1];
    setDrillStack(drillStack.slice(0, -1));
    setDrillLevel(prev.level);
    setCustomBarData(prev.barData);
    setCurrentOrgId(prev.id);

    setActiveDepartmentId(null);
    setActiveRoomId(null);
    setActiveUserId(null);
  };

  const isBarActive = (item: any): boolean => {
    const id = String(item?.orgId || item?.handlerId || item?.id || "");
    if (!id) return false;

    if (drillLevel === "department") return activeDepartmentId === id;
    if (drillLevel === "room") return activeRoomId === id;
    return activeUserId === id;
  };

  const onBarClick = async (dept: any, index: number) => {
    if (!dept) return;

    let nextLevel: "department" | "room" | "user";
    if (drillLevel === "department") {
      nextLevel = "room";
    } else if (drillLevel === "room") {
      nextLevel = "user";
    } else {
      nextLevel = "user";
    }

    const targetId =
      dept?.orgId ||
      dept?.handlerId ||
      dept?.id ||
      dept?.org ||
      dept?.orgIdDonVi ||
      null;

    if (!targetId) {
      ToastUtils.error("Không tìm thấy id để drill xuống");
      return;
    }

    if (nextLevel === "user" || dept?.checkUser) {
      setSelectedUserForPopup({
        orgId: String(targetId),
        orgName: dept.orgName || dept.name || dept.fullName || "N/A",
      });
      setShowPopupUser(true);
      return;
    }

    setDrillStack([
      ...drillStack,
      {
        level: drillLevel,
        id: currentOrgId || "",
        barData: barData.slice(),
      },
    ]);

    setCurrentOrgId(String(targetId));

    if (drillLevel === "department") {
      setActiveDepartmentId(String(targetId));
      setActiveRoomId(null);
      setActiveUserId(null);
    } else if (drillLevel === "room") {
      setActiveRoomId(String(targetId));
      setActiveUserId(null);
    } else {
      setActiveUserId(String(targetId));
    }

    await loadBarLevel(nextLevel, String(targetId));
  };

  useEffect(() => {
    if (open) {
      resetDrill();
    }
  }, [open, orgIdSelected]);

  useEffect(() => {
    if (listUser && listUser.length > 0) {
      setDrillLevel("user");
    } else if (!listUser && listPhong && listPhong.length > 0) {
      setDrillLevel("room");
    } else {
      setDrillLevel("department");
    }
  }, [listUser, listPhong]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="2xl:max-w-[1500px] max-w-7xl">
          <div className="mt-8 flex flex-col gap-4">
            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statisticCards.map((card, index) => (
                <StatisticCard
                  key={index}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  borderColor={card.borderColor}
                  iconBgColor={card.iconBgColor}
                  iconColor={card.iconColor}
                />
              ))}
            </div> */}

            <StatisticChartContent
              barData={barData}
              dashboardData={dashboardData}
              onBarClick={onBarClick}
              isBarActive={isBarActive}
              callBack={goBack}
              showDonutChart={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      <GanttModal
        show={showPopupUser}
        selectedOrgId={selectedUserForPopup?.orgId}
        selectedUsers={selectedUserForPopup}
        onClose={() => {
          setShowPopupUser(false);
          setSelectedUserForPopup(null);
        }}
        filterParams={{
          weekCheck: false,
          monthCheck: false,
          yearCheck: false,
          fromDate: "",
          toDate: "",
        }}
      />
    </>
  );
}
