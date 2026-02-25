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

export const videoUploadSchema = z.object({
    title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목이 너무 깁니다.'),
    description: z.string().max(1000, '설명이 너무 깁니다.').optional(),
    youtube_id: z.string().min(1, '유튜브 ID가 필요합니다.').max(50, 'ID가 너무 깁니다.').regex(/^[a-zA-Z0-9_-]+$/, '유효하지 않은 유튜브 ID 형식입니다.'),
});

export const commentSchema = z.object({
    content: z.string().min(1, '내용을 입력해주세요.').max(1000, '댓글이 너무 깁니다. (최대 1000자)'),
    timestamp: z.string().max(10, '시간 형식이 잘못되었습니다.').optional().nullable(),
    author_name: z.string().max(50, '이름이 너무 깁니다.').optional().nullable(),
});
