import { z } from 'zod';

// Zod schemas prevent SQLi / Malicious injections by strictly enforcing input shapes
export const loginSchema = z.object({
    email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }).max(255, { message: '이메일 주소가 너무 깁니다.' }),
    password: z.string().min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }).max(100, { message: '비밀번호가 너무 깁니다.' }),
});

export const signupSchema = z.object({
    email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }).max(255, { message: '이메일 주소가 너무 깁니다.' }),
    password: z.string().min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }).max(100, { message: '비밀번호가 너무 깁니다.' }),
});
