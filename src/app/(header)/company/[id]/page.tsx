"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, Download, FileText, MapPin, Users } from "lucide-react"
import { useParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "@tanstack/react-query"
import { getJobPostingDetail } from "@/api/posting"
import { getEmploymentTypeText, getLocationText, getTypeColor } from "@/utils/jobUtils"
import { formatDate } from "@/utils/dateUtils"
import Link from "next/link"
import { convertUrlsToLinks } from "@/utils/textUtils"

export default function CompanyDetailPage() {
  const params = useParams()

  const { data: posting, isLoading } = useQuery({
    queryKey: ["posting", params.id],
    queryFn: () => getJobPostingDetail(params.id as string),
  })

  if (isLoading) {
    return <div>로딩중...</div>
  }

  if (!posting) {
    return <div>데이터를 찾을 수 없습니다.</div>
  }

  return (
    <div className="h-[calc(100vh-(4rem+1px))] bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{posting.companyName}</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{getLocationText(posting.companyLocation)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>지원자 {posting.applicationCount}명</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>마감일: {formatDate(posting.endAt)}</span>
                  </div>
                </div>
                <Badge className={getTypeColor(posting.employmentType)}>{getEmploymentTypeText(posting.employmentType)}</Badge>
              </div>

            {posting.applied ? (
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto opacity-50 cursor-not-allowed"
                disabled
              >
                지원완료
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                asChild
              >
                <Link href={`/apply/${params.id}`}>
                  지원하기
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Company Description */}
        <Card className="mb-8 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              회사 소개
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed text-base">
                {convertUrlsToLinks(posting.companyDescription)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positions */}
        <Card className="mb-8 bg-white">
          <CardHeader>
            <CardTitle>모집 포지션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posting.positions.map((position, index) => (
                <div key={position.id}>
                  <div className="flex items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{position.name}</h3>
                    </div>
                    
                  </div>
                  {index < posting.positions.length - 1 && <Separator className="mt-4 bg-gray-200" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}