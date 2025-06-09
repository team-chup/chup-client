import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Users, Eye, Settings } from "lucide-react"
import { getTypeColor, getEmploymentTypeText, getLocationText, getDaysLeft } from "@/utils/jobUtils"
import Link from "next/link"

interface Position {
  id: number
  name: string
}

interface JobCardProps {
  id: number
  companyName: string
  companyLocation: string
  employmentType: string
  positions: Position[]
  applicationCount: number
  endAt: string
  authority?: string
}

export default function JobCard({
  id,
  companyName,
  companyLocation,
  employmentType,
  positions,
  applicationCount,
  endAt,
  authority
}: JobCardProps) {
  const daysLeft = getDaysLeft(endAt)

  return (
    <Card key={id} className="hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{companyName}</h3>
                <Badge className={getTypeColor(employmentType)}>
                  {getEmploymentTypeText(employmentType)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {positions.map((position) => (
                  <Badge key={position.id} variant="outline" className="text-blue-700 border-blue-200">
                    {position.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{getLocationText(companyLocation)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>지원자 {applicationCount}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className={daysLeft <= 3 ? "text-red-600 font-medium" : ""}>
                    {daysLeft > 0 ? `${daysLeft}일 남음` : "마감"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex ${authority === "TEACHER" ? "items-center gap-2" : "flex-col items-end gap-2"}`}>
            {authority === "TEACHER" ? (
              <>
                <Link href={`/admin/applications/${id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    지원 현황
                  </Button>
                </Link>
                <Link href={`/admin/edit/${id}`}>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={`/company/${id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-[#fafafa]">
                  상세보기
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}