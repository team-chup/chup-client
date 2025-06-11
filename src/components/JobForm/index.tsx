import type React from "react"
import { useState, useEffect } from "react"
import { Building2, Plus, X, Calendar, MapPin, Briefcase, Upload, FileUp, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import { getPositions, createPosition } from "@/api/posting"
import { 
  AttachmentFile, 
  CompanyLocation, 
  EmploymentType, 
  Position 
} from "@/types/posting"
import usePostingFileUpload from "@/hooks/usePostingFileUpload"
import { formatFileSize } from "@/utils/formatFileSize"

const ALLOWED_EXTENSIONS = [
  'pdf', 'jpeg', 'jpg', 'png', 'xls', 'xlsx', 'xlsm', 'hwp', 'hwpx', 'hwt', 'ppt', 'pptx', 'zip'
] as const;

type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const LOCATION_MAPPING: Record<string, CompanyLocation> = {
  "서울": "SEOUL",
  "부산": "BUSAN",
  "대구": "DAEGU",
  "인천": "INCHEON",
  "광주": "GWANGJU",
  "대전": "DAEJEON",
  "울산": "ULSAN",
  "세종": "SEJONG",
  "경기": "GYEONGGI",
  "강원": "GANGWON",
  "충북": "CHUNGBUK",
  "충남": "CHUNGNAM",
  "전북": "JEONBUK",
  "전남": "JEONNAM",
  "경북": "GYEONGBUK",
  "경남": "GYEONGNAM",
  "제주": "JEJU",
};

const REVERSE_LOCATION_MAPPING: Record<CompanyLocation, string> = Object.entries(LOCATION_MAPPING).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [value]: key
  }), 
  {} as Record<CompanyLocation, string>
);

const AVAILABLE_LOCATIONS = Object.keys(LOCATION_MAPPING);

const EMPLOYMENT_TYPE_MAPPING: Record<string, EmploymentType> = {
  "fulltime": "FULL_TIME",
  "contract": "CONTRACT",
  "intern": "INTERN",
  "military": "MILITARY_EXCEPTION"
};

const REVERSE_EMPLOYMENT_MAPPING: Record<EmploymentType, string> = {
  "FULL_TIME": "fulltime",
  "CONTRACT": "contract",
  "INTERN": "intern",
  "MILITARY_EXCEPTION": "military"
};

export interface JobFormData {
  company: string;
  description: string;
  location: string;
  customLocation: string;
  employmentType: string;
  startDate: Date | null;
  endDate: Date | null;
  attachments: AttachmentWithFile[];
  positions?: Position[];
}

export interface AttachmentWithFile {
  file: File;
  url?: string;
  name?: string;
}

interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface JobFormProps {
  initialData?: JobFormData;
  submitButtonText: string;
  onSubmit: (formData: JobFormData, selectedPositionIds: number[], processedFiles: AttachmentFile[]) => Promise<void>;
  isSubmitting: boolean;
  showAttachments?: boolean;
  isChangeablePositions?: boolean;
}

