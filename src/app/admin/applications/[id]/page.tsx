"use client"

import { useEffect, useState } from "react"
import { Calendar, Download, Mail, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DetailedApplication, DetailedApplicationsResponse, ResultStatus } from "@/types/application"
import { useParams } from "next/navigation"
import { getApplicationById, announceResult } from "@/api/myApplications"
import { useJobPostingQuery } from "@/hooks/useJobPostingQuery"
import { getLocationText } from "@/utils/jobUtils"
import { formatDate } from "@/utils/dateUtils"
import { forceDownload, downloadLinkAsTxt, wait } from "@/utils/downloadUtils"
import { toast } from "sonner"
import { downloadApplications } from "@/api/posting"

export default function ApplicationManagementPage() {
  const params = useParams()
  const applicationId = params.id as string
  
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [applicationData, setApplicationData] = useState<DetailedApplicationsResponse | null>(null)
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([])
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<DetailedApplication | null>(null)
  const [result, setResult] = useState<string>("")
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [isDownloading, setIsDownloading] = useState(false)

  const { data: jobPosting } = useJobPostingQuery(applicationId)

  useEffect(() => {
    const fetchApplicationData = async () => {
      setIsLoading(true)
      try {
        const data = await getApplicationById(Number(applicationId))
        setApplicationData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicationData()
  }, [applicationId])

  const handleApplicantToggle = (applicantId: number) => {
    setSelectedApplicants((prev) =>
      prev.includes(applicantId) ? prev.filter((id) => id !== applicantId) : [...prev, applicantId],
    )
  }

  const handleSelectAll = () => {
    if (!applicationData) return

    if (selectedApplicants.length === applicationData.applications.length) {
      setSelectedApplicants([])
    } else {
      setSelectedApplicants(applicationData.applications.map((app) => app.id))
    }
  }

  const handleResultSubmit = async () => {
    if (!selectedApplicant) return

    try {
      await announceResult(selectedApplicant.id, {
        status: result === 'pass' ? 'FIRST' : 'FAILED',
        failedReason: result === 'fail' ? rejectionReason : undefined,
      })

      const updatedData = await getApplicationById(Number(applicationId))
      setApplicationData(updatedData)
    } catch (err) {
      console.error(err)
    } finally {
      setIsResultDialogOpen(false)
      setSelectedApplicant(null)
      setResult("")
      setRejectionReason("")
    }
  }

  const handleSingleDownload = async (application: DetailedApplication) => {
    const { resume, applicant, position } = application;
    const filename = `${applicant.name}_${applicant.studentNumber}_${position.name}_이력서`;
    
    try {
      if (resume.type === 'LINK') {
        downloadLinkAsTxt(resume.url, `${filename}.txt`);
        toast.success('링크가 텍스트 파일로 다운로드되었습니다.');
      } else {
        await forceDownload(resume.url, `${filename}.pdf`);
        toast.success('이력서 다운로드가 완료되었습니다.');
      }
    } catch (error) {
      console.error('이력서 다운로드 실패:', error);
      toast.error('이력서 다운로드에 실패했습니다. 새 탭에서 열려고 시도합니다.');
    }
  };

  const handleBulkDownload = async () => {
    if (selectedApplicants.length === 0) return
    
    try {
      setIsDownloading(true)

      const selectedApplications = applicationData?.applications.filter(
        app => selectedApplicants.includes(app.id)
      );

      if (!selectedApplications || selectedApplications.length === 0) {
        toast.error('선택된 지원자 정보를 찾을 수 없습니다.');
        return;
      }

      try {
        await downloadApplications(applicationId, selectedApplicants);
        toast.success('이력서 다운로드가 완료되었습니다.');
      } catch (error) {
        console.error('이력서 다운로드 실패:', error);
        toast.error('이력서 다운로드에 실패했습니다.');
        
        try {
          for (const app of selectedApplications) {
            const { resume, applicant, position } = app;
            const filename = `${applicant.name}_${applicant.studentNumber}_${position.name}_이력서`;
            
            if (resume.type === 'LINK') {
              downloadLinkAsTxt(resume.url, `${filename}.txt`);
            } else {
              await forceDownload(resume.url, `${filename}.pdf`);
            }
            await wait(300);
          }
          toast.success('개별 이력서 다운로드가 완료되었습니다.');
        } catch (err) {
          console.error('개별 이력서 다운로드 실패:', err);
          toast.error('이력서 다운로드에 실패했습니다.');
        }
      }
      
    } catch (err) {
      console.error('이력서 다운로드 실패:', err);
      toast.error('이력서 다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAllDownload = async () => {
    if (!applicationData || applicationData.applications.length === 0) return
    
    try {
      setIsDownloading(true)

      const allApplicationIds = applicationData.applications.map(app => app.id);
      setSelectedApplicants(allApplicationIds);
      
      setTimeout(() => {
        handleBulkDownload();
      }, 0);
    } catch (err) {
      console.error('이력서 다운로드 실패:', err);
      toast.error('이력서 다운로드에 실패했습니다.');
    }
  };

  const getStatusText = (status: string, resultStatus?: ResultStatus) => {
    switch (status) {
      case 'PENDING':
        return "지원완료"
      case 'ANNOUNCED':
        return resultStatus === 'FIRST' ? "서류통과" : "불합격"
      default:
        return status
    }
  }

  const getStatusColor = (status: string, resultStatus?: ResultStatus) => {
    switch (status) {
      case 'PENDING':
        return "bg-orange-100 text-orange-800"
      case 'ANNOUNCED':
        return resultStatus === 'FIRST' 
          ? "bg-emerald-100 text-emerald-800" 
          : "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  if (error || !applicationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error || '데이터를 불러오는데 실패했습니다.'}</p>
      </div>
    )
  }

  const applications = applicationData.applications
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{jobPosting?.companyName}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {jobPosting?.positions.map((position) => (
                  <Badge key={position.id} variant="outline" className="text-blue-700 border-blue-200">
                    {position.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>{jobPosting?.companyLocation && getLocationText(jobPosting.companyLocation)}</span>
                <span>
                  {jobPosting?.employmentType === 'FULL_TIME' && '정규직'}
                  {jobPosting?.employmentType === 'CONTRACT' && '계약직'}
                  {jobPosting?.employmentType === 'INTERN' && '인턴'}
                  {jobPosting?.employmentType === 'MILITARY_EXCEPTION' && '병역특례'}
                </span>
                <span>마감일: {formatDate(jobPosting?.endAt)}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-2xl font-bold text-gray-900">{jobPosting?.applicationCount ?? 0}</span>
                <span className="text-gray-600">명 지원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox 
                checked={selectedApplicants.length === applications.length} 
                onCheckedChange={handleSelectAll} 
                className="border-zinc-900 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
              />
              <span className="text-sm text-gray-600">
                {selectedApplicants.length > 0 ? `${selectedApplicants.length}명 선택됨` : "전체 선택"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleBulkDownload} 
                disabled={selectedApplicants.length === 0 || isDownloading}
              >
                {isDownloading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                선택 이력서 다운로드
              </Button>
              {/* <Button
                onClick={handleAllDownload}
                disabled={applications.length === 0 || isDownloading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isDownloading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                전체 다운로드
              </Button> */}
            </div>
          </div>
        </div>

        {/* Applicants List */}
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedApplicants.includes(application.id)}
                    onCheckedChange={() => handleApplicantToggle(application.id)}
                    className="border-zinc-900 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{application.applicant.name}</h3>
                      <Badge className={getStatusColor(application.status, application.result?.status)}>
                        {getStatusText(application.status, application.result?.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">학번</p>
                        <p className="font-medium">{application.applicant.studentNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">지원 포지션</p>
                        <p className="font-medium text-blue-700">{application.position.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">이메일</p>
                        <p className="font-medium">{application.applicant.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">전화번호</p>
                        <p className="font-medium">{application.applicant.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>지원일: {formatDate(application.createdAt)}</span>
                      </div>
                    </div>

                    {application.result?.failedReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-800">
                          <strong>불합격 사유:</strong> {application.result.failedReason}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSingleDownload(application)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        이력서 {application.resume.type === 'LINK' ? '링크' : ''} 다운로드
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${application.applicant.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          이메일 보내기
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Dialog
                      open={isResultDialogOpen && selectedApplicant?.id === application.id}
                      onOpenChange={(open) => {
                        setIsResultDialogOpen(open)
                        if (!open) setSelectedApplicant(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedApplicant(application)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={application.status === 'ANNOUNCED'}
                        >
                          결과 통보
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader>
                          <DialogTitle>지원 결과 통보</DialogTitle>
                          <DialogDescription>{application.applicant.name} 학생의 지원 결과를 선택해주세요.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="result">결과</Label>
                            <Select value={result} onValueChange={setResult}>
                              <SelectTrigger>
                                <SelectValue placeholder="결과를 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pass">서류 합격</SelectItem>
                                <SelectItem value="fail">불합격</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {result === "fail" && (
                            <div>
                              <Label htmlFor="reason">불합격 사유 (선택사항)</Label>
                              <Textarea
                                id="reason"
                                placeholder="불합격 사유를 입력해주세요..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>
                            취소
                          </Button>
                          <Button
                            onClick={handleResultSubmit}
                            disabled={!result}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            결과 통보
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">지원자가 없습니다</h3>
            <p className="text-gray-600">아직 이 공고에 지원한 학생이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  )
}
