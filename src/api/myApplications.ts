import { instance } from "@/lib/axios";
import { ApplicationsResponse } from "@/types/application";

export const getMyApplications = async (): Promise<ApplicationsResponse> => {
  const { data } = await instance.get<ApplicationsResponse>("/application/me");
  return data;
};

export const getApplicationById = async (id: number) => {
  const { data } = await instance.get(`/application/${id}`);
  return data;
};
