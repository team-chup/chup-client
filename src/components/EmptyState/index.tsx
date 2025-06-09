import { Briefcase } from "lucide-react"

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
      <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
    </div>
  )
}
