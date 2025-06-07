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
    return handleTokenRefresh(error);
  },
); 