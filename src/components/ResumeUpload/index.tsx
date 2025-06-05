import { Input } from '@/components/ui/input';

type ResumeType = 'PDF' | 'LINK';

const ResumeUpload = ({
    resumeType,
    resumeLink,
    selectedFile,
    onResumeTypeChange,
    onResumeLinkChange,
    onFileChange,
  }: {
    resumeType: ResumeType;
    resumeLink: string;
    selectedFile: File | null;
    onResumeTypeChange: (type: ResumeType) => void;
    onResumeLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
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
          >
            PDF
          </button>
        </div>
  
        {resumeType === 'LINK' ? (
          <div>
            <Input
              type="url"
              placeholder="이력서 링크를 입력하세요"
              value={resumeLink}
              onChange={onResumeLinkChange}
              required={resumeType === 'LINK'}
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
                readOnly
                value={selectedFile?.name || ''}
                placeholder="PDF 파일을 선택해주세요"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="cursor-pointer"
              />
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={onFileChange}
                required={resumeType === 'PDF'}
                className="hidden"
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