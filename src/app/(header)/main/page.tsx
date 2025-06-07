"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import JobSearchFilter from "@/components/JobSearchFilter"
import JobCard from "@/components/JobCard"
import EmptyState from "@/components/EmptyState"
import { getJobListings } from "@/api/posting"
import { Loader2 } from "lucide-react"
import { JobListingsResponse } from "@/types/posting"
import { useProfileQuery } from "@/hooks/useProfileQuery"

export default function MainPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedType, setSelectedType] = useState("")

  const { data: profile, isLoading: isProfileLoading } = useProfileQuery()

  const { data: jobListings, isLoading: isJobListingsLoading } = useQuery<JobListingsResponse>({
    queryKey: ["jobListings"],
    queryFn: getJobListings,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  if (isProfileLoading || isJobListingsLoading || !jobListings || !profile) {
    return (
      <div className="h-[calc(100vh-(4rem+1px))] bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-(4rem+1px))] bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">안녕하세요, {profile?.name}님! 👋</h1>
          <p className="text-gray-600">새로운 채용 기회를 찾아보세요. 총 {jobListings.count}개의 공고가 있습니다.</p>
        </div>

        <JobSearchFilter
          searchQuery={searchQuery}
          selectedPosition={selectedPosition}
          selectedLocation={selectedLocation}
          selectedType={selectedType}
          onSearchQueryChange={setSearchQuery}
          onPositionChange={setSelectedPosition}
          onLocationChange={setSelectedLocation}
          onTypeChange={setSelectedType}
          onReset={() => {
            setSearchQuery("")
            setSelectedPosition("")
            setSelectedLocation("")
            setSelectedType("")
          }}
        />

        <div className="grid gap-6">
          {jobListings.postings.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              companyName={job.companyName}
              companyLocation={job.companyLocation}
              employmentType={job.employmentType}
              positions={job.positions}
              applicationCount={job.applicationCount}
              endAt={job.endAt}
            />
          ))}
        </div>

        {jobListings.postings.length === 0 && <EmptyState />}
      </main>
    </div>
  )
}