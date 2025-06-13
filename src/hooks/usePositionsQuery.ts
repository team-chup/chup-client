import { getPositions } from "@/api/posting"
import { Position } from "@/types/posting"
import { useQuery } from "@tanstack/react-query"

export const usePositionsQuery = () => {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: getPositions,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}; 