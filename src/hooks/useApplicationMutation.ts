import { useMutation } from "@tanstack/react-query";
import { instance } from "@/lib/axios";

interface ApplicationRequest {
  positionId: number;
  postingId: string;
}

export const useApplicationMutation = () => {
  return useMutation({
    mutationFn: async (data: ApplicationRequest) => {
      const response = await instance.post(`/application/apply/${data.postingId}`, {
        positionId: data.positionId
      });
      return response.data;
    },
  });
}; 