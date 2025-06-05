"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User, Upload, Save, Edit, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getUserProfile, updateUserProfile } from "@/api/user"
import { UserProfile } from "@/types/user"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: getUserProfile
  })

  const [profileData, setProfileData] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name,
        studentNumber: profile.studentNumber,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        authority: profile.authority,
        resume: profile.resume
      })
    }
  }, [profile])

  if (isLoading || !profileData) {
    return <div>로딩 중...</div>
  }

  const handleInputChange = (field: string, value: any) => {
    setProfileData((prev) => prev ? ({ ...prev, [field]: value }) : null)
  }

  const handleSave = async () => {
    if (!profileData) return;

    try {
      await updateUserProfile(profileData);
      setIsEditing(false);
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      toast.error('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && profileData) {
      setProfileData({
        ...profileData,
        resume: {
          ...profileData.resume,
          name: file.name,
          type: 'PDF'
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
            <p className="text-gray-600 mt-1">개인정보와 설정을 관리하세요</p>
          </div>
          <Button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={isEditing ? "bg-blue-600 hover:bg-blue-700" : ""}
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
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
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
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">전화번호</label>
                  <Input
                    id="phone"
                    value={profileData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                이력서
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">현재 이력서</label>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mt-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      {profileData.resume.type === "PDF" ? (
                        <>
                          <p className="font-medium">{profileData.resume.name}</p>
                          <p className="text-sm text-gray-500">업로드됨: 2024-01-01</p>
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
                  <div className="flex gap-2">
                    {profileData.resume.type === "PDF" ? (
                      <Button variant="outline" size="sm">
                        다운로드
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        링크 열기
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">이력서 유형 선택</label>
                    <div className="flex gap-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="file-type"
                          name="resumeType"
                          value="PDF"
                          checked={profileData.resume.type === "PDF"}
                          onChange={(e) => handleInputChange("resume", { 
                            ...profileData.resume, 
                            type: e.target.value as "PDF" | "LINK" 
                          })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <label htmlFor="file-type" className="text-sm font-normal">
                          PDF 파일 업로드
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="link-type"
                          name="resumeType"
                          value="LINK"
                          checked={profileData.resume.type === "LINK"}
                          onChange={(e) => handleInputChange("resume", { 
                            ...profileData.resume, 
                            type: e.target.value as "PDF" | "LINK" 
                          })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <label htmlFor="link-type" className="text-sm font-normal">
                          온라인 링크
                        </label>
                      </div>
                    </div>
                  </div>

                  {profileData.resume.type === "PDF" ? (
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">새 이력서 업로드</label>
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="resume-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                            >
                              <span>파일 선택</span>
                              <input
                                id="resume-upload"
                                name="resume-upload"
                                type="file"
                                accept=".pdf"
                                className="sr-only"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="pl-1">또는 드래그 앤 드롭</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF 파일만 업로드 가능 (최대 10MB)</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="resumeUrl" className="block mb-1 font-medium text-gray-700">이력서 링크</label>
                      <Input
                        id="resumeUrl"
                        value={profileData.resume.url}
                        onChange={(e) => handleInputChange("resume", { 
                          ...profileData.resume, 
                          url: e.target.value 
                        })}
                        placeholder="https://drive.google.com/... 또는 https://github.com/..."
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Google Drive, GitHub, 개인 포트폴리오 사이트 등의 링크를 입력하세요
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
