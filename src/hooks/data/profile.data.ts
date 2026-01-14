import { queryKeys } from "@/definitions";
import {
  ProfileResponse,
  ProfileService,
  ProfileUpdateRequest,
} from "@/services/profile.service";
import { UserService } from "@/services/user.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetProfile = () => {
  return useQuery<ProfileResponse>({
    queryKey: [queryKeys.profile.detail],
    queryFn: () => UserService.getProfile(),
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};
export const useGetProfileEdit = () => {
  return useQuery({
    queryKey: [queryKeys.profile.detail],
    queryFn: () => UserService.getProfile(),
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileData: ProfileUpdateRequest) =>
      ProfileService.updateUser(profileData.id, profileData, false),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.profile.detail],
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => UserService.changePassword(currentPassword, newPassword),
    onError: (error) => {
      console.error("Error changing password:", error);
    },
  });
};
