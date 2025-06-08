"use client"

import { FileUp, Upload, FileText, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatFileSize } from "@/utils/formatFileSize"
import { useState } from "react"
import useFileUpload from "@/hooks/useFileUpload"
import { toast } from "sonner"

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
}

export default function ResumeUpload({
  currentResume,
  onResumeChange
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [resumeType, setResumeType] = useState<'PDF' | 'LINK'>(currentResume?.type || 'LINK');
  const [resumeLink, setResumeLink] = useState(currentResume?.url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useFileUpload();

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
      onResumeChange(newResume);
      toast.success('이력서가 업로드되었습니다.');
    } catch (error) {
      setSelectedFile(null);
    }
  };

  const handleResumeTypeChange = (type: 'PDF' | 'LINK') => {
    setResumeType(type);
    if (type === 'LINK') {
      onResumeChange({
        name: 'LINK',
        type: 'LINK',
        url: resumeLink
      });
    } else {
      onResumeChange({
        name: '',
        type: 'PDF',
        url: ''
      });
    }
  };

  const handleResumeLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setResumeLink(link);
    onResumeChange({
      name: 'LINK',
      type: 'LINK',
      url: link
    });
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
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isUploading ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400" />
                )}
                <div className="min-h-[44px] flex flex-col justify-center">
                  {currentResume.type === "PDF" ? (
                    <>
                      {isUploading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-[20px] w-[200px] bg-gray-200" />
                          <Skeleton className="h-[16px] w-[100px] bg-gray-200" />
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{currentResume.name ? currentResume.name : '파일 업로드'}</p>
                          <p className="text-sm text-gray-500">
                            {currentResume.size ? formatFileSize(currentResume.size) : '파일이 업로드되지 않았습니다'}
                          </p>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium">이력서 링크</p>
                      <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {currentResume.url
                          ? currentResume.url.length > 40
                            ? `${currentResume.url.slice(0, 37)}...`
                            : currentResume.url
                          : "URL이 설정되지 않았습니다"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}