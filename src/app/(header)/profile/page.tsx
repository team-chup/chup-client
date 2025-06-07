"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Save, Edit, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getUserProfile, updateUserProfile } from "@/api/user"
import { UserProfile } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import useFileUpload from "@/hooks/useFileUpload"
import ResumeUpload from "@/components/ResumeUpload"
import { formatFileSize } from "@/utils/formatFileSize"
import { signupSchema } from "@/schemas/user"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const ALLOWED_EXTENSIONS = [
  'pdf', 'jpeg', 'jpg', 'png', 'xls', 'xlsx', 'xlsm',
  'hwp', 'hwpx', 'hwt', 'ppt', 'pptx', 'zip'
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { uploadFile } = useFileUpload()
  const [isUploading, setIsUploading] = useState(false)
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: getUserProfile
  })

  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resumeLink, setResumeLink] = useState('')
  const [shakingFields, setShakingFields] = useState<string[]>([])

  const shakeAnimation = "animate-shake"

  const addShakeEffect = (fieldName: string) => {
    setShakingFields(prev => [...prev, fieldName])
    setTimeout(() => {
      setShakingFields(prev => prev.filter(field => field !== fieldName))
    }, 300)
  }

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name,
        studentNumber: profile.studentNumber,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        authority: profile.authority,
        resume: {
          name: profile.resume.name || '',
          type: profile.resume.type || 'LINK',
          url: profile.resume.url || ''
        }
      });
      setResumeLink(profile.resume.url || '');
    }
  }, [profile])

  if (isLoading || !profileData) {
    return (
      <div className="bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
              <p className="text-gray-600 mt-1">개인정보와 설정을 관리하세요</p>
            </div>
            <Button
              disabled
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  기본 정보
                </CardTitle>
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
    setProfileData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      const validationResult = signupSchema.safeParse(profileData);
      
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

      await updateUserProfile(profileData);
      setIsEditing(false);
      toast.success('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      toast.error('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
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
      setProfileData(prev => prev ? ({
        ...prev,
        resume: {
          name: file.name,
          type: 'PDF',
          url: url,
          size: file.size
        }
      }) : null);
      toast.success('이력서가 업로드되었습니다.');
    } catch (error) {
      toast.error('파일 업로드에 실패했습니다.');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  }

  const handleResumeLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setResumeLink(link);
    setProfileData(prev => prev ? ({
      ...prev,
      resume: {
        name: 'LINK',
        type: 'LINK',
        url: link
      }
    }) : null);
  };

  const handleResumeTypeChange = (type: 'PDF' | 'LINK') => {
    if (!profileData) return;
    setProfileData({
      ...profileData,
      resume: {
        name: '',
        type: type,
        url: type === 'LINK' ? resumeLink : ''
      }
    });
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    if (!profileData) return;
    setProfileData({
      ...profileData,
      resume: {
        name: '',
        type: 'PDF',
        url: ''
      }
    });
  };

  return (
    <div className="bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
            <p className="text-gray-600 mt-1">개인정보와 설정을 관리하세요</p>
          </div>
          <Button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={isEditing ? "bg-blue-100 hover:bg-blue-200 border border-blue-300" : ""}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                편집
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                기본 정보
              </CardTitle>
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
                    disabled={true}
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
              {isEditing ? (
                <ResumeUpload
                  currentResume={profileData.resume}
                  onResumeChange={(resume) => {
                    setProfileData(prev => prev ? ({
                      ...prev,
                      resume
                    }) : null);
                  }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    {profileData.resume.type === "PDF" ? (
                      <>
                        <p className="font-medium">{profileData.resume.name || "이력서가 없습니다"}</p>
                        {profileData.resume.size && (
                          <p className="text-sm text-gray-500">
                            {profileData.resume.size ? formatFileSize(profileData.resume.size) : '파일이 업로드되지 않았습니다'}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium">이력서 링크</p>
                        <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                          {profileData.resume.url || "링크가 설정되지 않았습니다"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
