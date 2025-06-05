'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ResumeUpload from '@/components/ResumeUpload';
import UserForm from '@/components/UserForm';
import { SignupRequest } from '@/types/auth';
import { instance } from '@/lib/axios';
import useFileUpload from '@/hooks/useFileUpload';
import { toast } from 'sonner';

type ResumeType = 'PDF' | 'LINK';

export default function SignupPage() {
  const router = useRouter();
  const { uploadFile } = useFileUpload();
  const [resumeType, setResumeType] = useState<ResumeType>('LINK');
  const [resumeLink, setResumeLink] = useState('');
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({
        ...prev,
        resume: {
          name: file.name,
          type: 'PDF',
          url: url
        }
      }));
    } catch (error) {
      toast.error('파일 업로드에 실패했습니다.');
    }
  };

  const handleResumeTypeChange = (type: ResumeType) => {
    setResumeType(type);
    setFormData(prev => ({
      ...prev,
      resume: {
        name: '',
        type: type,
        url: type === 'LINK' ? resumeLink : ''
      }
    }));
  };

  const handleResumeLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setResumeLink(link);
    setFormData(prev => ({
      ...prev,
      resume: {
        name: '외부 이력서 링크',
        type: 'LINK',
        url: link
      }
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!accessToken) {
        return;
      }
      
      const response = await instance.post('/user/signup', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        console.log('회원가입 성공:', response.data);
        router.push('/');
      } else {
        console.error('회원가입 실패:', response);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      resume: {
        name: '',
        type: 'PDF',
        url: ''
      }
    }));
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
            
            <ResumeUpload
              resumeType={resumeType}
              resumeLink={resumeLink}
              selectedFile={selectedFile}
              onResumeTypeChange={handleResumeTypeChange}
              onResumeLinkChange={handleResumeLinkChange}
              onFileChange={handleFileChange}
              onFileClear={handleFileClear}
            />

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