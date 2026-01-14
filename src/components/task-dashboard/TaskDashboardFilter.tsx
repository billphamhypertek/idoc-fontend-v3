"use client";

import { useLoadKanbanList } from "@/hooks/data/task-dashboard.data";
import { cn } from "@/lib/utils";
import { OrganizationService } from "@/services/organization.service";
import { UserService } from "@/services/user.service";
import { handleError } from "@/utils/common.utils";
import { TextUtils } from "@/utils/text-utils";
import { getUserInfo, isTruongOrPhoTruongPhong } from "@/utils/token.utils";
import {
  Building,
  ChartBar,
  ChartSpline,
  CircleUser,
  Network,
  Plus,
  Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/mutil-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import WorkAssignDialog from "../work-assign/createDialog";
import StatisticContent from "./statistic/StatisticContent";
import WorkStatisticContent from "./work-statistic/WorkStatisticContent";

export default function TaskDashboardFilter() {
  const userInfo = useMemo(() => JSON.parse(getUserInfo() || "{}"), []);
  const [activeTab, setActiveTab] = useState("tkcv");
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedPhong, setSelectedPhong] = useState<any>([]);
  const [isDashboard, setIsDashboard] = useState(false);
  const [listUser, setListUser] = useState<any[]>([]);
  const [selectedDonvi, setSelectedDonvi] = useState<any[]>([]);
  const [orgIdSelected, setOrgIdSelected] = useState<any>(null);
  const [idOrg, setIdOrg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [textSearch, setTextSearch] = useState("");
  const [listData, setListData] = useState<any[]>([]);
  const [listDataSave, setListDataSave] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [listDonVi, setListDonVi] = useState<any[]>([]);
  const [listPhong, setListPhong] = useState<any[]>([]);
  const [disableDonvi, setDisableDonvi] = useState(false);
  const [disablePhong, setDisablePhong] = useState(false);
  const [disableUser, setDisableUser] = useState(false);
  const [textSearchList, setTextSearchList] = useState("");
  const pathname = usePathname();
  const [openWorkAssign, setOpenWorkAssign] = useState(false);
  const [isExecute, setIsExecute] = useState<boolean | null>(true);

  const loadKanbanMutation = useLoadKanbanList();

  useEffect(() => {
    setIsDashboard(pathname?.split("/").pop() === "dashboard");
  }, [pathname]);

  useEffect(() => {
    getOrg();
  }, []);

  useEffect(() => {
    if (activeTab === "tkcv" && viewMode === "kanban") {
      if (selectedUsers.length > 0) {
        findListTaskDashboard(
          selectedUsers.map((item: any) => item.id).join(", "),
          false
        );
      } else if (orgIdSelected) {
        findListTaskDashboard(orgIdSelected, true);
      }
    }
  }, [viewMode]);

  useEffect(() => {
    if (orgIdSelected) {
      doSearch();
    }
  }, [isExecute]);

  const handleDonviChange = async (selected: any[]) => {
    setSelectedDonvi(selected);

    if (selected.length === 0) {
      await findListDonvi(selected, false, true, selected);
    } else if (selected.length === listDonVi.length && selected.length > 0) {
      await findListDonvi(selected, false, true, selected);
    } else {
      const lastSelected = selected[selected.length - 1];
      await findListDonvi(
        lastSelected ? lastSelected.id : 0,
        false,
        true,
        selected
      );
    }
  };

  const handlePhongChange = async (selected: any[]) => {
    setSelectedPhong(selected);

    if (selected.length === 0) {
      await findListUser(0, false, selected);
    } else if (selected.length === listPhong.length && selected.length > 0) {
      await findListUser(selected, false, selected);
    } else {
      const lastSelected = selected[selected.length - 1];
      await findListUser(lastSelected ? lastSelected.id : 0, false, selected);
    }
  };

  const findListUser = async (
    orgId: any,
    isAutoLoad = false,
    selectedPhongItems?: any[]
  ) => {
    setIsDashboard(true);
    let listOrgId;

    if (Array.isArray(orgId) && (orgId.length == 0 || orgId.length > 0)) {
      listOrgId = orgId.map((u: any) => u.id).join(",");
      setSelectedPhong(orgId);
    } else {
      if (isAutoLoad) {
        listOrgId = orgId;
      } else {
        const phongToUse = selectedPhongItems || selectedPhong;
        if (phongToUse && phongToUse.length > 0) {
          listOrgId = phongToUse.map((u: any) => u.id).join(",");
        } else {
          listOrgId = orgId ? orgId.toString() : "";
        }
      }
    }

    if (orgId == 0) {
      setListUser([]);
      findListTaskDashboard(selectedDonvi.map((u: any) => u.id).join(","));
    } else {
      const data = await UserService.getAllUsersByOrgList(listOrgId);
      if (data) {
        setListUser(data);
        await findListTaskDashboard(listOrgId);
      }
    }
  };

  const selectUser = (userId: any) => {
    const userIdArray = Array.isArray(userId)
      ? userId
      : userId
        ? [{ id: userId }]
        : [];

    const userIdLength = userIdArray.length;

    if (
      userIdLength == 0 ||
      userIdLength == listUser.length ||
      selectedUsers.length == 0
    ) {
      setListData(listDataSave);
      if (userIdLength == 0) {
        findListTaskDashboard(orgIdSelected);
        setIsDashboard(true);
      } else {
        const userIdString = userIdArray.map((item: any) => item.id).join(", ");
        findListTaskDashboard(userIdString, false);
        setIsDashboard(false);
      }
    } else {
      setListData(
        listDataSave.filter((item: any) =>
          userIdArray.some((user: any) => user.id === item.handlerId)
        )
      );
      const userIdString = userIdArray.map((item: any) => item.id).join(", ");
      findListTaskDashboard(userIdString, false);
      setIsDashboard(false);
    }
  };

  const findListTaskDashboard = async (
    orgId: any,
    isOrg = true,
    targetViewMode?: string
  ) => {
    const currentViewMode = targetViewMode || viewMode;

    if (isOrg) {
      setOrgIdSelected(orgId);
      const orgIdArray = orgId
        .toString()
        .split(",")
        .map((id: string) => Number(id.trim()))
        .filter((id: number) => !isNaN(id));
      setIdOrg(orgIdArray.length > 0 ? orgIdArray : null);
      setSelectedUsers([]);
    }

    if (currentViewMode === "kanban") {
      setLoading(true);
      try {
        const data = await loadKanbanMutation.mutateAsync({
          orgId,
          text: textSearch,
          isOrg: isOrg,
          isExecute: isExecute,
        });

        if (data) {
          data.forEach((user: any) => {
            user.handlerNameSub = TextUtils.getInitials(user.handlerName);
          });
          setListData(data);
          setListDataSave(data);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const findListDonvi = async (
    orgId: any,
    isDonVi: boolean = true,
    isLoadData: boolean = true,
    selectedDonviItems?: any[]
  ) => {
    let listOrgId;
    reloadDdataPhongUser();

    if (Array.isArray(orgId) && (orgId.length == 0 || orgId.length > 0)) {
      listOrgId = orgId.map((u: any) => u.id).join(",");
    } else if (!isLoadData) {
      listOrgId = orgId;
    } else {
      const donviToUse = selectedDonviItems || selectedDonvi;
      if (donviToUse && donviToUse.length > 0) {
        listOrgId = donviToUse.map((u: any) => u.id).join(",");
      } else {
        listOrgId = orgId ? orgId.toString() : "";
      }
    }

    if (orgId == 0 && isDonVi) {
      reloadDdataPhongUser();
    } else {
      const data = await OrganizationService.getOrgChildrenList(listOrgId);
      if (data) {
        if (isDonVi) {
          setListDonVi(data);
          reloadDdataPhongUser();
        } else {
          setListPhong(data);
          setSelectedPhong([]);
          if (orgId == 0) {
            reloadDdataPhongUser();
          }
        }
        if (isLoadData) {
          await findListTaskDashboard(listOrgId == "" ? 2 : listOrgId);
        }
        return data;
      }
      return null;
    }
  };

  const reloadDdataPhongUser = () => {
    setSelectedPhong([]);
    setListPhong([]);
    setSelectedUsers([]);
    setListUser([]);
    setIsDashboard(true);
  };

  const getOrg = async () => {
    setLoading(true);
    try {
      setIsDashboard(true);
      const { org, orgModel, id, fullName } = userInfo;

      await findListTaskDashboard(org);
      const donViData = await findListDonvi(2, true, false);

      switch (orgModel?.level) {
        case 1:
          await findListDonvi(org, false, false);
          setDisableDonvi(true);
          setIsDashboard(true);
          setSelectedDonvi([
            {
              id: org,
              name: orgModel.name,
            },
          ]);
          break;
        case 2:
          await findListDonvi(orgModel.parentId, false, false);

          const parentOrg = donViData?.filter(
            (x: any) => x.id == orgModel.parentId
          )[0];
          setSelectedDonvi([
            {
              id: orgModel.parentId,
              name: parentOrg?.name,
            },
          ]);
          setIsDashboard(false);

          await findListUser(org, true);

          setSelectedPhong([{ id: org, name: orgModel.name }]);

          if (!isTruongOrPhoTruongPhong()) {
            setDisableUser(true);
            setSelectedUsers([{ id: id, name: fullName, fullName: fullName }]);
            await selectUser(id);
          }

          setDisableDonvi(true);
          setDisablePhong(true);

          break;
        default:
          break;
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const lamMoi = () => {
    setTextSearch("");
    doSearch();
  };

  const reloadData = () => {
    if (selectedUsers.length > 0) {
      findListTaskDashboard(
        selectedUsers.map((item: any) => item.id).join(", "),
        false
      );
    } else {
      findListTaskDashboard(orgIdSelected);
    }
  };

  const doSearch = () => {
    reloadData();
    setTextSearchList(textSearch);
  };

  const checkReloadDataKanban = async (event: string) => {
    if (event === "reload") {
      reloadData();
    }
  };

  const callbackClick = async (isDonvi: boolean, id: any) => {
    if (isDonvi) {
      const selectedOrg = listDonVi.find((x: any) => x.id == id);
      if (selectedOrg) {
        const selectedDonviItem = [
          {
            id: id,
            name: selectedOrg.name,
          },
        ];
        setSelectedDonvi(selectedDonviItem);
        await findListDonvi(id, false, true, selectedDonviItem);
      }
    } else {
      const selectedRoom = listPhong.find((x: any) => x.id == id);
      if (selectedRoom) {
        const selectedPhongItem = [
          {
            id: id,
            name: selectedRoom.name,
          },
        ];
        setSelectedPhong(selectedPhongItem);
        await findListUser(id, false, selectedPhongItem);
      }
    }
  };

  const callBackClick = async (type: number, list: any, org?: any) => {
    switch (type) {
      case 0:
        setSelectedDonvi(list);
        await findListDonvi(list, false, true, list);
        setIsDashboard(true);
        break;
      case 1:
        setListPhong(list);
        const selectedDonviForPhong = org ? [org] : [];
        setSelectedDonvi(selectedDonviForPhong);
        await findListUser(list, false, list);
        setSelectedPhong(list);
        setIsDashboard(true);
        break;
      case 2:
        setListUser(list);
        const selectedPhongForUser = org ? [org] : [];
        setSelectedPhong(selectedPhongForUser);
        await selectUser(list);
        setSelectedUsers(list);
        setIsDashboard(false);
        break;
      default:
        break;
    }
  };

  const clickKanban = async (isKanban: boolean) => {
    const newViewMode = isKanban ? "kanban" : "list";
    setViewMode(newViewMode);
    reloadData();
  };

  const tabs = [
    {
      label: "Thống kê công việc",
      value: "tkcv",
      icon: <ChartBar className="w-4 h-4" />,
    },
    {
      label: "Thống kê",
      value: "tk",
      icon: <ChartSpline className="w-4 h-4" />,
    },
  ];

  const back = () => {
    const { org, orgModel } = userInfo;
    let newOrgIdSelected = orgIdSelected;
    const shouldReload = true;

    if (selectedUsers.length > 0) {
      setSelectedUsers([]);
      setIsDashboard(true);
      newOrgIdSelected = orgIdSelected;
    } else if (selectedPhong.length > 0) {
      if (orgModel?.level === 2) {
        return;
      }

      setSelectedPhong([]);
      setListUser([]);
      const orgIdArray = selectedDonvi.map((u: any) => u.id);
      const orgIdString = orgIdArray.join(",");
      newOrgIdSelected = orgIdString;
      setOrgIdSelected(orgIdString);
      setIdOrg(orgIdArray.length > 0 ? orgIdArray : null);
    } else if (selectedDonvi.length > 0) {
      // Back từ cấp Đơn vị về cấp gốc (theo org của user)
      setSelectedDonvi([]);
      setSelectedPhong([]);
      setListPhong([]);
      setListUser([]);
      setIsDashboard(true);

      if (org) {
        newOrgIdSelected = org;
      } else {
        newOrgIdSelected = null;
      }
    }

    if (shouldReload && newOrgIdSelected) {
      findListTaskDashboard(newOrgIdSelected, true);
    }
  };

  const canAssignTask = useMemo(() => {
    const restrictedRoles = ["Văn thư", "Nhân viên", "Trợ lý"];
    return (
      !userInfo.roles ||
      !userInfo.roles.some((role: any) => restrictedRoles.includes(role.name))
    );
  }, [userInfo.roles]);

  const isRestrictView = useMemo(() => {
    return userInfo.org === 2 && userInfo.lead === true;
  }, [userInfo.org, userInfo.lead]);

  const filteredTabs = useMemo(() => {
    if (isRestrictView) {
      return tabs.filter((tab) => tab.value !== "tkcv");
    }
    return tabs;
  }, [isRestrictView]);

  useEffect(() => {
    if (isRestrictView && activeTab === "tkcv") {
      setActiveTab("tk");
    }
  }, [isRestrictView, activeTab]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col pb-2">
          <h1 className="text-md font-bold">Thống kê Công việc</h1>
          <p className="text-sm text-gray-500">
            Quản lý và theo dõi công việc thống kê
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
              onClick={doSearch}
            />
            <Input
              placeholder="Tìm kiếm ID | Tên công việc"
              className="pl-10 text-[#4f5467]"
              value={textSearch}
              onChange={(e) => setTextSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  doSearch();
                }
              }}
            />
          </div>
          <Select
            value={isExecute === null ? "all" : isExecute ? "true" : "false"}
            onValueChange={(value) => {
              const newValue = value === "all" ? null : value === "true";
              setIsExecute(newValue);
            }}
          >
            <SelectTrigger className="w-[120px] text-[#4f5467]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="text-[#4f5467]">
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Xử lý chính</SelectItem>
              <SelectItem value="false">Phối hợp</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={doSearch}
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </Button>
          {canAssignTask && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setOpenWorkAssign(true)}
            >
              <Plus className="w-4 h-4" />
              Giao việc
            </Button>
          )}
          {/* <Button variant="outline" className="" onClick={lamMoi}>
            <RotateCcw className="w-4 h-4" />
            Đặt lại
          </Button> */}
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-2">
            <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1">
              {filteredTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="whitespace-nowrap data-[state=active]:text-blue-600 px-3 py-1 text-xs rounded-md transition-colors"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-green-500" />
              <MultiSelect
                options={listDonVi}
                value={selectedDonvi || []}
                onChange={handleDonviChange}
                placeholder="Chọn đơn vị"
                placeholderSearch="Tìm kiếm đơn vị"
                className={cn(
                  "w-[200px]",
                  disableDonvi && "opacity-50 pointer-events-none"
                )}
                showNumberOfItems={true}
                chooseAll={true}
                noDataMessage="Không tìm thấy đơn vị nào"
                popoverClassName="max-w-[250px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-500" />
              <MultiSelect
                options={listPhong}
                value={Array.isArray(selectedPhong) ? selectedPhong : []}
                onChange={handlePhongChange}
                placeholder="Chọn phòng"
                placeholderSearch="Tìm kiếm phòng"
                className={cn(
                  "w-[200px]",
                  disablePhong && "opacity-50 pointer-events-none"
                )}
                showNumberOfItems={true}
                chooseAll={true}
                noDataMessage="Không tìm thấy phòng nào"
                popoverClassName="max-w-[250px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <CircleUser className="w-4 h-4 text-green-700" />
              <MultiSelect
                options={listUser.map((u: any) => ({
                  id: u.id,
                  name: u.fullName,
                }))}
                value={(selectedUsers || []).map((u: any) => ({
                  id: u.id,
                  name: u.fullName || u.name,
                }))}
                onChange={(selected) => {
                  const usersWithFullName = selected.map((s: any) => {
                    const user = listUser.find((u: any) => u.id === s.id);
                    return user ? { ...s, fullName: user.fullName } : s;
                  });
                  setSelectedUsers(usersWithFullName);
                  selectUser(usersWithFullName);
                }}
                placeholder="Chọn người dùng"
                placeholderSearch="Tìm kiếm người dùng"
                className={cn(
                  "w-[200px]",
                  disableUser && "opacity-50 pointer-events-none"
                )}
                showNumberOfItems={true}
                chooseAll={true}
                noDataMessage="Không tìm thấy người dùng nào"
              />
            </div>
          </div>
        </div>

        {!isRestrictView && (
          <TabsContent value="tkcv" className="w-full mt-8">
            <WorkStatisticContent
              checkReloadDataKanban={checkReloadDataKanban}
              listData={listData}
              listPhong={listPhong}
              callPhong={callbackClick}
              callDonvi={callbackClick}
              callBackClickList={callBackClick}
              isDashboard={isDashboard}
              idDonvi={idOrg}
              orgsList={listPhong}
              selectedUsers={selectedUsers}
              textSearch={textSearch}
              clickKanban={clickKanban}
              viewMode={viewMode}
              setViewMode={setViewMode}
              listUser={listUser}
              setIsDashboard={setIsDashboard}
            />
          </TabsContent>
        )}
        <TabsContent value="tk" className="w-full mt-8">
          <StatisticContent
            orgIdSelected={orgIdSelected}
            listUser={listUser}
            idDonVi={idOrg}
            listPhong={listPhong}
            callPhong={callbackClick}
            callDonvi={callbackClick}
            callBack={back}
          />
        </TabsContent>
      </Tabs>
      {openWorkAssign && (
        <WorkAssignDialog
          open={openWorkAssign}
          onClose={() => {
            setOpenWorkAssign(false);
            checkReloadDataKanban?.("reload");
          }}
        />
      )}{" "}
    </div>
  );
}
