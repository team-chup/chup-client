'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ResumeUpload from '@/components/ResumeUpload';
import UserForm from '@/components/UserForm';
import { SignupRequest } from '@/types/auth';
import { signup } from '@/api/signup';
import useFileUpload from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { signupSchema } from '@/schemas/user';

const ALLOWED_EXTENSIONS = [
  'pdf', 'jpeg', 'jpg', 'png', 'xls', 'xlsx', 'xlsm',
  'hwp', 'hwpx', 'hwt', 'ppt', 'pptx', 'zip'
];

export default function SignupPage() {
  const router = useRouter();
  const { uploadFile } = useFileUpload();
  const [resumeType, setResumeType] = useState<'PDF' | 'LINK'>('LINK');
  const [resumeLink, setResumeLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
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

  const isFormValid = () => {
    if (isUploading) return false;
    
    const result = signupSchema.safeParse(formData);
    return result.success;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;



    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast.error('지원하지 않는 확장자입니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    
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
      toast.success('이력서가 업로드되었습니다.');
    } catch (error) {
      toast.error('파일 업로드에 실패했습니다.');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeTypeChange = (type: 'PDF' | 'LINK') => {
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
        name: 'LINK',
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

            <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
              이력서
            </label>
            <ResumeUpload
              resumeType={resumeType}
              resumeLink={resumeLink}
              selectedFile={selectedFile}
              onResumeTypeChange={handleResumeTypeChange}
              onResumeLinkChange={handleResumeLinkChange}
              onFileChange={handleFileChange}
              onFileClear={handleFileClear}
              isUploading={isUploading}
              currentResume={formData.resume}
            />

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