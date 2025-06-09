import { instance } from "@/lib/axios";

interface FileUploadResponse {
  url: string;
}

export const uploadResume = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await instance.post<FileUploadResponse>('/file/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('파일 업로드에 실패했습니다.');
  }

  return response.data.url;
};


export const uploadPosting = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await instance.post<FileUploadResponse>('/file/posting', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('파일 업로드에 실패했습니다.');
  }

  return response.data.url;
};

export const uploadMultiplePostingFiles = async (files: File[]): Promise<{ url: string; name: string }[]> => {
  const uploadPromises = files.map(async (file) => {
    const url = await uploadPosting(file);
    return {
      url,
      name: file.name
    };
  });

  return Promise.all(uploadPromises);
};