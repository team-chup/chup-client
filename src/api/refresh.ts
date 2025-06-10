import { AxiosError } from 'axios';
import axios from 'axios';
import { instance } from '../lib/axios';
import { authConfig } from '../lib/config/auth';
import { setCookie, removeCookie } from '../lib/cookie';
import { baseURL } from '../lib/axios';

const TIMEOUT = 10_000;

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

export const logout = () => {
  isRefreshing = false;
  refreshSubscribers = [];
  removeCookie('accessToken');
  removeCookie('refreshToken');
  console.log('[토큰 재발급] 로그아웃 처리됨');
  // window.location.href = authConfig.signInPage; // 주석 처리: 리디렉션 방지
};

// 쿠키에서 특정 이름의 값을 추출하는 함수
const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) {
      const endIndex = part.indexOf(';');
      return endIndex !== -1 ? part.substring(0, endIndex) : part;
    }
  }
  return null;
};

export const handleTokenRefresh = async (error: AxiosError) => {
  const originalRequest = error.config;
    
  if (!originalRequest) {
    return Promise.reject(error);
  }

  if (originalRequest.url === '/auth/refresh') {
    return Promise.reject(error);
  }

  if (error.response?.status === 401) {
    
    if (isRefreshing) {
      try {
        const token = await new Promise<string>((resolve, reject) => {
          refreshSubscribers.push(resolve);
          setTimeout(() => {
            reject(new Error('Refresh token timeout'));
          }, TIMEOUT);
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (err) {
        console.log(err);
        return Promise.reject(err);
      }
    }

    isRefreshing = true;

    try {
      const refreshToken = getCookieValue('refreshToken');

      const response = await axios.post<TokenResponse>(`${baseURL}/auth/refresh`, null, {
        headers: {
          'Content-Type': 'application/json',
          RefreshToken: refreshToken
        },
        timeout: TIMEOUT
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      setCookie('accessToken', accessToken);
      setCookie('refreshToken', newRefreshToken);

      isRefreshing = false;
      onRefreshed(accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return instance(originalRequest);
    } catch (error) {
      console.error(error);
      isRefreshing = false;
      
      logout();
      
      return Promise.reject(new Error('Token refresh failed'));
    }
  }

  return Promise.reject(error);
};
