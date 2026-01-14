"use client";

import { Button } from "@/components/ui/button";
import { ChartBar, Grid2x2, List } from "lucide-react";
import KanbanView from "./KanbanView";
import ListView from "./ListView";
import { cn } from "@/lib/utils";

interface WorkStatisticContentProps {
  checkReloadDataKanban?: (event: string) => void;
  listData?: any[];
  listPhong?: any[];
  callPhong?: (isDonvi: boolean, id: any) => void;
  callDonvi?: (isDonvi: boolean, id: any) => void;
  callBackClickList?: (type: number, list: any) => void;
  isDashboard?: boolean;
  idDonvi?: number;
  orgsList?: any[];
  selectedUsers?: any[];
  textSearch?: any;
  clickKanban?: (isKanban: boolean) => void;
  viewMode?: string;
  setViewMode?: (viewMode: string) => void;
  listUser?: any[];
  setIsDashboard?: (isDashboard: boolean) => void;
}
export default function WorkStatisticContent({
  checkReloadDataKanban,
  listData,
  listPhong,
  callPhong,
  callDonvi,
  callBackClickList,
  isDashboard,
  idDonvi,
  orgsList,
  selectedUsers,
  textSearch,
  viewMode,
  setViewMode,
  listUser,
  setIsDashboard,
}: WorkStatisticContentProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between bg-[#EAF8EE] p-4 rounded-lg">
        <div className="flex items-center gap-4 text-green-500">
          <ChartBar className="w-4 h-4" />
          <span>Phân bố công việc</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            onClick={() => setViewMode?.("kanban")}
            className={cn(
              "gap-2",
              viewMode === "kanban" &&
                "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            <Grid2x2 className="w-4 h-4" />
            Kanban
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode?.("list")}
            className={cn(
              "gap-2",
              viewMode === "list" &&
                "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            <List className="w-4 h-4" />
            Danh sách
          </Button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        listData && listData.length > 0 ? (
          <KanbanView
            listData={listData}
            checkReloadDataKanban={checkReloadDataKanban}
            isDashboard={isDashboard}
            listPhong={listPhong}
            listUser={listUser}
            callPhong={callPhong}
            callDonvi={callDonvi}
            // idDonvi={idDonvi}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Không có dữ liệu để hiển thị
          </div>
        )
      ) : (
        <ListView
          isDashboard={isDashboard}
          selectedUsers={selectedUsers}
          textSearch={textSearch}
          idDonvi={idDonvi}
          orgsList={orgsList}
          callBackClickList={callBackClickList}
          setIsDashboard={setIsDashboard}
        />
      )}
    </div>
  );
}
