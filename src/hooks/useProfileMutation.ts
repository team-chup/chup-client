import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/api/user";
import { UserProfile } from "@/types/user";

export const useProfileMutation = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data: UserProfile) => {
      const response = await updateUserProfile(data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['profile'], variables);
    },
    onError: (error) => {
      console.error(error);
    }
  });

  return {
    updateProfile,
    isUpdating
  };
}; 