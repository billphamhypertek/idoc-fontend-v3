"use client";

import { useState, useMemo } from "react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import CalendarRoomHeader from "./CalendarRoomHeader";
import CalendarRoomFilter from "./CalendarRoomFilter";
import CalendarRoomTable from "./CalendarRoomTable";
import CalendarRoomAdd from "./CalendarRoomAdd";
import { useGetRoomListMeetingCalendar } from "@/hooks/data/calendar.data";
import { Constant } from "@/definitions/constants/constant";
import { getDefaultRoomSearchField } from "@/utils/formValue.utils";

export default function CalendarRoomPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(Constant.PAGING.SIZE);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [quickSearchText, setQuickSearchText] = useState("");
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [hasSubmittedAdvancedSearch, setHasSubmittedAdvancedSearch] =
    useState(false);
  const [searchFields, setSearchFields] = useState(getDefaultRoomSearchField());
  const [tempSearchFields, setTempSearchFields] = useState(
    getDefaultRoomSearchField()
  );
  const [isOpenAddRoom, setIsOpenAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("isRegisterScreen", "false");
    params.set("page", currentPage.toString());
    params.set("size", itemsPerPage.toString());
    params.set("sortBy", sortBy);
    params.set("direction", sortDirection);

    if (isBasicSearch) {
      if (quickSearchText && quickSearchText.trim()) {
        params.set("q", quickSearchText.trim());
      }
    } else {
      params.set("name", searchFields.name || "");
      params.set("address", searchFields.address || "");
      params.set("quantity", searchFields.quantity?.toString() || "");
      params.set("acreage", searchFields.acreage?.toString() || "");
      params.set("description", searchFields.description || "");
    }

    return params.toString();
  }, [
    currentPage,
    itemsPerPage,
    sortBy,
    sortDirection,
    isBasicSearch,
    searchFields,
    quickSearchText,
  ]);

  const appliedParams =
    isBasicSearch || hasSubmittedAdvancedSearch ? queryParams : "";

  const { data, isLoading } = useGetRoomListMeetingCalendar(
    appliedParams,
    true
  );

  const roomList = data?.content || [];
  const totalRecord = data?.totalElements || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
  };

  const handleQuickSearch = () => {
    setIsBasicSearch(true);
    setCurrentPage(1);
  };

  const handleAdvancedSearch = (fields: typeof tempSearchFields) => {
    setSearchFields(fields);
    setHasSubmittedAdvancedSearch(true);
    setIsBasicSearch(false);
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    const emptyFields = getDefaultRoomSearchField();
    setSearchFields(emptyFields);
    setTempSearchFields(emptyFields);
    setQuickSearchText("");
    setHasSubmittedAdvancedSearch(false);
    setIsBasicSearch(true);
    setCurrentPage(1);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setIsOpenAddRoom(true);
  };

  const handleCloseAddRoom = () => {
    setIsOpenAddRoom(false);
    setEditingRoom(null);
  };

  return (
    <div className="py-0 px-4 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[{ label: "Lịch", href: "/calendar" }]}
        currentPage="Phòng họp"
        showHome={false}
      />
      <CalendarRoomHeader
        onAddRoom={() => {
          setEditingRoom(null);
          setIsOpenAddRoom(true);
        }}
      />
      <CalendarRoomFilter
        quickSearchText={quickSearchText}
        onQuickSearchChange={(text) => {
          setQuickSearchText(text);
          if (!isBasicSearch) {
            setIsBasicSearch(true);
            setCurrentPage(1);
          }
        }}
        onQuickSearch={handleQuickSearch}
        isAdvancedSearch={isAdvancedSearchExpanded}
        onAdvancedSearchToggle={(expanded) => {
          setIsAdvancedSearchExpanded(expanded);
          if (expanded) {
            setTempSearchFields(searchFields);
          }
        }}
        searchFields={tempSearchFields}
        onSearchFieldsChange={setTempSearchFields}
        onAdvancedSearch={handleAdvancedSearch}
        onResetSearch={handleResetSearch}
      />
      <CalendarRoomTable
        data={roomList}
        loading={isLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalRecord}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEditRoom={handleEditRoom}
      />
      <CalendarRoomAdd
        open={isOpenAddRoom}
        onOpenChange={handleCloseAddRoom}
        isEditRoom={!!editingRoom}
        roomData={editingRoom}
      />
    </div>
  );
}
