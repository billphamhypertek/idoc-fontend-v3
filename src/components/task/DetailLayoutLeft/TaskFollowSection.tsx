"use client";

import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User } from "lucide-react";
import FollowerDialog from "@/components/dialogs/FollowerDialog";
import { useGetListUserFollow } from "@/hooks/data/task.data";
import { OrgNode, UserFollower } from "@/definitions/types/task-assign.type";
import { useGetListUserFollowV2 } from "@/hooks/data/taskv2.data";

interface TaskFollowSectionProps {
  data: any;
  isEditing: boolean;
  checkUserAssign: () => boolean;
  form: UseFormReturn<any>;
  taskId: number;
  isV2?: boolean;
}

export default function TaskFollowSection({
  data,
  isEditing,
  checkUserAssign,
  form,
  taskId,
  isV2 = false,
}: TaskFollowSectionProps) {
  const [selectedFollowers, setSelectedFollowers] = useState<UserFollower[]>(
    []
  );
  const [userFollowsText, setUserFollowsText] = useState("");
  const [isUserFollowOpen, setIsUserFollowOpen] = useState(false);

  const { data: listUserFollow } = useGetListUserFollow(
    taskId.toString(),
    !isV2
  );

  const { data: listUserFollowV2 } = useGetListUserFollowV2(
    taskId.toString(),
    isV2
  );

  const listUserFollowMerged = isV2 ? listUserFollowV2 : listUserFollow;

  useEffect(() => {
    if (!Array.isArray(listUserFollowMerged)) {
      return;
    }

    const followerArray = listUserFollowMerged as UserFollower[];
    setSelectedFollowers(followerArray);

    const names = followerArray
      .map(
        (follower: UserFollower) =>
          follower.fullName ?? follower.user?.fullName ?? ""
      )
      .filter((name): name is string => name.length > 0)
      .join(", ");
    setUserFollowsText(names);

    const currentFormValue = form.getValues("userFollows");
    if (
      !currentFormValue ||
      (Array.isArray(currentFormValue) && currentFormValue.length === 0)
    ) {
      form.setValue("userFollows", followerArray);
    }
  }, [taskId, listUserFollowMerged, form]);

  const transformFollowers = (followers: OrgNode[]): UserFollower[] => {
    if (!Array.isArray(followers)) {
      return [];
    }

    return followers
      .filter((follower) => follower.type === "USER")
      .map((follower) => {
        const numericId = Number(follower.id);
        const normalizedId = Number.isNaN(numericId) ? follower.id : numericId;
        const followerName = follower.name ?? follower.userName ?? "";
        const numericParentId =
          follower.parentId != null ? Number(follower.parentId) : null;
        const parentIdValue =
          numericParentId != null && !Number.isNaN(numericParentId)
            ? numericParentId
            : null;

        return {
          user: {
            id: normalizedId,
            fullName: followerName,
            positionName: follower.positionName ?? null,
            orgName: follower.orgName ?? null,
          },
          type: 0,
          isExcute: follower.isExcute ?? false,
          isCombination: follower.isCombination ?? false,
          status: 0,
          userId: normalizedId,
          id: normalizedId,
          taskId: null,
          description: follower.description ?? null,
        } as UserFollower;
      });
  };

  const handleFollowersSelect = (followers: OrgNode[]) => {
    const normalizedFollowers = transformFollowers(followers);
    setSelectedFollowers(normalizedFollowers);

    const names = normalizedFollowers
      .map(
        (follower: UserFollower) =>
          follower.fullName || follower.user?.fullName || ""
      )
      .filter((name): name is string => Boolean(name))
      .join(", ");
    setUserFollowsText(names);

    form.setValue("userFollows", normalizedFollowers);
  };

  const handleSelectUserFollow = () => {
    if (!canEdit) return;
    setIsUserFollowOpen(true);
  };

  const canEdit = isEditing && checkUserAssign();

  return (
    <div className="col-span-full">
      <FormField
        control={form?.control}
        name="userFollows"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-md font-bold">Người theo dõi</FormLabel>
            <FormControl>
              <div className="flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-none min-h-[60px]"
                  onClick={handleSelectUserFollow}
                  disabled={!canEdit}
                >
                  <User className="w-4 h-4" />
                </Button>
                <Textarea
                  {...field}
                  readOnly
                  rows={1}
                  placeholder="Người theo dõi"
                  className="rounded-l-none border-l-0 resize-none text-md min-h-[60px] bg-[#e9ecef]"
                  value={userFollowsText}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FollowerDialog
        isOpen={isUserFollowOpen}
        onClose={() => setIsUserFollowOpen(false)}
        isFollow={true}
        taskId={taskId}
        selectedWorkItem={{ id: taskId }}
        initialFollowers={selectedFollowers}
        onConfirm={handleFollowersSelect}
        isV2={isV2}
      />
    </div>
  );
}
