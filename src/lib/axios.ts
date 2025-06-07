import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { authConfig } from './config/auth';
import { setCookie, removeCookie } from './cookie';

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 500; 

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      _retryCount?: number;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = 0;

      const attemptRefreshToken = async (retryCount: number): Promise<AxiosResponse> => {
        try {
          const refreshToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('refreshToken='))
            ?.split('=')[1];

          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await instance.post<{ token: string }>('/auth/refresh', null, {
            headers: {
              RefreshToken: refreshToken
            }
          });

          const { token } = response.data;
          setCookie('accessToken', token);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        } catch (error) {
          if (retryCount < MAX_RETRY_COUNT) {
            console.log(`attempt ${retryCount + 1}`);
            await sleep(RETRY_DELAY);
            return attemptRefreshToken(retryCount + 1);
          }
          throw error;
        }
      };

      try {
        return await attemptRefreshToken(0);
      } catch (error) {
        removeCookie('accessToken');
        removeCookie('refreshToken');
        window.location.href = authConfig.signInPage;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
); 