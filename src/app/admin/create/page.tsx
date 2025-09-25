"use client"

import { useState } from "react"
import { createJobPosting } from "@/api/posting"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { 
  AttachmentFile, 
  CreateJobPostingRequest, 
} from "@/types/posting"
import JobForm, { 
  JobFormData, 
  EMPLOYMENT_TYPE_MAPPING, 
  LOCATION_MAPPING, 
  AttachmentWithFile,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS
} from "@/components/JobForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X, Upload, FileUp, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/utils/formatFileSize"

export default function CreateJobPostingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatDateForAPI = (date: Date | null, isEndDate: boolean = false): string => {
    if (!date) return "";
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript의 월은 0부터 시작하므로 1을 더함
    const day = date.getDate();
    
    // 시작일은 0시 0분 0초, 마감일은 23시 59분 59초로 설정
    const hours = isEndDate ? 23 : 0;
    const minutes = isEndDate ? 59 : 0;
    const seconds = isEndDate ? 59 : 0;
    
    // LocalDateTime 형식으로 반환 (YYYY-MM-DDTHH:mm:ss)
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCreateJobPosting = async (
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
      
      // 시작일은 0시 0분 0초, 마감일은 23시 59분 59초로 설정
      const startAt = formatDateForAPI(formData.startDate, false);
      const endAt = formatDateForAPI(formData.endDate, true);
      
      // 첨부파일 섹션에서 업로드된 파일 처리
      const allFiles = [...uploadedFiles];
      /* if (attachments.length > 0) {
        const processedAttachments = await processFileUploads();
        allFiles.push(...processedAttachments);
      } */
      
      const requestData: CreateJobPostingRequest = {
        companyName: formData.company,
        companyDescription: formData.description,
        companyLocation: mappedLocation,
        employmentType: EMPLOYMENT_TYPE_MAPPING[formData.employmentType],
        positions: selectedPositions,
        files: allFiles,
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

  // 파일 검증 함수
  const validateFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension as any)) {
      return { 
        isValid: false, 
        errorMessage: `'${file.name}'은(는) 지원하지 않는 확장자입니다.` 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        errorMessage: `'${file.name}'의 크기가 10MB를 초과합니다.` 
      };
    }

    return { isValid: true };
  };

  

  // 첨부파일 섹션 렌더링
  const renderAttachmentsSection = () => (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          첨부 파일
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">채용공고 등록</h1>
          <p className="text-gray-600">새로운 채용공고를 등록하여 GSM 학생들에게 기회를 제공하세요</p>
        </div>

        <div className="grid gap-6">
          <JobForm
            submitButtonText="공고 등록"
            onSubmit={handleCreateJobPosting}
            isSubmitting={isSubmitting}
          />
          {renderAttachmentsSection()}
        </div>
      </main>
    </div>
  )
}
