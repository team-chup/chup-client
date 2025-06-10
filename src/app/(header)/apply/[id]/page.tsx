"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useJobPostingQuery } from "@/hooks/useJobPostingQuery";
import { useApplicationMutation } from "@/hooks/useApplicationMutation";
import { CheckCircle, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getEmploymentTypeText, getLocationText, getTypeColor } from "@/utils/jobUtils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SuccessModal from "@/components/SuccessModal";

const ApplyPage = () => {
  const params = useParams();
  const router = useRouter();
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { mutate: submitApplication, isPending } = useApplicationMutation();

  const { data: profile, isLoading: isProfileLoading } = useProfileQuery();
  const { data: posting, isLoading: isPostingLoading } = useJobPostingQuery(params.id as string);

  const handlePositionToggle = (positionId: number) => {
    setSelectedPosition(prev => prev === positionId ? null : positionId);
  };

  const handleSubmit = async () => {
    if (!selectedPosition) {
      toast.error("지원할 포지션을 선택해주세요.");
      return;
    }

    submitApplication(
      { positionId: selectedPosition, postingId: params.id as string },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
        },
        onError: (error) => {
          console.error("지원 실패:", error);
          toast.error("지원에 실패했습니다. 다시 시도해주세요.");
        },
      }
    );
  };

  if (isPostingLoading || isProfileLoading) {
    return <div>로딩중...</div>;
  }

  if (!posting) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  const selectedPositionData = posting.positions.find(p => p.id === selectedPosition);

  return (
    <>
      {showSuccessModal && (
        <SuccessModal
          companyName={posting.companyName}
          positionName={selectedPositionData?.name || ""}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">지원서 작성</h1>
            <p className="text-gray-600">아래 정보를 확인하고 지원서를 제출해주세요.</p>
          </div>

          {/* Company Info */}
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle>지원 회사</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{posting.companyName}</h3>
                  <div className="flex items-center gap-4 text-gray-600 mt-1">
                    <span>{getLocationText(posting.companyLocation)}</span>
                    <Badge className={getTypeColor(posting.employmentType)}>{getEmploymentTypeText(posting.employmentType)}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Selection */}
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle>지원 포지션 선택</CardTitle>
              <p className="text-sm text-gray-600">지원하고자 하는 포지션을 선택해주세요.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posting.positions.map((position) => (
                  <div key={position.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                    <Checkbox
                      id={`position-${position.id}`}
                      checked={selectedPosition === position.id}
                      onCheckedChange={() => handlePositionToggle(position.id)}
                      className="border-zinc-900 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`position-${position.id}`}
                        className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {position.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />내 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">이름</Label>
                  <Input value={profile?.name} disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">학번</Label>
                  <Input value={profile?.studentNumber} disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">이메일</Label>
                  <Input value={profile?.email} disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">연락처</Label>
                  <Input value={profile?.phoneNumber} disabled className="mt-1" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>안내:</strong> 개인정보 수정이 필요한 경우 프로필 페이지에서 변경해주세요.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPosition || isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  지원 중...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  지원하기
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default ApplyPage;