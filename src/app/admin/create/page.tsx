"use client"

import type React from "react"

import { useState } from "react"
import { Building2, Plus, X, Calendar, MapPin, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"

const availablePositions = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "풀스택 개발자",
  "모바일 개발자",
  "DevOps 엔지니어",
  "데이터 엔지니어",
  "AI/ML 엔지니어",
  "QA 엔지니어",
  "UI/UX 디자이너",
  "프로덕트 매니저",
]

const availableLocations = [
  "서울 강남구",
  "서울 서초구",
  "서울 송파구",
  "서울 마포구",
  "경기 성남시",
  "경기 수원시",
  "경기 안양시",
  "인천 연수구",
]

export default function CreateJobPage() {
  const [jobData, setJobData] = useState({
    company: "",
    description: "",
    positions: [] as string[],
    customPosition: "",
    location: "",
    customLocation: "",
    employmentType: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    attachments: [] as File[],
  })

  const [isDraft, setIsDraft] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setJobData((prev) => ({ ...prev, [field]: value }))
  }

  const addPosition = (position: string) => {
    if (!jobData.positions.includes(position)) {
      handleInputChange("positions", [...jobData.positions, position])
    }
  }

  const removePosition = (position: string) => {
    handleInputChange(
      "positions",
      jobData.positions.filter((p) => p !== position),
    )
  }

  const addCustomPosition = () => {
    if (jobData.customPosition && !jobData.positions.includes(jobData.customPosition)) {
      addPosition(jobData.customPosition)
      handleInputChange("customPosition", "")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    handleInputChange("attachments", [...jobData.attachments, ...files])
  }

  const removeFile = (index: number) => {
    const newFiles = jobData.attachments.filter((_, i) => i !== index)
    handleInputChange("attachments", newFiles)
  }

  const handleSubmit = (saveAsDraft = false) => {
    setIsDraft(saveAsDraft)
    console.log("Job posting:", { ...jobData, isDraft: saveAsDraft })
    // 저장 로직
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">채용공고 등록</h1>
          <p className="text-gray-600">새로운 채용공고를 등록하여 GSM 학생들에게 기회를 제공하세요</p>
        </div>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="company">회사명 *</Label>
                <Input
                  id="company"
                  value={jobData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="회사명을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="description">회사 소개 및 채용 내용 *</Label>
                <Textarea
                  id="description"
                  value={jobData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="회사 소개, 업무 내용, 자격 요건, 우대 사항 등을 상세히 작성해주세요"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Position Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                모집 포지션
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>포지션 선택</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availablePositions.map((position) => (
                    <div key={position} className="flex items-center space-x-2">
                      <Checkbox
                        id={position}
                        checked={jobData.positions.includes(position)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addPosition(position)
                          } else {
                            removePosition(position)
                          }
                        }}
                      />
                      <Label htmlFor={position} className="text-sm">
                        {position}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="customPosition">커스텀 포지션 추가</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="customPosition"
                    value={jobData.customPosition}
                    onChange={(e) => handleInputChange("customPosition", e.target.value)}
                    placeholder="새로운 포지션명 입력"
                  />
                  <Button onClick={addCustomPosition} disabled={!jobData.customPosition}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                근무 조건
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">근무 지역 *</Label>
                  <Select value={jobData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="지역을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">직접 입력</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employmentType">고용 형태 *</Label>
                  <Select
                    value={jobData.employmentType}
                    onValueChange={(value) => handleInputChange("employmentType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="고용 형태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">정규직</SelectItem>
                      <SelectItem value="contract">계약직</SelectItem>
                      <SelectItem value="intern">인턴</SelectItem>
                      <SelectItem value="military">병역특례</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {jobData.location === "custom" && (
                <div>
                  <Label htmlFor="customLocation">직접 입력</Label>
                  <Input
                    id="customLocation"
                    value={jobData.customLocation}
                    onChange={(e) => handleInputChange("customLocation", e.target.value)}
                    placeholder="근무 지역을 입력하세요"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                지원 기간
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>시작일 *</Label>
                  <DatePicker date={jobData.startDate} onDateChange={(date) => handleInputChange("startDate", date)} />
                </div>

                <div>
                  <Label>마감일 *</Label>
                  <DatePicker date={jobData.endDate} onDateChange={(date) => handleInputChange("endDate", date)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>첨부 파일</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="attachments">파일 업로드</Label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Plus className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>파일 선택</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">또는 드래그 앤 드롭</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, 이미지 파일 등</p>
                  </div>
                </div>
              </div>

              {jobData.attachments.length > 0 && (
                <div>
                  <Label>업로드된 파일</Label>
                  <div className="space-y-2 mt-2">
                    {jobData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <span className="text-sm">{file.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => handleSubmit(true)}>
              임시저장
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={
                !jobData.company ||
                !jobData.description ||
                jobData.positions.length === 0 ||
                !jobData.location ||
                !jobData.employmentType ||
                !jobData.startDate ||
                !jobData.endDate
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              공고 등록
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
