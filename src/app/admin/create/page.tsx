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
      
      const startAt = formData.startDate ? formData.startDate.toISOString() : "";
      const endAt = formData.endDate ? formData.endDate.toISOString() : "";
      
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
