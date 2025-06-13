"use client"

import { useState, useEffect } from "react"
import { deleteJobPosting, getJobPostingDetail, updateJobPosting } from "@/api/posting"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { 
  AttachmentFile, 
} from "@/types/posting"
import JobForm, { 
  JobFormData, 
  AttachmentWithFile, 
  EMPLOYMENT_TYPE_MAPPING, 
  LOCATION_MAPPING,
  REVERSE_LOCATION_MAPPING,
  REVERSE_EMPLOYMENT_MAPPING
} from "@/components/JobForm"
import { DialogHeader, DialogFooter, DialogTitle, DialogContent, Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import useDeleteIdStore from "@/store/useDeleteIdStore"

interface Props {
  params: {
    id: string;
  };
}

export default function EditJobPage({ params }: Props) {
  const postingId = params.id;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteBtnClick, setIsDeleteBtnClick] = useState(false);
  const [isJobPostingLoading, setIsJobPostingLoading] = useState(true);
  const [initialFormData, setInitialFormData] = useState<JobFormData | undefined>(undefined);
  const [initialPositions, setInitialPositions] = useState<number[]>([]);

  const { setDeleteId } = useDeleteIdStore();

  useEffect(() => {
    const loadJobPostingDetail = async () => {
      try {
        const jobPostingDetail = await getJobPostingDetail(postingId);
        
        const locationKey = REVERSE_LOCATION_MAPPING[jobPostingDetail.companyLocation] || "";
        const employmentTypeKey = REVERSE_EMPLOYMENT_MAPPING[jobPostingDetail.employmentType] || "";
        
        const startDate = jobPostingDetail.startAt ? new Date(jobPostingDetail.startAt) : null;
        const endDate = jobPostingDetail.endAt ? new Date(jobPostingDetail.endAt) : null;
        
        const positionIds = jobPostingDetail.positions?.map(position => position.id) || [];
        setInitialPositions(positionIds);
        
        const attachmentsWithFile: AttachmentWithFile[] = (jobPostingDetail.files || []).map(file => ({
          file: new File([], file.name), 
          url: file.url,
          name: file.name
        }));
        
        setInitialFormData({
          company: jobPostingDetail.companyName,
          description: jobPostingDetail.companyDescription || "",
          location: locationKey,
          customLocation: locationKey === "" ? jobPostingDetail.companyLocation : "",
          employmentType: employmentTypeKey,
          startDate,
          endDate,
          attachments: attachmentsWithFile,
          positions: jobPostingDetail.positions || []
        });

      } catch (error) {
        console.error("채용공고 상세 정보 로드 실패:", error);
        toast.error("채용공고 정보를 불러오는데 실패했습니다.");
        router.push("/admin/main");
      } finally {
        setIsJobPostingLoading(false);
      }
    };
    
    loadJobPostingDetail();
  }, [postingId, router]);

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const adjustedDate = new Date(year, month, day, 15, 0, 0);
    return adjustedDate.toISOString();
  };

  const handleSubmit = async (
    formData: JobFormData, 
    selectedPositions: number[], 
    uploadedFiles: AttachmentFile[]
  ) => {
    try {
      setIsSubmitting(true);
      
      const finalLocation = formData.location === "custom" ? formData.customLocation : formData.location;
      const mappedLocation = formData.location === "custom" 
        ? "SEOUL"
        : LOCATION_MAPPING[finalLocation] || "SEOUL";
      
      // 수정된 날짜 변환 함수 사용
      const startAt = formatDateForAPI(formData.startDate);
      const endAt = formatDateForAPI(formData.endDate);
      
      const requestData = {
        companyName: formData.company,
        companyDescription: formData.description,
        companyLocation: mappedLocation,
        employmentType: EMPLOYMENT_TYPE_MAPPING[formData.employmentType],
        positions: selectedPositions,
        files: uploadedFiles,
        startAt,
        endAt
      };
      
      await updateJobPosting(postingId, requestData);
      
      toast.success("채용공고가 성공적으로 수정되었습니다");
      router.push("/admin/main");
      
    } catch (error) {
      console.error("채용공고 수정 실패:", error);
      toast.error("채용공고 수정에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      await deleteJobPosting(postingId);
      
      toast.success("채용공고가 삭제되었습니다");
      setDeleteId(postingId)
      router.push("/admin/main");
      
    } catch (error) {
      console.error("채용공고 삭제 실패:", error);
      toast.error("채용공고 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isJobPostingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">채용공고 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isDeleteBtnClick} onOpenChange={setIsDeleteBtnClick}>
        <DialogContent className={cn('bg-white')}>
          <DialogHeader>
            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          </DialogHeader>

          <div>
            이 채용공고를 삭제하면 되돌릴 수 없습니다.
            <br />
            해당 공고에 지원한 모든 지원자의 정보도 함께 삭제되며, 복구가 불가능합니다.

            <br />
            <br />
            <p className={cn('font-bold')}>
              정말 삭제하시겠습니까?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant={'outline'}
              onClick={() => setIsDeleteBtnClick(false)}
            >
              취소
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">채용공고 수정</h1>
            <p className="text-gray-600">채용공고 정보를 수정하여 GSM 학생들에게 정확한 정보를 제공하세요</p>
          </div>

          <div className="grid gap-6">
          <JobForm
            initialData={initialFormData}
            submitButtonText="공고 수정"
            onSubmit={handleSubmit}
            isChangeablePositions={false}
            isSubmitting={isSubmitting}
            showAttachments={true}
            setIsDeleteBtnClick={setIsDeleteBtnClick}
            />
          </div>
        </main>
      </div>
    </>
  )
}
