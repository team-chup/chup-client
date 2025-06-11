"use client"

import { FileUp, Upload, FileText, Loader2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatFileSize } from "@/utils/formatFileSize"
import { useState, useEffect, useCallback, useMemo } from "react"
import useFileUpload from "@/hooks/useFileUpload"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forceDownload } from "@/utils/downloadUtils"

const ALLOWED_EXTENSIONS = ['pdf'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type ResumeType = 'PDF' | 'LINK';

interface ResumeData {
  name: string;
  type: ResumeType;
  url: string;
  size?: number;
}

interface ResumeUploadProps {
  currentResume?: ResumeData;
  onResumeChange?: (resume: ResumeData) => void;
  editable?: boolean;
  isApplyPage?: boolean
}

export default function ResumeUpload({
  currentResume,
  onResumeChange,
  editable = false,
  isApplyPage = false
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [resumeType, setResumeType] = useState<ResumeType>(currentResume?.type || 'LINK');
  const [resumeLink, setResumeLink] = useState(currentResume?.url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useFileUpload();
  
  const [tempResume, setTempResume] = useState<ResumeData | undefined>(currentResume);
  const [isChanged, setIsChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 현재 이력서 정보가 업데이트되면 임시 이력서 상태도 업데이트
  useEffect(() => {
    if (currentResume) {
      setTempResume(currentResume);
      setResumeType(currentResume.type);
      if (currentResume.type === 'LINK') {
        setResumeLink(currentResume.url || '');
      }
    }
  }, [currentResume]);

  useEffect(() => {
    if (currentResume) {
      setResumeType(currentResume?.type)
    }
  }, [])

  // 변경 여부 확인 - 메모이제이션으로 불필요한 연산 방지
  const checkIfChanged = useCallback((temp: ResumeData | undefined): boolean => {
    if (!currentResume || !temp) return false;
    
    return !(
      temp.url === currentResume.url &&
      temp.name === currentResume.name &&
      temp.type === currentResume.type &&
      temp.size === currentResume.size
    );
  }, [currentResume]);

  // 파일 확장자 확인
  const isValidFileExtension = useCallback((filename: string): boolean => {
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    return !!fileExtension && ALLOWED_EXTENSIONS.includes(fileExtension as any);
  }, []);

  // 파일 변경 핸들러
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileExtension(file.name)) {
      toast.error('지원하지 않는 확장자입니다.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);
    
    try {
      const url = await uploadFile(file);
      const newResume: ResumeData = {
        name: file.name,
        type: 'PDF',
        url: url,
        size: file.size
      };
      
      if (editable) {
        setTempResume(newResume);
        setIsChanged(checkIfChanged(newResume));
      } else {
        onResumeChange?.(newResume);
        toast.success('이력서가 업로드되었습니다.');
      }
    } catch (error) {
      toast.error('파일 업로드에 실패했습니다.');
      setSelectedFile(null);
    }
  }, [uploadFile, editable, onResumeChange, checkIfChanged, isValidFileExtension]);

  // 이력서 타입 변경 핸들러
  const handleResumeTypeChange = useCallback((type: ResumeType) => {
    if (resumeType === type) return;
    
    setResumeType(type);
    
    if (tempResume) {
      const newTempResume: ResumeData = {
        ...tempResume,
        type: type
      };
      
      setTempResume(newTempResume);
      
      if (type === 'LINK') {
        setSelectedFile(null);
        setResumeLink(newTempResume.url || '');
      } else {
        if (newTempResume.url) {
          setResumeLink('');
        }
      }
      
      setIsChanged(checkIfChanged(newTempResume));
    }
  }, [resumeType, tempResume, checkIfChanged]);

  // 이력서 링크 변경 핸들러
  const handleResumeLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setResumeLink(link);
    
    if (link.trim()) {
      const newResume: ResumeData = {
        name: 'LINK',
        type: 'LINK',
        url: link,
        size: currentResume?.size
      };
      
      if (editable) {
        setTempResume(newResume);
        setIsChanged(checkIfChanged(newResume));
      } else {
        onResumeChange?.(newResume);
      }
    }
  }, [currentResume?.size, editable, onResumeChange, checkIfChanged]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!tempResume) return;
    setIsSaving(true);
    try {
      await onResumeChange?.(tempResume);
      setIsChanged(false);
      toast.success('이력서가 저장되었습니다.');
    } catch (error) {
      toast.error('이력서 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [tempResume, onResumeChange]);

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    if (currentResume) {
      setResumeType(currentResume.type);
      setTempResume(currentResume);
      
      if (currentResume.type === 'LINK') {
        setResumeLink(currentResume.url || '');
        setSelectedFile(null);
      } else {
        setResumeLink('');
      }
      
      setIsChanged(false);
    }
  }, [currentResume]);

  // 파일 초기화 핸들러
  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    onResumeChange?.({
      name: '',
      type: 'PDF',
      url: ''
    });
  }, [onResumeChange]);

  // 드래그 이벤트 핸들러
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
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
  }, [handleFileChange]);

  const handleClick = useCallback(() => {
    document.getElementById('resume-upload')?.click();
  }, []);

  // URL 표시 텍스트 계산 - 메모이제이션으로 불필요한 연산 방지
  const displayUrl = useMemo(() => {
    if (!tempResume?.url) return "URL이 설정되지 않았습니다";
    return tempResume.url.length > 40
      ? `${tempResume.url.slice(0, 37)}...`
      : tempResume.url;
  }, [tempResume?.url]);

  // 파일 이름 표시 텍스트 계산 - 메모이제이션으로 불필요한 연산 방지
  const displayFileName = useMemo(() => {
    if (!tempResume?.name) return "";
    return tempResume.name.length > 40
      ? `${tempResume.name.slice(0, 37)}...`
      : tempResume.name;
  }, [tempResume?.name]);

  // 드래그 영역 클래스 계산 - 메모이제이션으로 불필요한 연산 방지
  const dragAreaClasses = useMemo(() => `
    mt-2 flex justify-center px-6 pt-5 pb-6 border-2
    ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
    border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer
  `, [isDragging]);

  return (
    <div className="space-y-2">
      {!isApplyPage && (
        <div>
          <RadioGroup
            value={resumeType}
            onValueChange={(value: ResumeType) => handleResumeTypeChange(value)}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="PDF" id="pdf-type" />
              <Label htmlFor="pdf-type" className="text-sm font-normal">
                PDF 파일
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="LINK" id="link-type" />
              <Label htmlFor="link-type" className="text-sm font-normal">
                링크
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
      {currentResume && (
        <Card className={cn(isApplyPage && 'mt-[1.5rem]')}>
          <CardHeader className={cn('flex', 'flex-row', 'items-center', 'justify-between', 'space-y-0', 'pb-2', isApplyPage && 'pt-2')}>
            <div className="flex items-center gap-3">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <FileText className="h-5 w-5 text-gray-400" />
              )}
              <div className="min-h-[44px] flex flex-col justify-center">
                {tempResume?.type === "PDF" ? (
                  <>
                    {isUploading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-[16px] w-[100px] bg-gray-200" />
                      </div>
                    ) : (
                      <>
                        {tempResume.name && (
                          <p className="text-md hover:underline cursor-pointer">
                            <a 
                              onClick={(e) => {
                                e.preventDefault();
                                forceDownload(tempResume.url, tempResume.name);
                              }}
                              href="#"
                            >
                              {displayFileName}
                            </a>
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {tempResume.size ? formatFileSize(tempResume.size) : ''}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-md text-blue-600 hover:underline cursor-pointer">
                      {tempResume?.url ? (
                        <a 
                          href={tempResume.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {displayUrl}
                        </a>
                      ) : (
                        "URL이 설정되지 않았습니다"
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
            {editable && isChanged && (
              <div className="flex items-center gap-4">
                <span 
                  className="text-sm hover:underline cursor-pointer text-gray-600"
                  onClick={handleCancel}
                >
                  변경사항 취소
                </span>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  저장
                </Button>
              </div>
            )}
          </CardHeader>
          {!isApplyPage && (
            <CardContent className="pt-0">
              {resumeType === "PDF" ? (
                <div>
                  <div
                    className={dragAreaClasses}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex text-sm text-gray-600 items-center justify-center">
                        <span className="flex items-center gap-1">
                          <FileUp className="h-4 w-4" />
                          파일 선택
                        </span>
                        <input
                          id="resume-upload"
                          name="resume-upload"
                          type="file"
                          accept=".pdf"
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
              ) : (
                <div>
                  <Input
                    id="resumeUrl"
                    value={resumeLink}
                    onChange={handleResumeLinkChange}
                    placeholder="https://drive.google.com/... 또는 https://github.com/..."
                    className="mt-2"
                  />
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}