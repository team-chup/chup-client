import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RotateCcw, Search } from "lucide-react"
import { EMPLOYMENT_TYPES, LOCATIONS } from "@/constants/jobData"
import { memo } from "react"
import { Position } from "@/types/posting"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"

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
  positions: Position[]
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
  onReset,
  positions
}: JobSearchFilterProps) {
  const positionOptions: ComboboxOption[] = positions.map((position) => ({
    value: position.name,
    label: position.name
  }))

  const locationOptions: ComboboxOption[] = LOCATIONS

  const employmentTypeOptions: ComboboxOption[] = EMPLOYMENT_TYPES

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
          <Combobox
            options={positionOptions}
            value={selectedPosition}
            onValueChange={onPositionChange}
            placeholder="포지션"
            searchPlaceholder="포지션 검색..."
            emptyMessage="포지션 결과 없음"
            width="w-full sm:w-[180px]"
          />

          <Combobox
            options={locationOptions}
            value={selectedLocation}
            onValueChange={onLocationChange}
            placeholder="지역"
            searchPlaceholder="지역 검색..."
            emptyMessage="지역 결과 없음"
            width="w-full sm:w-[180px]"
          />

          <Combobox
            options={employmentTypeOptions}
            value={selectedType}
            onValueChange={onTypeChange}
            placeholder="고용형태"
            searchPlaceholder="고용형태 검색..."
            emptyMessage="고용형태 결과 없음"
            width="w-full sm:w-[180px]"
          />

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
