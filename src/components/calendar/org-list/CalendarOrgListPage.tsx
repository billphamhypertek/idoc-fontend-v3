"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import CalendarOrgListHeader from "./CalendarOrgListHeader";
import CalendarOrgListTable from "./CalendarOrgListTable";
import CalendarOrgListModal from "./CalendarOrgListModal";
import { Label } from "@/components/ui/label";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useGetOrgListCalendar } from "@/hooks/data/calendar.data";
import { Constant } from "@/definitions/constants/constant";
import { getDefaultOrgSearchField } from "@/utils/formValue.utils";
//import { SearchInput } from "@/components/document-in/SearchInput";

export default function CalendarOrgListPage() {
  //const [quickSearchText, setQuickSearchText] = useState("");
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  //const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [searchFields, setSearchFields] = useState(getDefaultOrgSearchField());
  const [tempSearchFields, setTempSearchFields] = useState(
    getDefaultOrgSearchField()
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(Constant.PAGING.SIZE);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("size", itemsPerPage.toString());
    params.set("text", searchFields.address.trim());
    if (sortBy) {
      params.set("sortBy", sortBy);
      params.set("direction", sortDirection);
    }

    if (searchFields.address.trim()) {
      params.set("address", searchFields.address.trim());
    }

    return params.toString();
  }, [
    currentPage,
    itemsPerPage,
    sortBy,
    sortDirection,
    //isBasicSearch,
    searchFields,
    //quickSearchText,
  ]);

  //   const appliedParams =
  //     //isBasicSearch || !isAdvancedSearchExpanded || quickSearchText.trim()
  //     !isAdvancedSearchExpanded
  //       ? queryParams
  //       : queryParams;

  const { data, isLoading } = useGetOrgListCalendar(queryParams);
  const orgList = data?.content ?? data?.objList ?? [];
  const totalRecord = data?.totalRecord ?? 0;

  //   const handleQuickSearch = () => {
  //     //setIsBasicSearch(true);
  //     setCurrentPage(1);
  //   };

  const handleAdvancedSearch = () => {
    setSearchFields(tempSearchFields);
    //setIsBasicSearch(false);
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    const empty = getDefaultOrgSearchField();
    setSearchFields(empty);
    setTempSearchFields(empty);
    //setQuickSearchText("");
    //setIsBasicSearch(true);
    setCurrentPage(1);
    setSortBy("");
    setSortDirection("DESC");
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
  };

  return (
    <div className="py-0 px-4 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[{ label: "Lịch", href: "/calendar" }]}
        currentPage="Quản lý địa điểm phòng họp"
        showHome={false}
      />
      <CalendarOrgListHeader
        onAddRoom={() => {
          setEditingOrg(null);
          setIsOpenModal(true);
        }}
      />

      <div className="flex justify-end items-center gap-3 px-4">
        {/* <div className="relative w-full sm:w-80">
          <SearchInput
            placeholder="Tìm kiếm Địa điểm"
            value={searchFields.address}
            setSearchInput={(value) => setSearchFields({ ...searchFields, address: value })}
          />
        </div> */}
        <Button
          variant="outline"
          onClick={() => setIsAdvancedSearchExpanded(!isAdvancedSearchExpanded)}
          className="h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
        >
          <Search className="w-4 h-4 mr-1" />
          {isAdvancedSearchExpanded ? "Thu gọn tìm kiếm" : "Tìm kiếm nâng cao"}
        </Button>
      </div>

      {/* Advanced search */}
      {isAdvancedSearchExpanded && (
        <div className="bg-white rounded-lg border mb-4">
          <h3 className="font-bold text-info mb-10 p-4 bg-blue-100 rounded-t-lg">
            Tìm kiếm nâng cao
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdvancedSearch();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 px-8">
              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Địa điểm
                </Label>
                <Input
                  value={tempSearchFields.address}
                  onChange={(e) =>
                    setTempSearchFields({
                      ...tempSearchFields,
                      address: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 my-6">
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-1" />
                Tìm kiếm
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs"
                onClick={handleResetSearch}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Đặt lại
              </Button>
            </div>
          </form>
        </div>
      )}

      <CalendarOrgListTable
        data={orgList}
        loading={isLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalRecord}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEditOrg={(org) => {
          setEditingOrg(org);
          setIsOpenModal(true);
        }}
      />

      <CalendarOrgListModal
        open={isOpenModal}
        onOpenChange={(open) => {
          setIsOpenModal(open);
          if (!open) setEditingOrg(null);
        }}
        isEditOrg={!!editingOrg}
        orgData={editingOrg}
      />
    </div>
  );
}
