import { instance } from "@/lib/axios";
import { ApplicationsResponse, ResultRequest, ResultStatus } from "@/types/application";

export const getMyApplications = async (): Promise<ApplicationsResponse> => {
  const { data } = await instance.get<ApplicationsResponse>("/application/me");
  return data;
};

export const getApplicationById = async (id: number) => {
  const { data } = await instance.get(`/application/${id}`);
  return data;
};

export const announceResult = async (id: number, resultData: ResultRequest) => {
  const { data } = await instance.post(`/announce/${id}`, resultData);
  return data;
};