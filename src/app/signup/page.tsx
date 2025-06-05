'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SignupRequest } from '@/types/auth';
import { instance } from '@/lib/axios';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupRequest>({
    name: '',
    email: '',
    studentNumber: '',
    phoneNumber: '',
    resume: {
      name: '',
      type: 'LINK',
      url: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];
      
      const { data } = await instance.post('/user/signup', {
        header: {
          Authorization: accessToken
        },
        body: formData
      });

      if (data) {
        router.push('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('resume.')) {
      const resumeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        resume: {
          ...prev.resume,
          [resumeField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">
                학번
              </label>
              <Input
                id="studentNumber"
                name="studentNumber"
                type="text"
                required
                value={formData.studentNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="resume.name" className="block text-sm font-medium text-gray-700">
                이력서 이름
              </label>
              <Input
                id="resume.name"
                name="resume.name"
                type="text"
                required
                value={formData.resume.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="resume.url" className="block text-sm font-medium text-gray-700">
                이력서 URL
              </label>
              <Input
                id="resume.url"
                name="resume.url"
                type="url"
                required
                value={formData.resume.url}
                onChange={handleChange}
              />
            </div>

            <div>
              <Button type="submit" className="w-full">
                가입하기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}