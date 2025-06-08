import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/user";
import { UserProfile } from "@/types/user";

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시 데이터를 'fresh'하다고 간주
    gcTime: 1000 * 60 * 30, // 30분 동안 캐시 유지
    refetchOnMount: false, // 컴포넌트가 마운트될 때마다 refetch하지 않음
    refetchOnWindowFocus: false, // 윈도우가 포커스를 받을 때마다 refetch하지 않음
  });
}; 