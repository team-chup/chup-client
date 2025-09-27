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

export const deleteJobPosting = async (postingId: string) => {
  await instance.delete(`/posting/${postingId}`)
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
  const response = await instance.get(`/application/download/${someId}?ids=${ids.join(',')}`, {
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'];
  let filename = '이력서_링크_모음.zip';
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1]);
    }
  }
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
  
  return response.data;
}