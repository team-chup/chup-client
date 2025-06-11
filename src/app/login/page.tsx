'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { instance } from '@/lib/axios';
import { LoginResponse } from '@/types/auth';
import { setCookie } from '@/lib/cookie';
import { toast } from 'sonner';
import Image from 'next/image';
import GoogleLogo from '@/assets/GoogleLogo';
import Logo from '@/assets/images/Logo.png';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/'; 

  const isAllowedEmail = (email: string) => {
    if (email.endsWith('@gsm.hs.kr')) return true;
    
    const allowedEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [];
    if (allowedEmails.includes(email)) return true;
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        if (!isAllowedEmail(userInfo.email)) {
          toast.error('허용된 계정으로만 로그인이 가능합니다.');
          return;
        }

        const response = await instance.post<LoginResponse>('/auth/login', {
          oauthToken: tokenResponse.access_token
        });
        
        const { data } = response;
        
        if (!data.accessToken || !data.refreshToken) {
          console.error('토큰이 제대로 발급되지 않았습니다.');
          return;
        }

        setCookie('accessToken', data.accessToken);
        setCookie('refreshToken', data.refreshToken);
        
        let nextPage = '/';
        if (data.authority === 'TEMP') {
          nextPage = '/signup';
        } else if (redirectTo !== '/admin/main' || '/main') {
          nextPage = redirectTo;
        } else if (data.authority === 'TEACHER') {
          nextPage = '/admin/main';
        }
        router.push(nextPage);

      } catch (error: any) {
        console.error('로그인 오류:', error);
        console.error('에러 응답:', error.response?.data);
        toast.error('로그인 중 오류가 발생했습니다.');
      }
    },
    onError: () => {
      console.error('Google 로그인 실패');
      toast.error('Google 로그인에 실패했습니다.');
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative w-[200px] h-[200px]">
            <Image
              src={Logo}
              alt="CHUP.today Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
            CHUP.today
          </h2>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => login()}
            variant="outline"
            className="w-full flex items-center justify-center py-6"
          >
            <GoogleLogo />
            <span>GSM 계정으로 로그인</span>
          </Button>
        </div>
      </div>
    </div>
  );
}