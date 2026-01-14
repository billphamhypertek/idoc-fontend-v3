"use client";

import SelectCustom from "@/components/common/SelectCustom";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGetAllUsersByOrgAndSub } from "@/hooks/data/task.data";
import { getUserInfo } from "@/utils/token.utils";
import { useMemo } from "react";
import { File, RotateCcw, Search } from "lucide-react";
import { useGetOrgChildrenListV2 } from "@/hooks/data/organization.data";
import { cn } from "@/lib/utils";

interface TaskKPIFilterProps {
  searchField: any;
  setSearchField: (value: any) => void;
  onSearch: () => void;
  onReset: () => void;
  onExport: () => void;
}

export default function TaskKPIFilter({
  searchField,
  setSearchField,
  onSearch,
  onReset,
  onExport,
}: TaskKPIFilterProps) {
  const UserInfo = useMemo(() => {
    return JSON.parse(getUserInfo() || "{}");
  }, []);
  const orgId = UserInfo?.org || 0;

  const checkRole = [
    "Trưởng phòng",
    "Phó phòng",
    "Nhân viên",
    "Văn thư",
    "Trợ lý",
  ];

  const isBannedRole = checkRole.some((role) =>
    UserInfo?.roles?.some((r: any) => r.name === role)
  );

  const selectedOrgId =
    searchField.orgId && searchField.orgId !== "all"
      ? Number(searchField.orgId)
      : orgId;

  const { data: listUsers } = useGetAllUsersByOrgAndSub(selectedOrgId);

  const { data: listOrgs } = useGetOrgChildrenListV2(orgId, !isBannedRole);

  const userOptions = useMemo(() => {
    return [
      { label: "--- Chọn ---", value: "all" },
      ...(listUsers?.map((user: any) => ({
        label: user.fullName,
        value: user.id.toString(),
      })) || []),
    ];
  }, [listUsers]);

  const orgOptions = useMemo(() => {
    return [
      { label: "--- Chọn ---", value: "all" },
      ...(listOrgs?.map((org: any) => ({
        label: org.name,
        value: org.id.toString(),
      })) || []),
    ];
  }, [listOrgs]);

  const handleOrgChange = (value: string | string[]) => {
    const orgIdValue = Array.isArray(value) ? value[0] : value;
    setSearchField((prev: any) => ({
      ...prev,
      orgId: orgIdValue,
      userId: "all",
    }));
  };

  return (
    <div className="space-y-4 px-4">
      <div
        className={cn("grid grid-cols-4 gap-4", isBannedRole && "grid-cols-3")}
      >
        <div className="space-y-2">
          <Label className="text-md font-bold text-gray-700">
            Danh sách người dùng
          </Label>
          <SearchableSelect
            options={userOptions}
            value={searchField.userId}
            onValueChange={(value) =>
              setSearchField({ ...searchField, userId: value })
            }
            placeholder="Chọn người dùng"
            searchPlaceholder="Tìm kiếm người dùng..."
            className="w-full"
          />
        </div>
        {!isBannedRole && (
          <div className="space-y-2">
            <Label className="text-md font-bold text-gray-700">Đơn vị</Label>
            <SelectCustom
              options={orgOptions}
              value={searchField.orgId}
              onChange={handleOrgChange}
              placeholder="Chọn đơn vị"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-md font-bold text-gray-700">Từ ngày</Label>
          <CustomDatePicker
            selected={searchField.startDateNgb}
            onChange={(date) =>
              setSearchField({ ...searchField, startDateNgb: date })
            }
            placeholder="Chọn từ ngày"
            showClearButton={false}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-md font-bold text-gray-700">Đến ngày</Label>
          <CustomDatePicker
            selected={searchField.endDateNgb}
            onChange={(date) =>
              setSearchField({ ...searchField, endDateNgb: date })
            }
            placeholder="Chọn đến ngày"
            min={
              searchField.startDateNgb
                ? searchField.startDateNgb.toISOString().split("T")[0]
                : undefined
            }
            showClearButton={false}
          />
        </div>
      </div>
      <div className="flex justify-center mt-4 gap-4">
        <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700">
          <Search className="w-4 h-4 mr-2" />
          Tìm kiếm
        </Button>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
        <Button onClick={onExport} className="bg-green-600 hover:bg-green-700">
          <File className="w-4 h-4 mr-2" />
          Xuất Excel
        </Button>
      </div>
    </div>
  );
}
