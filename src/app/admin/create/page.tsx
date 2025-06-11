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
import usePostingFileUpload from "@/hooks/usePostingFileUpload"

export default function CreateJobPostingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadFile, isUploading } = usePostingFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentWithFile[]>([]);

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
      if (attachments.length > 0) {
        const processedAttachments = await processFileUploads();
        allFiles.push(...processedAttachments);
      }
      
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

  // 파일 변경 처리 함수
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validationResult = validateFile(file);
      if (!validationResult.isValid) {
        toast.error(validationResult.errorMessage);
        return;
      }
    }

    const newAttachments = [...attachments];
    
    for (const file of files) {
      const isDuplicate = newAttachments.some(attachment => 
        attachment.file.name === file.name && attachment.file.size === file.size
      );
      
      if (!isDuplicate) {
        newAttachments.push({ file });
      }
    }
    
    setAttachments(newAttachments);
  };

  // 파일 제거 함수
  const removeFile = (index: number) => {
    const newFiles = attachments.filter((_, i) => i !== index);
    setAttachments(newFiles);
  };

  // 드래그 관련 이벤트 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const event = {
        target: {
          files: files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const handleFileUploadClick = () => {
    document.getElementById('file-upload')?.click();
  };

  // 파일 업로드 처리 함수
  const processFileUploads = async (): Promise<AttachmentFile[]> => {
    if (attachments.length === 0) return [];
    
    try {
      const uploadPromises = attachments.map(async (attachment) => {
        if (attachment.url) {
          return {
            url: attachment.url,
            name: attachment.name || attachment.file.name
          };
        }
        
        const url = await uploadFile(attachment.file);
        return {
          url,
          name: attachment.file.name
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      toast.success('모든 파일이 성공적으로 업로드되었습니다.');
      return uploadedFiles;
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      toast.error("파일 업로드에 실패했습니다");
      throw error;
    }
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
        <div>
          <Label htmlFor="attachments">파일 업로드</Label>
          <div
            className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            } border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileUploadClick}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="flex text-sm text-gray-600 items-center justify-center">
                <span className="flex items-center gap-1">
                  <FileUp className="h-4 w-4" />
                  파일 선택
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <p className="pl-1">또는 드래그 앤 드롭</p>
              </div>
              <p className="text-xs text-gray-500">
                {ALLOWED_EXTENSIONS.join(', ')} 파일만 업로드 가능 (최대 10MB)
              </p>
            </div>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-3 mt-4">
            <Label>업로드된 파일</Label>
            {attachments.map((attachment, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{attachment.name || attachment.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {attachment.url ? "이미 업로드된 파일" : formatFileSize(attachment.file.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