export default function JobForm({ initialData, submitButtonText, onSubmit, isSubmitting, showAttachments = false, isChangeablePositions = true }: JobFormProps) {
  const { uploadFile, isUploading } = usePostingFileUpload();
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [customPositionName, setCustomPositionName] = useState("");
  const [isPositionsLoading, setIsPositionsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  
  const [jobData, setJobData] = useState<JobFormData>({
    company: "",
    description: "",
    location: "",
    customLocation: "",
    employmentType: "",
    startDate: null,
    endDate: null,
    attachments: [],
  });

  // 초기 데이터가 있으면 설정
  useEffect(() => {
    if (initialData) {
      setJobData(initialData);
      
      // 초기 데이터에 positions가 있으면 선택된 포지션으로 설정
      if (initialData.positions && initialData.positions.length > 0) {
        const positionIds = initialData.positions.map(pos => pos.id);
        setSelectedPositions(positionIds);
      }
    }
  }, [initialData]);

  const loadPositions = async () => {
    try {
      setIsPositionsLoading(true);
      const positionsData = await getPositions();
      setPositions(positionsData);
      return positionsData;
    } catch (error) {
      console.error(error);
      toast.error("포지션 데이터를 불러오는데 실패했습니다.");
      return [];
    } finally {
      setIsPositionsLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleInputChange = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    handleInputChange(field, date === undefined ? null : date);
  };

  const togglePosition = (positionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPositions(prev => [...prev, positionId]);
    } else {
      setSelectedPositions(prev => prev.filter(id => id !== positionId));
    }
  };

  const addCustomPosition = async () => {
    if (!customPositionName.trim()) return;
    
    try {
      setIsAddingPosition(true);
      
      await createPosition(customPositionName);
      
      const updatedPositions = await loadPositions();
      
      const newPosition = updatedPositions.find(p => p.name === customPositionName);
      
      if (newPosition) {
        setSelectedPositions(prev => [...prev, newPosition.id]);
        toast.success(`'${newPosition.name}' 포지션이 추가되었습니다.`);
      } else {
        toast.info("포지션이 추가되었습니다. 목록이 갱신되었습니다.");
      }
      
      setCustomPositionName("");
    } catch (error) {
      console.error(error);
      toast.error("포지션 추가에 실패했습니다.");
    } finally {
      setIsAddingPosition(false);
    }
  };

  const validateFile = (file: File): FileValidationResult => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() as AllowedExtension | undefined;
    
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension as AllowedExtension)) {
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

    const newAttachments = [...jobData.attachments];
    
    for (const file of files) {
      const isDuplicate = newAttachments.some(attachment => 
        attachment.file.name === file.name && attachment.file.size === file.size
      );
      
      if (!isDuplicate) {
        newAttachments.push({ file });
      }
    }
    
    handleInputChange("attachments", newAttachments);
  };

  const removeFile = (index: number) => {
    const newFiles = jobData.attachments.filter((_, i) => i !== index);
    handleInputChange("attachments", newFiles);
  };

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

  const validateRequiredFields = (): boolean => {
    return Boolean(
      jobData.company &&
      jobData.description &&
      selectedPositions.length > 0 &&
      jobData.location &&
      jobData.employmentType &&
      jobData.startDate &&
      jobData.endDate
    );
  };

  const processFileUploads = async (): Promise<AttachmentFile[]> => {
    if (jobData.attachments.length === 0) return [];
    
    try {
      const uploadPromises = jobData.attachments.map(async (attachment) => {
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

  const handleSubmit = async () => {  
    try {
      if (!validateRequiredFields()) {
        toast.error("모든 필수 항목을 입력해주세요");
        return;
      }
      
      const uploadedFiles = await processFileUploads();
      
      // 부모 컴포넌트의 onSubmit 호출
      await onSubmit(jobData, selectedPositions, uploadedFiles);
      
    } catch (error) {
      console.error("폼 제출 실패:", error);
      toast.error("제출 중 오류가 발생했습니다");
    }
  };

  const renderBasicInfoSection = () => (
    <Card className="bg-white">
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
  );

  const renderPositionSection = () => (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          모집 포지션
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPositionsLoading ? (
          <div className="py-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div>
              <Label>포지션 선택</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {positions.map((position) => (
                  <div key={`position-${position.id}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`position-${position.id}`}
                      checked={selectedPositions.includes(position.id)}
                      onCheckedChange={(checked) => togglePosition(position.id, !!checked)}
                      className="border-zinc-900 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
                      disabled={!isChangeablePositions}
                    />
                    <Label 
                      htmlFor={`position-${position.id}`} 
                      className={`text-sm ${!isChangeablePositions ? 'text-gray-500' : ''}`}
                    >
                      {position.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {isChangeablePositions && (
              <div>
                <Label htmlFor="customPosition">커스텀 포지션 추가</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="customPosition"
                    value={customPositionName}
                    onChange={(e) => setCustomPositionName(e.target.value)}
                    placeholder="새로운 포지션명 입력"
                    disabled={isAddingPosition}
                  />
                  <Button 
                    onClick={addCustomPosition} 
                    disabled={!customPositionName || isAddingPosition}
                  >
                    {isAddingPosition ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderWorkConditionsSection = () => (
    <Card className="bg-white">
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
                {AVAILABLE_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
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
      </CardContent>
    </Card>
  );

  const renderApplicationPeriodSection = () => (
    <Card className="bg-white">
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
            <DatePicker 
              date={jobData.startDate} 
              onDateChange={(date) => handleDateChange("startDate", date)} 
            />
          </div>

          <div>
            <Label>마감일 *</Label>
            <DatePicker 
              date={jobData.endDate} 
              onDateChange={(date) => handleDateChange("endDate", date)} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAttachmentsSection = () => {
    if (!showAttachments || !jobData.attachments.length) {
      return null;
    }

    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            첨부 파일
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {jobData.attachments.map((attachment, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{attachment.name || attachment.file.name}</p>
                        {attachment.url && (
                          <p className="text-sm text-gray-500">
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              다운로드
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActionButtons = () => (
    <div className="flex justify-end gap-4">
      <Button 
        onClick={handleSubmit}
        disabled={
          isSubmitting ||
          isUploading ||
          !validateRequiredFields()
        }
        className="text-white bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? "처리 중..." : submitButtonText}
      </Button>
    </div>
  );

  return (
    <div className="grid gap-6">
      {renderBasicInfoSection()}
      {renderPositionSection()}
      {renderWorkConditionsSection()}
      {renderApplicationPeriodSection()}
      {renderAttachmentsSection()}
      {renderActionButtons()}
    </div>
  );
}

export {
  LOCATION_MAPPING,
  REVERSE_LOCATION_MAPPING,
  EMPLOYMENT_TYPE_MAPPING,
  REVERSE_EMPLOYMENT_MAPPING,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE
}
