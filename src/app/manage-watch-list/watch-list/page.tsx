"use client";

import { Button } from "@/components/ui/button";
import SelectCustom from "@/components/common/SelectCustom";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { addWeeks, format, getWeek, subWeeks } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  formatDateVN,
  getWeekOfYear,
  getWeekDates,
} from "@/utils/datetime.utils";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import OfficialPage from "../../../components/watch-list/OfficialPage";
import WaitApprovePage from "../../../components/watch-list/WaitApprovePage";
import RegisterPage from "../../../components/watch-list/RegisterPage";
import HistoryWatchListModal from "./modal/HistoryWatchListModal";
import RejectWatchListModal from "./modal/RejectWatchListModal";
import { checkAuthorityBtn } from "@/utils/authority.utils";
import {
  UserAction,
  WatchListSearch,
} from "@/definitions/types/watch-list.type";
import { Label } from "@/components/ui/label";
import {
  useCheckStatusWatchList,
  useGetListOrgWaitFinish,
  useGetWatchListByOrg,
} from "@/hooks/data/watch-list.data";
import { WatchListParams } from "@/definitions/types/watch-list.type";
import { useFindByOrgCVV } from "@/hooks/data/vehicle.data";
import { useApproveWatchList } from "@/hooks/data/watch-list.action";
import { toast } from "@/hooks/use-toast";
import { doFindActionStr, handleError } from "@/utils/common.utils";
import { saveAs } from "file-saver";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { WatchListService } from "@/services/watch-list.service";
import { ToastUtils } from "@/utils/toast.utils";
import LoadingFull from "@/components/common/LoadingFull";

