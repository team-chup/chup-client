import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';

type ResumeType = 'PDF' | 'LINK';

interface ResumeUploadProps {
  resumeType: ResumeType;
  resumeLink: string;
  selectedFile: File | null;
  onResumeTypeChange: (type: ResumeType) => void;
  onResumeLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileClear: () => void;
  isUploading?: boolean;
}

const ResumeUpload = ({
  resumeType,
  resumeLink,
  selectedFile,
  onResumeTypeChange,
  onResumeLinkChange,
  onFileChange,
  onFileClear,
  isUploading = false,
}: ResumeUploadProps) => {
  const handleClear = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    onFileClear();
  };

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <button
          type="button"
          className={`px-4 py-2 rounded ${
            resumeType === 'LINK' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => onResumeTypeChange('LINK')}
          disabled={isUploading}
        >
          LINK
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${
            resumeType === 'PDF' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => onResumeTypeChange('PDF')}
          disabled={isUploading}
        >
          PDF
        </button>
      </div>

      {resumeType === 'LINK' ? (
        <div>
          <Input
            type="url"
            name="resumeLink"
            placeholder="이력서 링크를 입력하세요"
            value={resumeLink}
            onChange={onResumeLinkChange}
            required={resumeType === 'LINK'}
            disabled={isUploading}
          />
          <p className="mt-2 text-sm text-gray-500">
            링크를 입력해주세요
          </p>
        </div>
      ) : (
        <div>
          <div className="relative">
            <Input
              type="text"
              name="resumeFileName"
              readOnly
              value={selectedFile?.name || ''}
              placeholder="PDF 파일을 선택해주세요"
              onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
              className="cursor-pointer pr-10"
              disabled={isUploading}
            />
            {selectedFile && !isUploading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
            {isUploading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              </div>
            )}
            <input
              id="file-upload"
              name="resumeFile"
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              required={resumeType === 'PDF'}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          {selectedFile ? (
            <p className="mt-2 text-sm text-gray-500">
              PDF 파일만 가능, {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB/10MB
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              PDF 파일만 가능, 최대 10MB
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;