import { instance } from '@/lib/axios';
import { SignupRequest } from '@/types/auth';

export const signup = async (data: SignupRequest): Promise<void> => {
  const response = await instance.post('/user/signup', data);

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('회원가입에 실패했습니다.');
  }
};
