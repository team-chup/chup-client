import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/api/user";
import { UserProfile } from "@/types/user";
import { toast } from "sonner";

export const useProfileMutation = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data: UserProfile) => {
      const response = await updateUserProfile(data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['profile'], variables);
      toast.success('프로필이 업데이트되었습니다.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('프로필 업데이트에 실패했습니다.');
    }
  });

  return {
    updateProfile,
    isUpdating
  };
}; 