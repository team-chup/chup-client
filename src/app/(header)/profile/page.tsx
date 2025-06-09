"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Save, Edit, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Resume } from "@/types/user"
import { Authority } from "@/types/auth"
import { toast } from "sonner"
import ResumeUpload from "@/components/ResumeUpload"
import { profileSchema } from "@/schemas/user"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfileQuery } from "@/hooks/useProfileQuery"
import { useProfileMutation } from "@/hooks/useProfileMutation"
import { updateUserResume } from "@/api/user"
import { useQueryClient } from '@tanstack/react-query';
import { Label } from "@/components/ui/label"

type UserProfileWithResume = {
  name: string;
  email: string;
  studentNumber: string;
  phoneNumber: string;
  authority: Authority;
  resume?: Resume;
};

const REQUIRED_FIELDS = ['name', 'studentNumber', 'email', 'phoneNumber'] as const;

type RequiredField = typeof REQUIRED_FIELDS[number];

interface ProfileFormData {
  name: string;
  studentNumber: string;
  email: string;
  phoneNumber: string;
  resume?: {
    name: string;
    type: 'PDF' | 'LINK';
    url: string;
    size?: number;
  };
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [shakingFields, setShakingFields] = useState<string[]>([])
  const { data: profile, isLoading } = useProfileQuery()
  const { updateProfile, isUpdating } = useProfileMutation()
  const shakeAnimation = "animate-shake"
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    studentNumber: '',
    email: '',
    phoneNumber: '',
    resume: undefined
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        studentNumber: profile.studentNumber || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        resume: (profile as UserProfileWithResume).resume
      });
    }
  }, [profile]);

  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (shakingFields.includes(field as RequiredField)) {
      setShakingFields(prev => prev.filter(f => f !== field));
    }
  }, [shakingFields]);

  const handleResumeChange = useCallback(async (resume: ProfileFormData['resume']) => {
    if (!resume) return;
    
    try {
      await updateUserResume(resume);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setFormData(prev => ({
        ...prev,
        resume
      }));
    } catch (error) {
      console.error(error);
      toast.error('이력서 저장에 실패했습니다.');
    }
  }, [queryClient]);

  const validateFormWithSchema = useCallback(() => {
    const result = profileSchema.safeParse({
      name: formData.name,
      studentNumber: formData.studentNumber,
      email: formData.email,
      phoneNumber: formData.phoneNumber
    });
    
    if (!result.success) {
      const formattedErrors = result.error.format();
      const invalidFields: RequiredField[] = [];
      const errorMessages: string[] = [];
      
      REQUIRED_FIELDS.forEach(field => {
        if (formattedErrors[field]?._errors.length) {
          invalidFields.push(field);
          errorMessages.push(formattedErrors[field]?._errors[0]);
        }
      });
      
      return { isValid: false, invalidFields, errorMessages };
    }
    
    return { isValid: true, invalidFields: [], errorMessages: [] };
  }, [formData]);

  const handleSave = useCallback(async () => {
    const { isValid, invalidFields, errorMessages } = validateFormWithSchema();
    
    if (!isValid) {
      setShakingFields(invalidFields);
      errorMessages.forEach(message => {
        toast.error(message, {
          duration: 3000,
          style: { maxWidth: '500px' }
        });
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (profile) {
        await updateProfile({
          ...profile,
          name: formData.name,
          studentNumber: formData.studentNumber,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('프로필이 저장되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error( error);
      toast.error('프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateFormWithSchema, profile, queryClient]);

  if (isLoading || !formData.resume) {
    return (
      <div className="bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
              <p className="text-gray-600 mt-1">개인정보와 설정을 관리하세요</p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">기본 정보</CardTitle>
                <Button disabled variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  편집
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="block mb-1 font-medium text-gray-700">이름</Label>
                    <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
                  </div>
                  <div>
                    <Label htmlFor="studentNumber" className="block mb-1 font-medium text-gray-700">학번</Label>
                    <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="block mb-1 font-medium text-gray-700">이메일</Label>
                    <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="block mb-1 font-medium text-gray-700">전화번호</Label>
                    <Skeleton className="h-10 w-full bg-gray-200 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">이력서</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="flex gap-6 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border border-primary"></div>
                        <span className="text-sm font-normal">PDF 파일</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full border border-primary"></div>
                        <span className="text-sm font-normal">링크</span>
                      </div>
                    </div>
                  </div>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="min-h-[44px] flex flex-col justify-center">
                          <Skeleton className="h-4 w-[150px] bg-gray-200 mt-1" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Skeleton className="h-[100px] w-full bg-gray-200 rounded-lg" />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
            <p className="text-gray-600 mt-1">개인정보와 설정을 관리하세요</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">기본 정보</CardTitle>
              <Button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className={isEditing ? "bg-blue-100 hover:bg-blue-200 border border-blue-300" : ""}
                variant={isEditing ? "default" : "outline"}
              >
                {isUpdating || isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "저장" : "편집"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="block mb-1 font-medium text-gray-700">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-md",
                      shakingFields.includes('name') && shakeAnimation
                    )}
                    placeholder="이름"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="studentNumber" className="block mb-1 font-medium text-gray-700">학번</Label>
                  <Input
                    id="studentNumber"
                    value={formData.studentNumber}
                    onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-md",
                      shakingFields.includes('studentNumber') && shakeAnimation
                    )}
                    placeholder="학번 (예: 3111)"
                    maxLength={4}
                    type="number"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="block mb-1 font-medium text-gray-700">이메일</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-md",
                      shakingFields.includes('email') && shakeAnimation
                    )}
                    placeholder="이메일"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="block mb-1 font-medium text-gray-700">전화번호</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-md",
                      shakingFields.includes('phoneNumber') && shakeAnimation
                    )}
                    placeholder="숫자만 입력 (예: 01012345123)"
                    maxLength={11}
                    type="number"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">이력서</CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeUpload
                currentResume={formData.resume}
                onResumeChange={handleResumeChange}
                editable={true}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
