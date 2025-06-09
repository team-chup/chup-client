"use client"

import { FileUp, Upload, FileText, Loader2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatFileSize } from "@/utils/formatFileSize"
import { useState, useEffect } from "react"
import useFileUpload from "@/hooks/useFileUpload"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const ALLOWED_EXTENSIONS = [
  'pdf'
];

interface ResumeUploadProps {
  currentResume?: {
    name: string;
    type: 'PDF' | 'LINK';
    url: string;
    size?: number;
  };
  onResumeChange: (resume: { name: string; type: 'PDF' | 'LINK'; url: string; size?: number }) => void;
  editable?: boolean;
}

export default function ResumeUpload({
  currentResume,
  onResumeChange,
  editable = false
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [resumeType, setResumeType] = useState<'PDF' | 'LINK'>(currentResume?.type || 'LINK');
  const [resumeLink, setResumeLink] = useState(currentResume?.url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useFileUpload();
  
  const [tempResume, setTempResume] = useState(currentResume);
  const [isChanged, setIsChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentResume) {
      setTempResume(currentResume);
      setResumeType(currentResume.type);
      if (currentResume.type === 'LINK') {
        setResumeLink(currentResume.url || '');
      }
    }
  }, [currentResume]);

  const checkIfChanged = (temp: typeof tempResume) => {
    if (!currentResume || !temp) return false;
    
    return !(
      temp.url === currentResume.url &&
      temp.name === currentResume.name &&
      temp.type === currentResume.type &&
      temp.size === currentResume.size
    );
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
    
    try {
      const url = await uploadFile(file);
      const newResume = {
        name: file.name,
        type: 'PDF' as const,
        url: url,
        size: file.size
      };
      
      if (editable) {
        setTempResume(newResume);
        setIsChanged(checkIfChanged(newResume));
      } else {
        onResumeChange(newResume);
        toast.success('이력서가 업로드되었습니다.');
      }
    } catch (error) {
      setSelectedFile(null);
    }
  };

  const handleResumeTypeChange = (type: 'PDF' | 'LINK') => {
    if (resumeType === type) return;
    
    setResumeType(type);
    
    if (tempResume) {
      const newTempResume = {
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
  };

  const handleResumeLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setResumeLink(link);
    
    if (link.trim()) {
      const newResume = {
        name: 'LINK',
        type: 'LINK' as const,
        url: link,
        size: currentResume?.size
      };
      
      if (editable) {
        setTempResume(newResume);
        setIsChanged(checkIfChanged(newResume));
      } else {
        onResumeChange(newResume);
      }
    }
  };

  const handleSave = async () => {
    if (!tempResume) return;
    setIsSaving(true);
    try {
      await onResumeChange(tempResume);
      setIsChanged(false);
      toast.success('이력서가 저장되었습니다.');
    } catch (error) {
      toast.error('이력서 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
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
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    onResumeChange({
      name: '',
      type: 'PDF',
      url: ''
    });
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

  const handleClick = () => {
    document.getElementById('resume-upload')?.click();
  };

  return (
    <div className="space-y-2">
      <div>
        <RadioGroup
          value={resumeType}
          onValueChange={(value: 'PDF' | 'LINK') => handleResumeTypeChange(value)}
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
      {currentResume && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                              href={tempResume.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {tempResume.name.length > 40
                                ? `${tempResume.name.slice(0, 37)}...`
                                : tempResume.name}
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
                          {tempResume.url.length > 40
                            ? `${tempResume.url.slice(0, 37)}...`
                            : tempResume.url}
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
                  className="bg-blue-100 hover:bg-blue-200 border border-blue-300"
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
          <CardContent className="pt-0">
            {resumeType === "PDF" ? (
              <div>
                <div
                  className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 ${
                    isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  } border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer`}
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
                    <p className="text-xs text-gray-500">{ALLOWED_EXTENSIONS.join(', ')} 파일만 업로드 가능 (최대 10MB)</p>
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
        </Card>
      )}
    </div>
  );
}