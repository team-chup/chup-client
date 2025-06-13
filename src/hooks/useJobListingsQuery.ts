import { getJobListings } from "@/api/posting"
import { JobListingsResponse } from "@/types/posting"
import { useQuery } from "@tanstack/react-query"

export const useJobListingsQuery = () => {
  return useQuery<JobListingsResponse>({
    queryKey: ["jobListings"],
    queryFn: getJobListings,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};