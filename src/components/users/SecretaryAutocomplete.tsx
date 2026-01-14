"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SecretaryAutocompleteProps {
  value: string[];
  onChange: (value: string[]) => void;
  allUsers?: any[];
}

export default function SecretaryAutocomplete({
  value,
  onChange,
  allUsers = [],
}: SecretaryAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Filter suggestions based on input using allUsers instead of secretarys
  useEffect(() => {
    if (inputValue.trim() && allUsers && allUsers.length > 0) {
      const filtered = allUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(user.fullName)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, allUsers, value]);

  const handleAddSecretary = (secretaryName: string) => {
    if (!value.includes(secretaryName)) {
      onChange([...value, secretaryName]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleRemoveSecretary = (secretaryName: string) => {
    onChange(value.filter((name) => name !== secretaryName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleAddSecretary(inputValue.trim());
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700">Thư ký</label>

      {/* Selected secretaries */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((secretaryName) => (
            <Badge
              key={secretaryName}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {secretaryName}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveSecretary(secretaryName)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with suggestions */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tên thư ký"
          className="w-full"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((user) => (
              <div
                key={user.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleAddSecretary(user.fullName)}
              >
                {user.fullName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
