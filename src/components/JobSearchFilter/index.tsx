import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RotateCcw, Search } from "lucide-react"
import { EMPLOYMENT_TYPES, LOCATIONS, POSITIONS } from "@/constants/jobData"
import { memo } from "react"

interface JobSearchFilterProps {
  searchQuery: string
  selectedPosition: string
  selectedLocation: string
  selectedType: string
  onSearchQueryChange: (value: string) => void
  onPositionChange: (value: string) => void
  onLocationChange: (value: string) => void
  onTypeChange: (value: string) => void
  onReset: () => void
}

function JobSearchFilter({
  searchQuery,
  selectedPosition,
  selectedLocation,
  selectedType,
  onSearchQueryChange,
  onPositionChange,
  onLocationChange,
  onTypeChange,
  onReset
}: JobSearchFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="회사명, 포지션으로 검색하세요..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedPosition} onValueChange={onPositionChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="포지션" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {POSITIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="지역" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {LOCATIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="고용형태" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {EMPLOYMENT_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            title="필터 초기화"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default memo(JobSearchFilter);
