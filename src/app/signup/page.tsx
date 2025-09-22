'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import UserForm from '@/components/UserForm';
import { SignupRequest } from '@/types/auth';
import { signup } from '@/api/signup';
import { toast } from 'sonner';
import { signupSchema } from '@/schemas/user';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupRequest>({
    name: '',
    email: '',
    studentNumber: '',
    phoneNumber: '',
    resume: undefined,
    portfolio: undefined
  });

  const isFormValid = () => {
    const result = signupSchema.safeParse(formData);
    return result.success;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'resumeUrl') {
      setFormData(prev => ({
        ...prev,
        resume: value.trim() ? { name: 'LINK', url: value } : undefined
      }));
    } else if (name === 'portfolioUrl') {
      setFormData(prev => ({
        ...prev,
        portfolio: value.trim() ? { name: 'LINK', url: value } : undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.errors;
      if (errors.length > 0) {
        toast.error(errors[0].message);
        return;
      }
    }
    
    try {
      await signup(formData);
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <UserForm formData={formData} onChange={handleChange} />

            <div>
              <Button 
                type="submit" 
                variant="outline" 
                className="w-full"
                disabled={!isFormValid()}
              >
                가입하기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}