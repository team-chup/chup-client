import { instance } from "@/lib/axios"
import { JobListingsResponse, JobPostingDetail } from "@/types/posting"

export const getJobListings = async () => {
  const { data } = await instance.get<JobListingsResponse>("/posting")
  return data
}

export const getJobPostingDetail = async (id: string | number) => {
  const { data } = await instance.get<JobPostingDetail>(`/posting/${id}`)
  return data
}