"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectCustom from "@/components/common/SelectCustom";
import { CustomDatePicker } from "@/components/ui/calendar";
import { CheckCircle, User } from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import {
  useGetCategoryWithCode,
  useGetUserFlow,
  useGetRealTime,
  useGetJobAssignerList,
  useGetCurrentJobAssigner,
} from "@/hooks/data/task.data";
import { useGetUserAssignTasks } from "@/hooks/data/vehicle.data";
import { useSaveRealTime } from "@/hooks/data/task-action.data";
import { Constant } from "@/definitions/constants/constant";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";
import {
  useGetCurrentJobAssignerV2,
  useGetRealTimeV2,
  useGetUserFlowV2,
} from "@/hooks/data/taskv2.data";

interface TaskBasicInfoSectionProps {
  data: any;
  isEditing: boolean;
  checkUserAssign: () => boolean;
  onSelectUser?: () => void;
  form: UseFormReturn<any>;
  isV2?: boolean;
}

export default function TaskBasicInfoSection({
  data,
  isEditing,
  checkUserAssign,
  onSelectUser,
  form,
  isV2 = false,
}: TaskBasicInfoSectionProps) {
  const { id } = useParams() as { id: string };
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const [jobAssignerCurrent, setJobAssignerCurrent] = useState<any>(null);
  const [jobAssignerList, setJobAssignerList] = useState<any[]>([]);
  const [realStartTime, setRealStartTime] = useState<Date | null>(null);
  const [realEndTime, setRealEndTime] = useState<Date | null>(null);
  const [checkRealTime, setCheckRealTime] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const { data: listCategoryWithCode } = useGetCategoryWithCode(
    Constant.CATEGORYTYPE_CODE.PRIORITY
  );

  const { data: listComplexityWithCode } = useGetCategoryWithCode(
    Constant.CATEGORY_TYPE_CODE.LEVEL_OF_COMPLEXITY
  );

  const orgId = useMemo(() => {
    if (!UserInfo || !data) return 0;

    const userAssign = UserInfo;
    const currentRole = userAssign.currentRole;

    // LĐ Ban (role 58) hoặc Lãnh đạo ĐV (role 59)
    if (currentRole === 58 || currentRole === 59) {
      return userAssign.org;
    }

    return userAssign.orgModel?.parentId || 0;
  }, [UserInfo, data]);

  const { data: listUserFlow } = useGetUserFlow(
    parseInt(id as string) || 0,
    !isV2
  );

  const { data: listUserFlowV2 } = useGetUserFlowV2(
    parseInt(id as string) || 0,
    isV2
  );

  const listUserFlowMerged = isV2 ? listUserFlowV2 : listUserFlow;

  const realTimeUserId = useMemo(() => {
    if (selectedUserId && selectedUserId !== "" && selectedUserId !== null) {
      return parseInt(selectedUserId);
    }
    return UserInfo?.id || 0;
  }, [selectedUserId, UserInfo?.id]);

  const userExistsInFlow = useMemo(() => {
    if (!listUserFlowMerged || !UserInfo?.id) return false;
    return listUserFlowMerged.some((user: any) => user.userId === UserInfo?.id);
  }, [listUserFlowMerged, UserInfo?.id]);

  const shouldFetchRealTime = useMemo(() => {
    if (selectedUserId && selectedUserId !== "" && selectedUserId !== null) {
      return true;
    }
    return userExistsInFlow;
  }, [selectedUserId, userExistsInFlow]);

  const { data: realTimeData } = useGetRealTime(
    parseInt(id as string) || 0,
    realTimeUserId,
    shouldFetchRealTime && realTimeUserId > 0 && !isV2
  );

  const { data: realTimeDataV2 } = useGetRealTimeV2(
    parseInt(id as string) || 0,
    realTimeUserId,
    shouldFetchRealTime && realTimeUserId > 0 && isV2
  );

  const realTimeDataMerged = isV2 ? realTimeDataV2 : realTimeData;

  const saveRealTimeMutation = useSaveRealTime(
    parseInt(id as string) || 0,
    UserInfo?.id || 0,
    realStartTime ? format(realStartTime, "yyyy-MM-dd") : "",
    realEndTime ? format(realEndTime, "yyyy-MM-dd") : "",
    isV2
  );

  useEffect(() => {
    if (listUserFlowMerged) {
      const exists = listUserFlowMerged.some(
        (user: any) => user.userId === UserInfo?.id
      );
      setCheckRealTime(!exists);
    }
  }, [listUserFlowMerged, UserInfo?.id]);

  useEffect(() => {
    if (realTimeDataMerged) {
      setRealEndTime(
        realTimeDataMerged.endDate ? new Date(realTimeDataMerged.endDate) : null
      );
      setRealStartTime(
        realTimeDataMerged.startDate
          ? new Date(realTimeDataMerged.startDate)
          : null
      );
    }
  }, [realTimeDataMerged]);

  const { data: jobAssignerListData } = useGetJobAssignerList(orgId);

  const { data: currentJobAssignerData } = useGetCurrentJobAssigner(
    parseInt(id as string) || 0,
    !isV2
  );

  const { data: currentJobAssignerDataV2 } = useGetCurrentJobAssignerV2(
    parseInt(id as string) || 0,
    isV2
  );

  const currentJobAssignerDataMerged = isV2
    ? currentJobAssignerDataV2
    : currentJobAssignerData;

  useEffect(() => {
    if (jobAssignerListData) {
      setJobAssignerList(jobAssignerListData || []);
    }
  }, [jobAssignerListData]);

  const watchedJobAssignerId = form.watch("jobAssignerId");

  useEffect(() => {
    if (data) {
      if (data.startDate && !startDate) {
        form.setValue("startDate", new Date(data.startDate));
      }
      if (data.endDate && !endDate) {
        form.setValue("endDate", new Date(data.endDate));
      }
    }
  }, [data, form, startDate, endDate]);

  useEffect(() => {
    if (
      currentJobAssignerDataMerged &&
      currentJobAssignerDataMerged.length > 0
    ) {
      const leader = currentJobAssignerDataMerged[0];
      setJobAssignerCurrent({
        id: leader.userId,
        name: `${leader.fullName} --- ${leader.positionName}`,
        expanded: false,
        hasChild: false,
      });

      if (
        !watchedJobAssignerId ||
        watchedJobAssignerId === 0 ||
        (Array.isArray(watchedJobAssignerId) &&
          watchedJobAssignerId.length === 0)
      ) {
        form.setValue("jobAssignerId", leader.userId);
      }
    }
  }, [currentJobAssignerDataMerged, form, watchedJobAssignerId]);

  const onUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedUserId(selectedValue === "" ? null : selectedValue);
    if (!selectedValue) {
      setRealEndTime(null);
      setRealStartTime(null);
    }
  };

  const saveRealTime = async () => {
    if (!realStartTime || !realEndTime) {
      ToastUtils.error("Chưa chọn thời gian bắt đầu hoặc thời gian kết thúc");
      return;
    }
    const result = await saveRealTimeMutation.mutateAsync();

    if (result) {
      ToastUtils.success("Cập nhật thời gian thực tế thành công");
    } else {
      ToastUtils.error("Cập nhật thời gian thực tế thất bại");
    }
  };

  const canEdit = isEditing && checkUserAssign();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="col-span-full">
          <FormField
            control={form.control}
            name="taskName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md font-bold">
                  Tên công việc
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    readOnly={!canEdit}
                    maxLength={canEdit ? 1000 : undefined}
                    placeholder={canEdit ? "Tên công việc" : undefined}
                    className={`resize-none text-md focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {Constant.SHOW_WORK_EDITOR_ON_TASK_BCY_129 && (
          <div className="col-span-full lg:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="wordEditor" className="text-md font-bold">
                Văn bản soạn thảo
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select disabled={!isEditing}>
                <SelectTrigger className="text-md">
                  <SelectValue placeholder="Chọn văn bản soạn thảo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Tùy chọn 1</SelectItem>
                  <SelectItem value="option2">Tùy chọn 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="col-span-full">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md font-bold">Mô tả</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    readOnly={!canEdit}
                    placeholder={canEdit ? "Mô tả" : undefined}
                    className={`resize-none text-md focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef]" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-full lg:col-span-2">
          <FormField
            control={form.control}
            name="priorityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md font-bold">
                  Nhóm công việc
                </FormLabel>
                <FormControl>
                  <SelectCustom
                    options={[
                      { label: "----Chọn----", value: null },
                      ...(listCategoryWithCode?.map((item: any) => ({
                        label: item.name,
                        value: item.id,
                      })) || []),
                    ]}
                    value={field.value || null}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    placeholder="Nhóm công việc"
                    className={`text-sm font-normal focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef] disabled:opacity-100" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-full lg:col-span-2">
          <FormField
            control={form.control}
            name="complexityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md font-bold">
                  Mức độ phức tạp
                </FormLabel>
                <FormControl>
                  <SelectCustom
                    options={[
                      { label: "----Chọn----", value: null },
                      ...(listComplexityWithCode?.map((item: any) => ({
                        label: item.name,
                        value: item.id,
                      })) || []),
                    ]}
                    value={field.value || null}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    placeholder="Mức độ phức tạp"
                    className={`text-sm font-normal focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef] disabled:opacity-100" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-full lg:col-span-1">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-md font-bold">
              Ngày bắt đầu
            </Label>
            <CustomDatePicker
              selected={startDate || null}
              onChange={(date) => form.setValue("startDate", date || null)}
              placeholder="Chọn ngày bắt đầu"
              readOnly={!canEdit}
              className={`${!canEdit ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
            />
          </div>
        </div>

        <div className="col-span-full lg:col-span-1">
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-md font-bold">
              Ngày kết thúc
            </Label>
            <CustomDatePicker
              selected={endDate || null}
              onChange={(date) => form.setValue("endDate", date || null)}
              placeholder="Chọn ngày kết thúc"
              readOnly={!canEdit}
              className={`${!canEdit ? "bg-[#e9ecef] hover:bg-[#e9ecef] disabled:opacity-100" : ""}`}
            />
          </div>
        </div>

        <div className="col-span-full lg:col-span-1">
          <FormField
            control={form.control}
            name="userAssignName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md font-bold">
                  Người giao việc
                </FormLabel>
                <FormControl>
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-r-none"
                      onClick={onSelectUser}
                      disabled={!canEdit}
                    >
                      <User className="w-4 h-4" />
                    </Button>
                    <Input
                      {...field}
                      readOnly
                      placeholder="Người giao việc"
                      className={`rounded-l-none border-l-0 text-md focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef] disabled:opacity-100" : ""}`}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-full lg:col-span-1">
          <FormField
            control={form.control}
            name="jobAssignerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-md font-bold">
                  Lãnh đạo chỉ đạo
                </FormLabel>
                <FormControl>
                  <SelectCustom
                    options={[
                      { label: "----Chọn----", value: null },
                      ...(jobAssignerList?.map((item: any) => ({
                        label: `${item.fullName} --- ${item.positionName}`,
                        value: item.id,
                      })) || []),
                    ]}
                    value={field.value || jobAssignerCurrent?.userId || null}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    placeholder="Lãnh đạo chỉ đạo"
                    className={`text-sm font-normal focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef] disabled:opacity-100" : ""}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {(checkRealTime &&
          listUserFlowMerged &&
          listUserFlowMerged.length > 0) ||
        (!checkRealTime && data?.status != 1) ? (
          <div className="col-span-full lg:col-span-1">
            <div className="space-y-2">
              <Label className="text-md font-bold">
                Thời gian bắt đầu thực tế
              </Label>
              <Input
                value={realStartTime ? format(realStartTime, "dd/MM/yyyy") : ""}
                readOnly
                placeholder={
                  realStartTime ? format(realStartTime, "dd/MM/yyyy") : ""
                }
                className={`text-md focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef]" : "bg-gray-200"}`}
              />
            </div>
          </div>
        ) : !checkRealTime && data?.status == 1 ? (
          <div className="col-span-full lg:col-span-1">
            <div className="space-y-2">
              <Label className="text-md font-bold">
                Thời gian bắt đầu thực tế
              </Label>
              <CustomDatePicker
                selected={realStartTime}
                onChange={(date) => setRealStartTime(date || null)}
                placeholder="Chọn thời gian bắt đầu"
              />
            </div>
          </div>
        ) : null}

        {(checkRealTime &&
          listUserFlowMerged &&
          listUserFlowMerged.length > 0) ||
        (!checkRealTime && data?.status != 1) ? (
          <div className="col-span-full lg:col-span-1">
            <div className="space-y-2">
              <Label className="text-md font-bold">
                Thời gian kết thúc thực tế
              </Label>
              <Input
                value={realEndTime ? format(realEndTime, "dd/MM/yyyy") : ""}
                readOnly
                placeholder={
                  realEndTime ? format(realEndTime, "dd/MM/yyyy") : ""
                }
                className={`text-md focus-visible:ring-0 ${!canEdit ? "bg-[#e9ecef]" : "bg-gray-200"}`}
              />
            </div>
          </div>
        ) : !checkRealTime && data?.status == 1 ? (
          <div className="col-span-full lg:col-span-1">
            <div className="space-y-2">
              <Label className="text-md font-bold">
                Thời gian kết thúc thực tế
              </Label>
              <CustomDatePicker
                selected={realEndTime}
                onChange={(date) => setRealEndTime(date || null)}
                placeholder="Chọn thời gian kết thúc"
              />
            </div>
          </div>
        ) : null}

        {checkRealTime &&
        listUserFlowMerged &&
        listUserFlowMerged.length > 0 ? (
          <div className="col-span-full lg:col-span-1">
            <div className="space-y-2">
              <Label className="text-md font-bold">Người thực hiện</Label>
              <SelectCustom
                options={[
                  { label: "----Chọn----", value: null },
                  ...(listUserFlowMerged?.map((item: any) => ({
                    label: item.fullName,
                    value: item.userId.toString(),
                  })) || []),
                ]}
                value={selectedUserId || ""}
                onChange={(value) => onUserChange({ target: { value } } as any)}
                placeholder="Chọn người thực hiện"
                className="text-md font-normal"
              />
            </div>
          </div>
        ) : null}

        {!checkRealTime && data?.status == 1 ? (
          <div className="col-span-full lg:col-span-1">
            <div className="space-y-2">
              <Label className="text-md font-bold">&nbsp;</Label>
              <Button
                type="button"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={saveRealTime}
              >
                <CheckCircle className="w-4 h-4" />
                Cập nhật thời gian thực tế
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
