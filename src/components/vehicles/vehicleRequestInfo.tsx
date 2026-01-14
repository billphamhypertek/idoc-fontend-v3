import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Paperclip } from "lucide-react";

export default function VehicleRequestInfo({
  vehicleDetail,
}: {
  vehicleDetail: any;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <Paperclip className="w-4 h-4 text-white" />
          </div>
          Thông tin phiếu xin xe
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Đơn vị:</label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {vehicleDetail.orgName}
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Lý do:</label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {vehicleDetail.reason}
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Số người đi:
            </label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {vehicleDetail.passengerQuantity} người
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Điểm xuất phát:
            </label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {vehicleDetail.startLocation}
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Nơi đón:
            </label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {vehicleDetail.pickUpLocation}
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Nơi đến:
            </label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {vehicleDetail.destination}
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Xuất phát:
            </label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {new Date(vehicleDetail.expectedStartDate!).toLocaleDateString(
                "vi-VN"
              )}
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Người phụ trách:
            </label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border">
              {vehicleDetail.personEnter}
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Tình trạng:
            </label>
            <div className="px-3 py-2 rounded-md">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {vehicleDetail.statusName}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-600">
              Ghi chú:
            </label>
            <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-md border min-h-[40px]">
              {vehicleDetail.note || "Không có ghi chú"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
