import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";
import { queryKeys } from "@/definitions";
import { User } from "@/definitions/types/user.type";

export const useGetUserByUserName = (userName: string | null) => {
  return useQuery({
    queryKey: [queryKeys.users.getByUserName, userName],
    queryFn: () => {
      const formData = new FormData();
      formData.append("userName", userName!);
      return UserService.findByUserName(formData);
    },
    enabled: !!userName,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddUser = () => {
  return useMutation({
    mutationFn: (user: User) => UserService.addUser(user),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => UserService.updateUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.profile.detail],
      });
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
  });
};

export const useGetUserByToken = () => {
  return useMutation({
    mutationFn: (user: User) => UserService.getUserByToken(user),
  });
};

export const useGetSecretarys = () => {
  return useQuery({
    queryKey: [queryKeys.users.secretarys],
    queryFn: () => UserService.getSecretarys(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: [queryKeys.users.all],
    queryFn: () => UserService.getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });
};
