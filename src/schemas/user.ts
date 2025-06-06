import { z } from 'zod';

export const resumeSchema = z.object({
  name: z.string(),
  type: z.enum(['PDF', 'LINK']),
  url: z.string().min(1, '올바르지 않은 이력서입니다.'),
});

export const signupSchema = z.object({
  name: z.string()
    .min(2, '이름을 2글자 이상 입력해주세요')
    .max(4, '이름은 4글자 이하로 입력해주세요'),
  
  email: z.string()
    .email('올바른 이메일 형식이 아닙니다'),
  
  studentNumber: z.string()
    .regex(/^\d{4}$/, '학번은 4자리 숫자여야 합니다'),
  
  phoneNumber: z.string()
    .regex(/^010\d{8}$/, '전화번호는 010으로 시작하는 11자리 숫자여야 합니다'),
  
  resume: resumeSchema,
});

export type SignupSchema = z.infer<typeof signupSchema>; 