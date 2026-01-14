"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar, Printer } from "lucide-react";
import { CalendarService } from "@/services/calendar.service";
import { ToastUtils } from "@/utils/toast.utils";
import { saveAs } from "file-saver";

interface ExportCalendarModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  currentTab?: string;
  selectedDate?: Date;
}

export default function ExportCalendarModal({
  isOpen,
  onOpenChange,
  onClose,
  currentTab = "room",
  selectedDate: initialDate,
}: ExportCalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate || new Date()
  );
  const [isOfficial, setIsOfficial] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate || new Date());
    }
  }, [isOpen, initialDate]);

  const getDateCalendar = (date: Date): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setIsOfficial(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleExportExcel = async () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày");
      return;
    }

    try {
      const orgType = currentTab === "room" ? 1 : 2;
      const printCalendar = {
        date: new Date(getDateCalendar(selectedDate)).getTime(),
        orgType: orgType,
        releasedCalendar: isOfficial,
        signer: "",
        tl: "",
        places: [],
      };

      const fileName = `LICH_CONG_TAC_${getDateCalendar(selectedDate)}.xlsx`;
      const response = await CalendarService.exportCalendarExcel(printCalendar);

      if (response) {
        const blob = new Blob([response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, fileName);
      }
      handleClose();
    } catch (error) {
      ToastUtils.coLoiXayRaKhiExportExcel();
    }
  };

  const handleExportWord = async () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày");
      return;
    }

    try {
      const orgType = currentTab === "room" ? 1 : 2;
      const printCalendar = {
        date: new Date(getDateCalendar(selectedDate)).getTime(),
        orgType: orgType,
        releasedCalendar: isOfficial,
        signer: "",
        tl: "",
        places: [],
      };

      const fileName = `LICH_CONG_TAC_${getDateCalendar(selectedDate)}.docx`;
      const response = await CalendarService.exportCalendar(printCalendar);

      if (response) {
        const blob = new Blob([response], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveAs(blob, fileName);
      }
      handleClose();
    } catch (error) {
      ToastUtils.coLoiXayRaKhiExportWord();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Xuất lịch làm việc
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          {/* Chọn ngày */}
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium w-24">Chọn ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-between text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                    : "dd/mm/yyyy"}
                  <Calendar className="mr-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  required={false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Checkbox chính thức */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="official" className="text-sm font-medium w-24">
              Chính thức
            </Label>
            <Checkbox
              id="official"
              checked={isOfficial}
              onCheckedChange={(checked) => setIsOfficial(!!checked)}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center gap-2 text-white border-0"
            style={{ backgroundColor: "#7460ee" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#5a4acf")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#7460ee")
            }
          >
            <Printer className="w-4 h-4" />
            In lịch Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportWord}
            className="flex items-center gap-2 text-white border-0"
            style={{ backgroundColor: "#22c6ab" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1ba896")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#22c6ab")
            }
          >
            <Printer className="w-4 h-4" />
            In lịch Word
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
