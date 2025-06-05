import { z } from 'zod';

export const resumeSchema = z.object({
  name: z.string(),
  type: z.enum(['PDF', 'LINK']),
  url: z.string().min(1, '올바르지 않은 이력서입니다.'),
});

export const signupSchema = z.object({
  name: z.string()
    .min(1, '이름을 입력해주세요')
    .max(4, '이름은 4글자를 초과할 수 없습니다'),
  
  email: z.string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  
  studentNumber: z.string()
    .min(1, '학번을 입력해주세요')
    .regex(/^\d{4}$/, '학번은 4자리 숫자여야 합니다'),
  
  phoneNumber: z.string()
    .min(1, '전화번호를 입력해주세요')
    .regex(/^\d{11}$/, '전화번호는 11자리 숫자여야 합니다'),
  
  resume: resumeSchema,
});

export type SignupSchema = z.infer<typeof signupSchema>; 