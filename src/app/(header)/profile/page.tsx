"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

type UserProfileWithResume = {
  name: string;
  email: string;
  studentNumber: string;
  phoneNumber: string;
  authority: Authority;
  resume: Resume;
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    studentNumber: string;
    phoneNumber: string;
  }>({ name: '', email: '', studentNumber: '', phoneNumber: '' })
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [shakingFields, setShakingFields] = useState<string[]>([])
  const { data: profile, isLoading } = useProfileQuery()
  const { updateProfile, isUpdating } = useProfileMutation()
  const shakeAnimation = "animate-shake"
  const queryClient = useQueryClient();

  const addShakeEffect = (fieldName: string) => {
    setShakingFields(prev => [...prev, fieldName])
    setTimeout(() => {
      setShakingFields(prev => prev.filter(field => field !== fieldName))
    }, 300)
  }

  useEffect(() => {
    if (profile) {
      const p = profile as UserProfileWithResume;
      setProfileData({
        name: p.name,
        studentNumber: p.studentNumber,
        email: p.email,
        phoneNumber: p.phoneNumber,
      });
      setResumeData(p.resume)
    }
  }, [profile])

  if (isLoading || !resumeData) {
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
                    <label className="block mb-1 font-medium text-gray-700">이름</label>
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">학번</label>
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">이메일</label>
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">전화번호</label>
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">이력서</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <Skeleton className="h-5 w-[200px] bg-gray-200" />
                    <Skeleton className="h-4 w-[150px] bg-gray-200 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profileData || !profile) return;
    console.log('profileData to save:', profileData);
    try {
      const validationResult = profileSchema.safeParse(profileData);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        errors.forEach(error => {
          const field = error.path[0] as string;
          addShakeEffect(field);
        });

        errors.forEach(error => {
          toast.error(error.message, {
            duration: 3000,
            style: { maxWidth: '500px' }
          });
        });
        return;
      }

      await updateProfile({ ...profileData, authority: profile.authority });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast.success('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error(error);
      toast.error('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleResumeChange = async (resume: Resume) => {
    try {
      await updateUserResume(resume);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setResumeData(resume);
    } catch (error) {
      console.error(error);
    }
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
                disabled={isUpdating}
              >
                {isEditing ? (
                  <>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    저장
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium text-gray-700">이름</label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      shakingFields.includes('name') && shakeAnimation
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="studentId" className="block mb-1 font-medium text-gray-700">학번</label>
                  <Input 
                    id="studentId" 
                    value={profileData.studentNumber} 
                    onChange={(e) => handleInputChange("studentNumber", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      shakingFields.includes('studentNumber') && shakeAnimation
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1 font-medium text-gray-700">이메일</label>
                  <Input
                    id="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      shakingFields.includes('email') && shakeAnimation
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">전화번호</label>
                  <Input
                    id="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      shakingFields.includes('phoneNumber') && shakeAnimation
                    )}
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
                currentResume={resumeData}
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
