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
            value={formData.name}
            onChange={onChange}
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
            required
            value={formData.studentNumber}
            onChange={onChange}
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
            required
            value={formData.phoneNumber}
            onChange={onChange}
          />
        </div>
      </>
    );
  };

export default UserForm;