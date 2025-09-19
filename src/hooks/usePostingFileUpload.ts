// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { uploadPosting } from "@/api/file";
// import { toast } from "sonner";
// import { AxiosError } from "axios";

// const usePostingFileUpload = () => {
//   const queryClient = useQueryClient();

//   const { mutateAsync: uploadFile, isPending: isUploading } = useMutation({
//     mutationFn: async (file: File) => {
//       return await uploadPosting(file);
//     },
//     onError: (error: Error) => {
//       console.error(error);
//       if (error instanceof AxiosError) {
//         toast.error(error.response?.data?.message);
//       } else {
//         toast.error('파일 업로드에 실패했습니다.');
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['postings'] });
//     }
//   });

//   return { uploadFile, isUploading };
// };

// export default usePostingFileUpload; 