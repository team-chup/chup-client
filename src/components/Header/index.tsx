"use client"

import { useState, useEffect } from "react"
import { Building2, Menu, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { instance } from '@/lib/axios';
import { LoginResponse } from '@/types/auth';
import { setCookie, removeCookie } from '@/lib/cookie';
import { toast } from "sonner";

interface HeaderProps {
  isAdmin?: boolean
  currentPage?: string
  userName?: string
}

export function Header({ isAdmin = false, currentPage = "" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];
      
      setIsAuthenticated(!!token);
    };

    checkAuth();
    
    const intervalId = setInterval(checkAuth, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await instance.post<LoginResponse>('/auth/login', {
          oauthToken: tokenResponse.access_token
        });
        
        const { data } = response;
        
        if (!data.accessToken || !data.refreshToken) {
          toast.error('토큰이 제대로 발급되지 않았습니다.');
          return;
        }

        setCookie('accessToken', data.accessToken);
        setCookie('refreshToken', data.refreshToken);
        
        const savedAccessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];
        
        if (!savedAccessToken) {
          toast.error('토큰이 쿠키에 저장되지 않았습니다.');
          return;
        }

        const nextPage = data.authority === 'TEMP' ? '/signup' : '/';
        router.push(nextPage);

      } catch (error: any) {
        console.error( error);
        console.error('에러 응답:', error.response?.data);
      }
    },
    onError: () => {
      console.error('Google 로그인 실패');
    }
  });

  const handleLogout = () => {
    googleLogout();
    removeCookie('accessToken');
    removeCookie('refreshToken');
    router.push('/login');
  }

  const handleAuth = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      login();
    }
  }

  const studentNavItems = [
    { name: "채용공고", href: "/", key: "jobs" },
    { name: "지원현황", href: "/applications", key: "applications" },
    { name: "프로필", href: "/profile", key: "profile" },
  ]

  const adminNavItems = [
    { name: "대시보드", href: "/admin", key: "dashboard" },
    { name: "학생 관리", href: "/admin/students", key: "students" },
    { name: "통계", href: "/admin/analytics", key: "analytics" },
  ]

  const navItems = isAdmin ? adminNavItems : studentNavItems

  const isCurrentPage = (key: string) => {
    return currentPage === key
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CHUP.today</span>
              {/* {isAdmin && (
                <Badge variant="outline" className="text-blue-700 border-blue-200">
                  관리자
                </Badge>
              )} */}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`${
                  isCurrentPage(item.key) ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </a>
            ))}

            {isAdmin && (
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                공고 등록
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleAuth}>
              {isAuthenticated ? '로그아웃' : '로그인'}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
            <nav className="flex flex-col space-y-4 py-4">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 ${
                    isCurrentPage(item.key) ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </a>
              ))}

              <div className="px-4">
                {isAdmin && (
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full mb-2">
                    <Plus className="h-4 w-4 mr-2" />
                    공고 등록
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={handleAuth}>
                  {isAuthenticated ? '로그아웃' : '로그인'}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
