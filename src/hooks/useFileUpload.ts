import { instance } from "@/lib/axios"; 

interface FileUploadResponse {
    url: string;
}

const useFileUpload = () => {
    const uploadFile = async (file: File) => {
      try {
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];
  
        const formData = new FormData();
        formData.append('file', file);
  
        const { data } = await instance.post<FileUploadResponse>('/file/resume', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: accessToken || '',
          },
        });
  
        return data.url;
      } catch (error) {
        console.error('File upload failed:', error);
        throw error;
      }
    };
  
    return { uploadFile };
  };

export default useFileUpload;