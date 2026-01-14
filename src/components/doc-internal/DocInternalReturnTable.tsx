"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReturnItem = {
  userFullName?: string;
  createDate?: string;
  comment?: string;
};

type DocInternalReturnTableProps = {
  listReturn?: ReturnItem[];
};

const DocInternalReturnTable: React.FC<DocInternalReturnTableProps> = ({
  listReturn = [],
}) => {
  if (!listReturn || listReturn.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Thông tin trả lại</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead style={{ backgroundColor: "#E6F1FC" }}>
              <tr>
                <th className="border px-3 py-2 text-center w-12">#</th>
                <th className="border px-3 py-2 text-center w-1/3">
                  Người trả lại
                </th>
                <th className="border px-3 py-2 text-center">Nội dung</th>
              </tr>
            </thead>
            <tbody>
              {listReturn.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">
                    <i className="fa fa-comment text-blue-500" />
                  </td>
                  <td className="border px-3 py-2">
                    <span>{item.userFullName}</span>
                  </td>
                  <td className="border px-3 py-2">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-semibold mr-2">
                          {item.userFullName}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {item.createDate
                            ? new Date(item.createDate).toLocaleString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </span>
                      </div>
                      <div className="text-gray-800">{item.comment}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocInternalReturnTable;
