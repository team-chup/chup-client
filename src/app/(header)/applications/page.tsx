"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMyApplications } from "@/api/myApplications"
import { Application } from "@/types/application"
import { useRouter } from "next/navigation"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("latest")

  const router = useRouter()

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true)
        const response = await getMyApplications()
        setApplications(response.applications)
        setTotalCount(response.count)
      } catch (error) {
        console.error("지원서 목록을 불러오는데 실패했습니다:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const statusMapping = {
    PENDING: "지원완료",
    ANNOUNCED: "서류통과",
  }

  const employmentTypeMapping = {
    FULL_TIME: "정규직",
    CONTRACT: "계약직",
    INTERN: "인턴",
    MILITARY_EXCEPTION: "병역특례",
  }

  const locationMapping: Record<string, string> = {
    SEOUL: "서울",
    BUSAN: "부산",
    DAEGU: "대구",
    INCHEON: "인천",
    GWANGJU: "광주",
    DAEJEON: "대전",
    ULSAN: "울산",
    SEJONG: "세종",
    GYEONGGI: "경기",
    GANGWON: "강원",
    CHUNGBUK: "충북",
    CHUNGNAM: "충남",
    JEONBUK: "전북",
    JEONNAM: "전남",
    GYEONGBUK: "경북",
    GYEONGNAM: "경남",
    JEJU: "제주",
  }

  const formattedApplications = applications.map(app => ({
    id: app.id,
    company: app.companyName,
    logo: app.companyName.substring(0, 2),
    position: app.position.name,
    appliedDate: new Date(app.createAt).toISOString().split('T')[0],
    status: app.result?.status === "FAILED" ? "불합격" : statusMapping[app.status],
    location: `${locationMapping[app.companyLocation] || "기타"} ${app.companyLocation === "SEOUL" ? "서울" : ""}`,
    type: employmentTypeMapping[app.employmentType],
    rejectionReason: app.result?.failedReason,
  }))

  const filteredApplications = formattedApplications.filter(
    (app) => selectedStatus === "all" || app.status === selectedStatus
  )

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    }
    return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
  })

  const getStatusCounts = () => {
    return {
      all: formattedApplications.length,
      지원완료: formattedApplications.filter((app) => app.status === "지원완료").length,
      서류통과: formattedApplications.filter((app) => app.status === "서류통과").length,
      불합격: formattedApplications.filter((app) => app.status === "불합격").length,
    }
  }

  const statusCounts = getStatusCounts()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "지원완료":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "서류통과":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "불합격":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "지원완료":
        return "bg-orange-100 text-orange-800"
      case "서류통과":
        return "bg-blue-100 text-blue-800"
      case "불합격":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "정규직":
        return "bg-blue-100 text-blue-800"
      case "계약직":
        return "bg-orange-100 text-orange-800"
      case "인턴":
        return "bg-purple-100 text-purple-800"
      case "병역특례":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleLogout = () => {
    console.log("학생 로그아웃")
  }

  return (
    <div className=" bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">지원 현황</h1>
          <p className="text-gray-600">총 {totalCount}개의 지원 내역이 있습니다.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">지원 내역을 불러오는 중...</p>
          </div>
        ) : (
          <>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  전체 <Badge variant="secondary">{statusCounts.all}개</Badge>
                </TabsTrigger>
                <TabsTrigger value="지원완료" className="flex items-center gap-2">
                  지원완료 <Badge variant="secondary">{statusCounts.지원완료}개</Badge>
                </TabsTrigger>
                <TabsTrigger value="서류통과" className="flex items-center gap-2">
                  서류통과 <Badge variant="secondary">{statusCounts.서류통과}개</Badge>
                </TabsTrigger>
                <TabsTrigger value="불합격" className="flex items-center gap-2">
                  불합격 <Badge variant="secondary">{statusCounts.불합격}개</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="oldest">오래된순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {sortedApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{application.company}</h3>
                            <Badge className={getTypeColor(application.type)}>{application.type}</Badge>
                          </div>

                          <p className="text-emerald-700 font-medium mb-2">{application.position}</p>

                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{application.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>지원일: {application.appliedDate}</span>
                            </div>
                          </div>

                          {application.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                              <p className="text-sm text-red-800">
                                <strong>불합격 사유:</strong> {application.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(application.status)}
                          <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                        </div>

                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          상세보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sortedApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">지원 내역이 없습니다</h3>
                <p className="text-gray-600 mb-4">채용 공고에 지원해보세요!</p>
                <Button className="bg-blue-100 hover:bg-blue-200 border border-blue-300" onClick={() => router.push('/main')}>채용공고 보러가기</Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
