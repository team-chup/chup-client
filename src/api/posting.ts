import { instance } from "@/lib/axios"
import { JobListingsResponse } from "@/types/posting"

export const getJobListings = async () => {
  const { data } = await instance.get<JobListingsResponse>("/posting")
  return data
}