export default function WatchListPage() {
  const today = new Date();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ===== UI STATE =====
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("official");

  const [selectedUnitRegister, setSelectedUnitRegister] = useState<string>("");
  const [selectedUnitWaitApprove, setSelectedUnitWaitApprove] =
    useState<string>("all");
  const [selectedUnitOfficial, setSelectedUnitOfficial] =
    useState<string>("all");

  const selectedUnit =
    selectedTab === "register"
      ? selectedUnitRegister
      : selectedTab === "waitApprove"
        ? selectedUnitWaitApprove
        : selectedUnitOfficial;

  const setSelectedUnit = (value: string) => {
    switch (selectedTab) {
      case "register":
        setSelectedUnitRegister(value);
        break;
      case "waitApprove":
        setSelectedUnitWaitApprove(value);
        break;
      case "official":
        setSelectedUnitOfficial(value);
        break;
      default:
        break;
    }
  };

  const [currentWeek, setCurrentWeek] = useState(
    getWeek(new Date(), { weekStartsOn: 1, firstWeekContainsDate: 4 })
  );
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // ===== USER & PERMISSION STATE =====
  const [userAction, setUserAction] = useState<UserAction>({
    canDelete: false,
    canUpdate: false,
    canAdd: false,
    approveInUnit: false,
    approveInBan: false,
    createInBan: false,
  });
  const [orgPermission, setOrgPermission] = useState<number[]>([]);

  const orgPermissionLocal = useMemo(() => {
    return orgPermission.map((id) => id.toString());
  }, [orgPermission]);

  // ===== ORGANIZATION STATE =====
  const [orgSelected, setOrgSelected] = useState<{
    id: number | null;
    name: string | null;
    parentId: number | null;
  }>({
    id: null,
    name: null,
    parentId: null,
  });
  const [orgName, setOrgName] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");

  // ===== WATCH LIST STATE =====
  const [watchListSearch, setWatchListSearch] = useState<WatchListSearch>({
    orgId: null,
    date: null,
    name: null,
    departmentId: null,
    position: null,
    role: null,
    phone: null,
    note: null,
  });

  const [isCreateTrucChiHuy, setIsCreateTrucChiHuy] = useState<boolean>(false);
  const [isTrucChiHuy, setIsTrucChiHuy] = useState<boolean>(false);
  const [changeHistory, setChangeHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // ===== API LOADING STATE =====
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [statusAdd, setStatusAdd] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ===== REJECT MODAL STATE =====
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectOrgId, setRejectOrgId] = useState<number>(0);
  const [isReturnToUnit, setIsReturnToUnit] = useState(false);

  const { mutateAsync: approveWatchListUnit } = useApproveWatchList();

  const userInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    const userInfoStr = localStorage.getItem("userInfo");
    return userInfoStr ? JSON.parse(userInfoStr) : {};
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.authoritys) {
      const { userAction: action, orgPermission: permission } =
        checkAuthorityBtn(userInfo.authoritys, userInfo);

      setWatchListSearch((prev) => ({ ...prev, departmentId: userInfo.org }));
      setOrgName(userInfo.orgModel.name);

      if (
        userInfo.org === 2 &&
        userInfo.orgModel.orgTypeModel.name.toLowerCase().includes("ban")
      ) {
        setWatchListSearch((prev) => ({
          ...prev,
          orgId: userInfo.org,
          departmentId: userInfo.org,
          role: "1",
        }));
        setOrgSelected({
          id: userInfo.org,
          name: userInfo.orgModel.name,
          parentId: userInfo.org,
        });
        setDepartmentName(
          userInfo.orgModel.name.toLowerCase() === "ban cơ yếu chính phủ"
            ? "Lãnh đạo ban"
            : "Lãnh đạo đơn vị"
        );
        setIsCreateTrucChiHuy(true);
        setIsTrucChiHuy(true);
      } else if (
        userInfo.orgModel.parentId === 2 &&
        userInfo.orgModel.orgTypeModel.name.toLowerCase() === "cục vụ viện"
      ) {
        setWatchListSearch((prev) => ({
          ...prev,
          orgId: userInfo.org,
          departmentId: userInfo.org,
          role: "2",
        }));
        setOrgSelected({
          id: userInfo.org,
          name: userInfo.orgModel.name,
          parentId: userInfo.org,
        });
        setDepartmentName(
          userInfo.orgModel.name.toLowerCase() === "ban cơ yếu chính phủ"
            ? "Lãnh đạo ban"
            : "Lãnh đạo đơn vị"
        );
        setIsCreateTrucChiHuy(true);
        setIsTrucChiHuy(true);
      } else {
        setWatchListSearch((prev) => ({
          ...prev,
          orgId: userInfo.orgModel.parentId,
          departmentId: userInfo.org,
          role: "3",
        }));
        setOrgSelected({
          id: userInfo.org,
          name: userInfo.orgModel.name,
          parentId: userInfo.orgModel.parentId,
        });
        setDepartmentName(userInfo.orgModel.name);
      }

      setUserAction(action);
      setOrgPermission(permission);
    }
  }, [userInfo]);

  const { data: listCVV } = useFindByOrgCVV();

  const filterListCVV = useMemo(
    () =>
      listCVV?.filter(
        (item) =>
          item.name.toLocaleLowerCase() !==
          "cơ quan và đơn vị ngoài ban cơ yếu chính phủ"
      ),
    [listCVV]
  );

  const roleOptions = useMemo(
    () => [
      { label: "Trực chỉ huy & Trực nghiệp vụ", value: "false" },
      { label: "Trực chỉ huy", value: "true" },
    ],
    []
  );

  const unitOptionsForRegister = useMemo(
    () =>
      filterListCVV
        ?.filter(
          (unit) =>
            unit.id === userInfo.orgModel?.parentId ||
            unit.name.toLocaleLowerCase() === "ban cơ yếu chính phủ"
        )
        .map((unit) => ({
          label: unit.name,
          value: unit.id.toString(),
        })) || [],
    [filterListCVV, userInfo]
  );

  const { startDate, endDate } = getWeekDates(currentWeek, selectedDate);

  const { data: listOrgWaitFinish } = useGetListOrgWaitFinish(
    format(startDate, "dd/MM/yyyy"),
    format(endDate, "dd/MM/yyyy")
  );

  const unitOptionsForWaitApprove = useMemo(
    () => [
      { label: "--Xem danh sách--", value: "all" },
      ...(listOrgWaitFinish?.map((unit: any) => ({
        label: unit.name,
        value: unit.id,
      })) || []),
    ],
    [listOrgWaitFinish]
  );

  const unitOptionsForOfficial = useMemo(
    () => [
      { label: "Tất cả đơn vị", value: "all" },
      ...(filterListCVV?.map((unit) => ({
        label: unit.name,
        value: unit.id.toString(),
      })) || []),
    ],
    [filterListCVV]
  );

  // ===== HANDLE TAB INITIALIZATION FROM URL =====
  useEffect(() => {
    const tabFromUrl = searchParams?.get("tab");
    const validTabs = ["official", "waitApprove", "register"];

    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      if (tabFromUrl === "waitApprove" && !userAction.approveInBan) {
        router.replace("?tab=official");
        setSelectedTab("official");
      } else {
        setSelectedTab(tabFromUrl);
      }
    } else if (!tabFromUrl) {
      router.replace("?tab=official");
      setSelectedTab("official");
    }

    setIsInitialized(true);
  }, [searchParams, userAction.approveInBan, router]);

  useEffect(() => {
    if (!isInitialized || !filterListCVV || filterListCVV.length === 0) return;

    if (selectedTab === "official") {
      if (!selectedRole) setSelectedRole("false");
      if (!selectedUnitOfficial) setSelectedUnitOfficial("all");
    } else if (selectedTab === "register") {
      const parentIdUnit = unitOptionsForRegister.find(
        (unit) => unit.value === userInfo.orgModel?.parentId?.toString()
      );
      const defaultUnitValue =
        parentIdUnit?.value || unitOptionsForRegister[0]?.value;

      if (defaultUnitValue) {
        setSelectedUnitRegister(defaultUnitValue);

        const selectedOrg = filterListCVV?.find(
          (unit) => unit.id.toString() === defaultUnitValue
        );
        if (selectedOrg) {
          setOrgSelected({
            id: selectedOrg.id,
            name: selectedOrg.name,
            parentId: selectedOrg.parentId,
          });

          // setWatchListSearch((prev) => ({
          //   ...prev,
          //   orgId: selectedOrg.id,
          // }));
        }
      }
    } else if (selectedTab === "waitApprove") {
      setSelectedUnitWaitApprove("all");
    }
  }, [
    selectedTab,
    isInitialized,
    filterListCVV,
    unitOptionsForRegister,
    selectedRole,
    userInfo,
  ]);

  // ===== GET WATCH LIST DATA =====
  const getStatuses = (tab: string): string => {
    switch (tab) {
      case "official":
        return "FINISHED";
      case "waitApprove":
        return "ACCEPTED,FINISHED";
      case "register":
        return "NEW,ACCEPTED,FINISHED";
      default:
        return "FINISHED";
    }
  };

  const watchListParams: WatchListParams = useMemo(
    () => ({
      orgId:
        selectedTab === "register"
          ? watchListSearch.orgId
          : selectedUnit && selectedUnit !== "all"
            ? parseInt(selectedUnit)
            : null,
      fromDate: format(startDate, "dd/MM/yyyy"),
      toDate: format(endDate, "dd/MM/yyyy"),
      statuses: getStatuses(selectedTab),
      leader: selectedRole === "true",
    }),
    [
      selectedTab,
      watchListSearch.orgId,
      selectedUnitRegister,
      selectedUnitWaitApprove,
      selectedUnitOfficial,
      startDate,
      endDate,
      selectedRole,
    ]
  );

  const {
    data: watchListData,
    isLoading,
    refetch,
  } = useGetWatchListByOrg(watchListParams);

  const orgIdForStatusCheck =
    selectedTab === "register" && orgSelected.id
      ? orgSelected.id
      : (orgSelected.parentId ?? 0);

  const { data: checkStatusWatchList } = useCheckStatusWatchList(
    orgIdForStatusCheck,
    format(startDate, "dd/MM/yyyy"),
    format(endDate, "dd/MM/yyyy"),
    "ACCEPTED, FINISHED",
    true,
    orgIdForStatusCheck !== 0
  );

  useEffect(() => {
    if (checkStatusWatchList !== undefined) {
      setStatusAdd(checkStatusWatchList);
    }
  }, [checkStatusWatchList]);

  // ===== HANDLERS =====
  const handleUnitChange = (value: string | string[]) => {
    const unitValue = Array.isArray(value) ? value[0] : value;
    setSelectedUnit(unitValue);

    if (selectedTab === "register" && unitValue) {
      const selectedOrg = filterListCVV?.find(
        (unit) => unit.id.toString() === unitValue
      );

      if (selectedOrg) {
        setOrgSelected({
          id: selectedOrg.id,
          name: selectedOrg.name,
          parentId: selectedOrg.parentId,
        });

        setWatchListSearch((prev) => ({
          ...prev,
          orgId: selectedOrg.id,
        }));
      }
    } else if (
      (selectedTab === "waitApprove" || selectedTab === "official") &&
      unitValue
    ) {
      if (unitValue === "all" || unitValue === "") {
        setOrgSelected({
          id: null,
          name: null,
          parentId: null,
        });
      } else {
        const orgList =
          selectedTab === "waitApprove" ? listOrgWaitFinish : filterListCVV;
        const selectedOrg = orgList?.find(
          (unit: any) =>
            unit.id.toString() === unitValue || unit.id === parseInt(unitValue)
        );

        if (selectedOrg) {
          setOrgSelected({
            id: selectedOrg.id,
            name: selectedOrg.name,
            parentId: selectedOrg.parentId,
          });
        }
      }
    }
  };

  const handleRoleChange = (value: string | string[]) => {
    const roleValue = Array.isArray(value) ? value[0] : value;
    setSelectedRole(roleValue);
  };

  const handlePreviousWeek = () => {
    const newDate = subWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    setCurrentWeek(getWeekOfYear(newDate));
    setCurrentYear(newDate.getFullYear());
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    setCurrentWeek(getWeekOfYear(newDate));
    setCurrentYear(newDate.getFullYear());
  };

  const handleTabChange = (tab: string) => {
    if (
      tab === "waitApprove" &&
      !userAction.approveInBan &&
      !userAction.approveInUnit
    ) {
      return;
    }

    setSelectedTab(tab);
    router.push(`?tab=${tab}`, { scroll: false });
  };

  const doAcceptWatchListUnit = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    setIsApproving(true);

    const formData = new FormData();
    formData.append("fromDate", format(startDate, "dd/MM/yyyy"));
    formData.append("toDate", format(endDate, "dd/MM/yyyy"));
    formData.append(
      "orgId",
      orgSelected.id?.toString() || orgSelected.parentId?.toString() || ""
    );

    try {
      const response = await approveWatchListUnit(formData);
      if (response) {
        ToastUtils.success("Duyệt lịch trực của đơn vị thành công");
        refetch();
      } else {
        ToastUtils.error("Lỗi duyệt lịch đơn vị");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsApproving(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const doExportPdf = async () => {
    try {
      const response = await WatchListService.exportPdf(
        "",
        format(startDate, "dd/MM/yyyy"),
        format(endDate, "dd/MM/yyyy"),
        isTrucChiHuy
      );

      if (response) {
        const blob = new Blob([response], {
          type: "application/pdf",
        });
        saveAs(
          blob,
          `DS_TRUC_BCY_TU_${format(startDate, "dd/MM/yyyy")}_DEN_${format(endDate, "dd/MM/yyyy")}.pdf`
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  const doExportExcel = async () => {
    try {
      const response = await WatchListService.exportExcel(
        "",
        format(startDate, "dd/MM/yyyy"),
        format(endDate, "dd/MM/yyyy"),
        isTrucChiHuy
      );

      if (response) {
        const blob = new Blob([response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(
          blob,
          `DS_TRUC_BCY_TU_${format(startDate, "dd/MM/yyyy")}_DEN_${format(endDate, "dd/MM/yyyy")}.xlsx`
        );
      }
    } catch (error) {
      handleError(error);
    }
  };

  const doOpenRejectWatchList = (orgId: string, tab: string) => {
    setRejectOrgId(Number(orgId));
    setIsReturnToUnit(tab === "official");
    setIsRejectModalOpen(true);
  };

  const doOpenModalChangeHistory = (item: any) => {
    let convertHistory = [];
    if (item && item.history && item.history.length > 0) {
      convertHistory = item.history.map((historyItem: any) => ({
        ...historyItem,
        actionStr: doFindActionStr(historyItem.action),
        orgName: item.orgName,
      }));
    }
    setChangeHistory(convertHistory);
    setIsHistoryModalOpen(true);
  };

  const isAllValuesNull = (obj: any): boolean => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return false;
    }
    return Object.values(obj).every((value) => value === null);
  };

  const isCanFinishAndReject = (id: number): boolean => {
    const orgItem = watchListData?.find(
      (item) => String(item.orgId) === String(id)
    );
    if (
      orgItem &&
      orgItem.workSchedules &&
      orgItem.workSchedules.length > 0 &&
      orgItem.workSchedules[0].status === null
    ) {
      setStatusAdd(false);
      return false;
    }
    if (
      orgItem &&
      orgItem.workSchedules &&
      orgItem.workSchedules.length > 0 &&
      orgItem.workSchedules[0].status === "FINISHED"
    ) {
      setStatusAdd(true);
      return false;
    }
    setStatusAdd(false);
    return true;
  };

  const isCanRejectFromComplete = (id: number): boolean => {
    const orgItem = watchListData?.find(
      (item) => String(item.orgId) === String(id)
    );
    if (
      orgItem &&
      orgItem.workSchedules &&
      orgItem.workSchedules.length > 0 &&
      orgItem.workSchedules[0].status === null
    ) {
      return false;
    }
    if (
      orgItem &&
      orgItem.workSchedules &&
      orgItem.workSchedules.length > 0 &&
      orgItem.workSchedules[0].status === "FINISHED"
    ) {
      return true;
    }
    return true;
  };

  const approveOrgName = orgSelected?.id
    ? filterListCVV?.find((u) => u.id === orgSelected.id)?.name ||
      orgSelected?.name ||
      "của đơn vị"
    : "của đơn vị";

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="space-y-5 p-4">
      <div className="flex justify-between mb-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Lịch trực nghiệp vụ",
            },
          ]}
          currentPage="Lịch trực nghiệp vụ"
          showHome={false}
        />
        <div className="flex gap-2">
          {selectedTab === "official" && (
            <>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={doExportPdf}
              >
                <FileText /> Xuất lịch trực PDF
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={doExportExcel}
              >
                <FileText /> Xuất lịch trực Excel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-4 items-center">
          {selectedTab === "register" &&
            userAction.approveInUnit &&
            !statusAdd &&
            orgSelected.id !== 2 && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-600 w-[260px]"
                onClick={doAcceptWatchListUnit}
              >
                <CalendarCheck />
                Duyệt lịch trực đơn vị
              </Button>
            )}
          {selectedTab === "register" &&
            orgSelected.id === 2 &&
            userAction.approveInBan &&
            !statusAdd && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-600 w-[260px]"
                onClick={doAcceptWatchListUnit}
              >
                <CalendarCheck />
                Duyệt đăng ký trực Ban cơ yếu
              </Button>
            )}
          {selectedTab === "register" && userAction.createInBan && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold text-black">
                Chọn đơn vị:
              </Label>
              <div className="flex-1 min-w-0">
                <SelectCustom
                  options={unitOptionsForRegister}
                  value={selectedUnit}
                  onChange={handleUnitChange}
                  placeholder="Chọn đơn vị"
                  className="!w-[300px]"
                  type="single"
                />
              </div>
            </div>
          )}
          {selectedTab === "waitApprove" && userAction.approveInBan && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold text-black">
                Đơn vị chờ duyệt lịch:
              </Label>
              <div className="flex-1 min-w-0">
                <SelectCustom
                  options={unitOptionsForWaitApprove}
                  value={selectedUnit}
                  onChange={handleUnitChange}
                  placeholder="Chọn đơn vị"
                  className="!w-[300px]"
                  type="single"
                />
              </div>
            </div>
          )}
          {selectedTab === "official" && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold text-black">
                  Chọn vai trò:
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={roleOptions}
                    value={selectedRole}
                    onChange={handleRoleChange}
                    placeholder="Chọn vai trò"
                    className="!w-[200px]"
                    type="single"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-black">
                  Chọn đơn vị:
                </label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={unitOptionsForOfficial}
                    value={selectedUnit}
                    onChange={handleUnitChange}
                    placeholder="Chọn đơn vị"
                    className="!w-[300px]"
                    type="single"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-base font-bold text-gray-600">
            Xem từ ngày {formatDateVN(startDate)} đến ngày{" "}
            {formatDateVN(endDate)}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              className="p-2 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-base font-bold text-gray-600">
              Tuần {currentWeek}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="p-2 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger
            value="official"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Lịch trực chính thức Ban
          </TabsTrigger>
          <TabsTrigger
            value="waitApprove"
            disabled={!userAction.approveInBan}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Lịch trực chờ duyệt
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Đăng ký lịch trực đơn vị
          </TabsTrigger>
        </TabsList>
        <TabsContent value="official">
          <OfficialPage
            userAction={userAction}
            orgPermissionLocal={orgPermissionLocal}
            watchListData={watchListData || []}
            isLoading={isLoading}
            onOpenModalChangeHistory={doOpenModalChangeHistory}
            onOpenRejectWatchList={doOpenRejectWatchList}
            isAllValuesNull={isAllValuesNull}
            isCanRejectFromComplete={isCanRejectFromComplete}
          />
        </TabsContent>
        <TabsContent value="waitApprove">
          <WaitApprovePage
            userAction={userAction}
            orgPermissionLocal={orgPermissionLocal}
            watchListData={watchListData || []}
            isLoading={isLoading}
            onOpenModalChangeHistory={doOpenModalChangeHistory}
            isAllValuesNull={isAllValuesNull}
            isCanFinishAndReject={isCanFinishAndReject}
            fromDate={format(startDate, "dd/MM/yyyy")}
            toDate={format(endDate, "dd/MM/yyyy")}
            onOpenRejectWatchList={doOpenRejectWatchList}
            statusAdd={statusAdd}
            setStatusAdd={setStatusAdd}
          />
        </TabsContent>
        <TabsContent value="register">
          <RegisterPage
            userAction={userAction}
            orgPermissionLocal={orgPermissionLocal}
            watchListData={watchListData || []}
            isLoading={isLoading}
            statusAdd={statusAdd}
            orgSelected={orgSelected}
            onOpenModalChangeHistory={doOpenModalChangeHistory}
            isAllValuesNull={isAllValuesNull}
            isCreateTrucChiHuy={isCreateTrucChiHuy}
            listCVV={listCVV}
          />
        </TabsContent>
      </Tabs>

      <HistoryWatchListModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        changeHistory={changeHistory}
      />

      <RejectWatchListModal
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        orgRejectId={rejectOrgId}
        isReturnToUnit={isReturnToUnit}
        fromDate={format(startDate, "dd/MM/yyyy")}
        toDate={format(endDate, "dd/MM/yyyy")}
        onSuccess={() => {
          refetch();
          setStatusAdd(false);
        }}
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmApprove}
        title="Xác nhận duyệt lịch trực"
        description={`Xác nhận duyệt lịch trực ${approveOrgName}`}
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={isApproving}
      />
    </div>
  );
}
