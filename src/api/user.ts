import { instance } from '../lib/axios';
import { UserProfile } from '@/types/user';

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await instance.get<UserProfile>('/user/me');
  return response.data;
}; 

export const updateUserProfile = async (data: UserProfile): Promise<void> => {
  const response = await instance.put('/user/me', data);
  return response.data;
}