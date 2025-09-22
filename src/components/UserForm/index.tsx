import { SignupRequest } from '@/types/auth';
import { Input } from '@/components/ui/input';

const UserForm = ({
    formData,
    onChange,
  }: {
    formData: SignupRequest;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    return (
      <>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            maxLength={4}
            value={formData.name}
            onChange={onChange}
            placeholder="이름"
          />
        </div>
  
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={onChange}
            placeholder="이메일"
          />
        </div>
  
        <div>
          <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">
            학번
          </label>
          <Input
            id="studentNumber"
            name="studentNumber"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            maxLength={4}
            value={formData.studentNumber}
            onChange={onChange}
            placeholder="학번 (예: 3111)"
          />
        </div>
  
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            전화번호
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            maxLength={11}
            value={formData.phoneNumber}
            onChange={onChange}
            placeholder="전화번호 (예: 01012345123)"
          />
        </div>

        <div>
          <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700">
            이력서 링크 (선택사항)
          </label>
          <Input
            id="resumeUrl"
            name="resumeUrl"
            type="url"
            value={(formData.resume && formData.resume.url) || ''}
            onChange={onChange}
            placeholder="https://drive.google.com/... 또는 https://github.com/..."
          />
        </div>

        <div>
          <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700">
            포트폴리오 링크 (선택사항)
          </label>
          <Input
            id="portfolioUrl"
            name="portfolioUrl"
            type="url"
            value={(formData.portfolio && formData.portfolio.url) || ''}
            onChange={onChange}
            placeholder="https://portfolio.com/... 또는 https://github.com/..."
          />
        </div>
      </>
    );
  };

export default UserForm;