import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { handleTokenRefresh } from '../api/refresh';

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const TIMEOUT = 10_000;

export const instance = axios.create({
  baseURL,
  timeout: TIMEOUT,
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
    } else {
      console.error(config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('[Axios] 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    console.error(error.config?.method?.toUpperCase(), error.config?.url, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return handleTokenRefresh(error);
  },
); 