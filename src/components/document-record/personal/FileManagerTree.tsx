import React, { useState, useEffect } from "react";
import { Home, Folder, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface TreeNode {
  id: string;
  name?: string;
  title?: string;
  icon: string;
  children?: TreeNode[];
}

interface FileManagerTreeProps {
  treeData: TreeNode[];
  onFolderSelect?: (folderId: string) => void;
  onTypeChange?: (type: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function FileManagerTree({
  treeData,
  onFolderSelect,
  onTypeChange,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
}: FileManagerTreeProps) {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(["home"]);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const searchTerm =
    externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = externalOnSearchChange || setInternalSearchTerm;

  useEffect(() => {
    if (selectedType && selectedType !== "all") {
      onTypeChange?.(selectedType);
    } else if (selectedType === "all") {
      onTypeChange?.("");
    }
  }, [selectedType, onTypeChange]);

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  const TreeNode = ({ node, level = 0 }: { node: any; level?: number }) => {
    const isExpanded = expandedFolders.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const nodeName = node.name || node.title || "";

    const isVisible =
      searchTerm === "" || normalize(nodeName).includes(normalize(searchTerm));

    if (!isVisible) return null;

    return (
      <div className="select-none">
        <div
          className={`flex items-center gap-1 py-1.5 px-2 hover:bg-blue-50 cursor-pointer rounded ${
            selectedFolder === node.id ? "bg-blue-100" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            setSelectedFolder(node.id);
            if (node.id !== "home") {
              onFolderSelect?.(node.id);
            }
          }}
        >
          {hasChildren && (
            <span className="text-gray-600">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {!hasChildren && <span className="w-4" />}

          {node.icon === "home" && <Home className="w-4 h-4 text-yellow-600" />}
          {node.icon === "folder" && (
            <Folder className="w-4 h-4 text-yellow-600" />
          )}
          {node.icon === "plus" && <Plus className="w-4 h-4 text-blue-500" />}

          <span className="text-sm text-gray-800 truncate">
            {node.name || node.title}
          </span>
        </div>

        {node.children && node.children.length > 0 && (
          <div>
            {node.children.map((child: any) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 p-4 overflow-auto">
      <div className="mb-4 flex gap-2">
        <Input
          type="text"
          placeholder="Tìm kiếm hồ sơ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-none"
        />
        <SearchableSelect
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value);
          }}
          placeholder="---Chọn loại hồ sơ---"
          className="rounded-none"
          options={[
            { label: "--- Chọn loại hồ sơ ---", value: "all" },
            { label: "Hồ sơ được chia sẻ", value: "BE_SHARED" },
            { label: "Hồ sơ chia sẻ", value: "SHARED" },
            { label: "Hồ sơ tạo mới", value: "CREATE" },
            { label: "Hồ sơ được chuyển sang HSCV", value: "MOVE_HSVC" },
          ]}
        />
      </div>

      <ul className="border border-gray-200 rounded-lg p-2">
        {treeData.map((node) => (
          <li key={node.id}>
            <TreeNode node={node} />
          </li>
        ))}
      </ul>
    </div>
  );
}
