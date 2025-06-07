"use client"

import { FileUp, Upload, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatFileSize } from "@/utils/formatFileSize"

interface ResumeUploadProps {
  resumeType: 'PDF' | 'LINK';
  resumeLink: string;
  selectedFile: File | null;
  onResumeTypeChange: (type: 'PDF' | 'LINK') => void;
  onResumeLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileClear: () => void;
  isUploading: boolean;
  currentResume?: {
    name: string;
    type: 'PDF' | 'LINK';
    url: string;
    size?: number;
  };
}

export default function ResumeUpload({
  resumeType,
  resumeLink,
  onResumeTypeChange,
  onResumeLinkChange,
  onFileChange,
  currentResume,
  isUploading
}: ResumeUploadProps) {
  return (
    <div className="space-y-2">
      <div>
        <RadioGroup
          value={resumeType}
          onValueChange={(value: 'PDF' | 'LINK') => onResumeTypeChange(value)}
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
                <FileText className="h-5 w-5 text-gray-400" />
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
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="flex text-sm text-gray-600 items-center justify-center">
                <label
                  htmlFor="resume-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  <span className="flex items-center gap-1 hover:underline">
                    <FileUp className="h-4 w-4" />
                    파일 선택
                  </span>
                  <input
                    id="resume-upload"
                    name="resume-upload"
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png,.xls,.xlsx,.xlsm,.hwp,.hwpx,.hwt,.ppt,.pptx,.zip"
                    className="sr-only"
                    onChange={onFileChange}
                  />
                </label>
                <p className="pl-1">또는 드래그 앤 드롭</p>
              </div>
              <p className="text-xs text-gray-500">pdf, jpeg, jpg, png, xls, xlsx, xlsm, hwp, hwpx, hwt, ppt, pptx, zip 파일만 업로드 가능 (최대 10MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Input
            id="resumeUrl"
            value={resumeLink}
            onChange={onResumeLinkChange}
            placeholder="https://drive.google.com/... 또는 https://github.com/..."
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}