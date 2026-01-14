"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Search, Check, X, Save, FileCheck } from "lucide-react";
import { Table } from "../ui/table";
import { UserService } from "@/services/user.service";
import type { Column } from "@/definitions/types/table.type";
import { handleError } from "@/utils/common.utils";
import { Checkbox } from "../ui/checkbox";

interface User {
  id: string;
  fullName: string;
  position: string;
  orgName: string;
}

interface TextSignUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: User) => void;
  selectedUser?: User | null;
}

export default function TextSignUserModal({
  isOpen,
  onOpenChange,
  onSelectUser,
  selectedUser,
}: TextSignUserModalProps) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Define columns for the table
  const columns: Column<User>[] = [
    {
      header: "STT",
      accessor: (user: User, index: number) => (
        <span className="text-xs font-medium text-gray-600 min-w-[20px]">
          {index + 1}
        </span>
      ),
      className: "w-16 text-center",
    },
    {
      header: "Họ và tên",
      accessor: (user: User) => (
        <div className="truncate" title={user.fullName}>
          {user.fullName}
        </div>
      ),
      className: "text-left w-48 min-w-[200px]",
    },
    {
      header: "Chức vụ",
      accessor: "position",
      className: "text-center w-32 min-w-[120px]",
    },
    {
      header: "Đơn vị",
      accessor: (user: User) => (
        <div className="truncate" title={user.orgName}>
          {user.orgName}
        </div>
      ),
      className: "text-left w-64 min-w-[250px] max-w-[300px]",
    },
    {
      header: "",
      type: "actions",
      accessor: "id",
      className: "w-20 text-center",
      renderActions: (user: User) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedUser?.id === user.id}
            onCheckedChange={() => handleSelectUser(user)}
          />
        </div>
      ),
    },
  ];

  const handleSearch = async () => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await UserService.searchUserActive1(searchText);
      setSearchResults(results || []);
    } catch (error) {
      handleError(error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
  };

  const handleConfirmSelection = () => {
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setSearchText("");
    setSearchResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="border-b pb-4 text-lg">
            Thêm người ký
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search border-b">
              Nội dung tìm kiếm<span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2 flex-col items-center justify-center">
              <Input
                id="search"
                placeholder="Tìm kiếm Họ và tên | Email | Tên đăng nhập"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-9 py-3 border border-input focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-none"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 w-fit bg-blue-600 text-white hover:bg-blue-600"
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? "Đang tìm..." : "Tìm kiếm"}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-auto">
            <div className="min-w-full">
              <Table
                columns={columns}
                dataSource={searchResults}
                onRowClick={handleSelectUser}
                showPagination={false}
                emptyText={
                  searchText
                    ? "Không tìm thấy người dùng nào"
                    : "Nhập từ khóa để tìm kiếm người ký"
                }
                loading={isSearching}
                className="min-w-[800px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleConfirmSelection}
            disabled={!selectedUser}
            className="bg-blue-600 hover:bg-blue-600 text-white"
          >
            <FileCheck className="w-4 h-4" />
            Đồng ý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
