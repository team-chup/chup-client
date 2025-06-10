import { instance } from "@/lib/axios"
import { Position } from "@/types/posting"

import { CreateJobPostingRequest, JobListingsResponse, JobPostingDetail } from "@/types/posting"

export interface UpdateJobPostingRequest {
  companyName: string
  companyDescription: string
  companyLocation: string
  employmentType: string
  positions: number[]
  files?: { url: string, name: string }[]
  startAt: string
  endAt: string
}

export const getJobListings = async () => {
  const { data } = await instance.get<JobListingsResponse>("/posting")
  return data
}

export const getJobPostingDetail = async (id: string | number) => {
  const { data } = await instance.get<JobPostingDetail>(`/posting/${id}`)
  return data
}

export const createJobPosting = async (requestData: CreateJobPostingRequest) => {
  const { data } = await instance.post("/posting", requestData)
  return data
}

export const updateJobPosting = async (id: string | number, requestData: UpdateJobPostingRequest) => {
  const { data } = await instance.put(`/posting/${id}`, requestData)
  return data
}

interface PositionsResponse {
  positions: Position[]
}

export const getPositions = async (): Promise<Position[]> => {
  const { data } = await instance.get<PositionsResponse>("/posting/position")
  return data.positions
} 


export const createPosition = async (name: string): Promise<Position> => {
  const { data } = await instance.post<{ id: number, name: string }>("/posting/position", { name })
  return data
}

export const downloadApplications = async (someId: number | string, ids: number[]) => {
  const { data } = await instance.get(`/application/download/${someId}?ids=${ids.join(',')}`)
  return data
}