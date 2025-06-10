import { useQuery } from "@tanstack/react-query"
import { getJobPostingDetail } from "@/api/posting"

export const useJobPostingQuery = (id: string) => {
  return useQuery({
    queryKey: ["posting", id],
    queryFn: () => getJobPostingDetail(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
} 