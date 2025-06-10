"use client"

import { useState } from "react"
import { createJobPosting } from "@/api/posting"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { 
  AttachmentFile, 
  CreateJobPostingRequest, 
} from "@/types/posting"
import JobForm, { JobFormData, EMPLOYMENT_TYPE_MAPPING, LOCATION_MAPPING } from "@/components/JobForm"

export default function CreateJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    
    // 날짜의 시간을 정오(12:00)로 설정하여 시간대 변환 시 날짜가 바뀌는 문제 방지
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // 한국 시간 기준 정오로 설정
    const adjustedDate = new Date(year, month, day, 15, 0, 0);
    return adjustedDate.toISOString();
  };

  const handleSubmit = async (
    formData: JobFormData, 
    selectedPositions: number[], 
    uploadedFiles: AttachmentFile[]
  ) => {
    try {
      setIsSubmitting(true);
      
      const finalLocation = formData.location === "custom" ? formData.customLocation : formData.location;
      const mappedLocation = formData.location === "custom" 
        ? "SEOUL"
        : LOCATION_MAPPING[finalLocation] || "SEOUL";
      
      // 수정된 날짜 변환 함수 사용
      const startAt = formatDateForAPI(formData.startDate);
      const endAt = formatDateForAPI(formData.endDate);
      
      const requestData: CreateJobPostingRequest = {
        companyName: formData.company,
        companyDescription: formData.description,
        companyLocation: mappedLocation,
        employmentType: EMPLOYMENT_TYPE_MAPPING[formData.employmentType],
        positions: selectedPositions,
        files: uploadedFiles,
        startAt,
        endAt
      };
      
      await createJobPosting(requestData);
      
      toast.success("채용공고가 성공적으로 등록되었습니다");
      router.push("/admin/main");
      
    } catch (error) {
      console.error("채용공고 등록 실패:", error);
      toast.error("채용공고 등록에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">채용공고 등록</h1>
          <p className="text-gray-600">새로운 채용공고를 등록하여 GSM 학생들에게 기회를 제공하세요</p>
        </div>

        <JobForm
          submitButtonText="공고 등록"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  )
}
