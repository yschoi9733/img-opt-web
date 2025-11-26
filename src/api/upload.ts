// src/api/upload.ts
import { wasInstance } from './http';

export interface UploadResponse {
  message: string;
  fileKey: string;
  originalUrl: string;
  optimizedUrl: string; // 백엔드에서 주는 기본 변환 URL
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file); // 백엔드 multer 설정의 fieldname인 'image'와 일치해야 함

  const response = await wasInstance.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
