"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import JobSearchFilter from "@/components/JobSearchFilter"
import JobCard from "@/components/JobCard"
import EmptyState from "@/components/EmptyState"
import { getJobListings } from "@/api/posting"
import { JobListingsResponse } from "@/types/posting"
import { useProfileQuery } from "@/hooks/useProfileQuery"
import { Skeleton } from "@/components/ui/skeleton"
import useDeleteIdStore from "@/store/useDeleteIdStore"

interface MainPageProps {
  isAdmin: boolean;
}

export default function MainPage({ isAdmin = false }: MainPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedType, setSelectedType] = useState("")

  const { deleteId } = useDeleteIdStore();

  const { data: profile, isLoading: isProfileLoading } = useProfileQuery()

  const { data: jobListings, isLoading: isJobListingsLoading } = useQuery<JobListingsResponse>({
    queryKey: ["jobListings"],
    queryFn: getJobListings,
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const filteredJobListings = jobListings?.postings.filter((job) => {
    if (deleteId !== undefined && job.id === Number(deleteId)) return false
  
    const matchesSearch = searchQuery
      ? job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.positions.some((pos) => pos.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  
    const matchesPosition = selectedPosition
      ? job.positions.some((pos) => pos.name === selectedPosition)
      : true
  
    const matchesLocation = selectedLocation
      ? job.companyLocation === selectedLocation
      : true
  
    const matchesType = selectedType
      ? job.employmentType === selectedType
      : true
  
    return matchesSearch && matchesPosition && matchesLocation && matchesType
  })

  return (
    <div className="h-[calc(100vh-(4rem+1px))] bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isProfileLoading || isJobListingsLoading || !jobListings || !profile ? (
          <>
            <div className="mb-8">
              <Skeleton className="h-8 w-80 mb-2 bg-gray-200" />
              <Skeleton className="h-5 w-96 bg-gray-200" />
            </div>
  
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Skeleton className="h-10 w-full bg-gray-200" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Skeleton className="h-10 w-full sm:w-[180px] bg-gray-200" />
                  <Skeleton className="h-10 w-full sm:w-[180px] bg-gray-200" />
                  <Skeleton className="h-10 w-full sm:w-[180px] bg-gray-200" />
                  <Skeleton className="h-10 w-10 bg-gray-200" />
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="h-6 w-48 bg-gray-200" />
                          <Skeleton className="h-5 w-16 bg-gray-200" />
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Skeleton className="h-5 w-24 bg-gray-200" />
                          <Skeleton className="h-5 w-20 bg-gray-200" />
                        </div>
                        <div className="flex items-center gap-6">
                          <Skeleton className="h-4 w-20 bg-gray-200" />
                          <Skeleton className="h-4 w-16 bg-gray-200" />
                          <Skeleton className="h-4 w-14 bg-gray-200" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-9 w-20 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              {isAdmin ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드 👨‍🏫</h1>
                  <p className="text-gray-600">총 {jobListings.count}개의 채용공고를 관리하고 있습니다.</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">안녕하세요, {profile.name}님! 👋</h1>
                  <p className="text-gray-600">새로운 채용 기회를 찾아보세요. 총 {jobListings.count}개의 공고가 있습니다.</p>
                </>
              )}
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
              {filteredJobListings?.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  companyName={job.companyName}
                  companyLocation={job.companyLocation}
                  employmentType={job.employmentType}
                  positions={job.positions}
                  applicationCount={job.applicationCount}
                  endAt={job.endAt}
                  authority={profile.authority}
                />
              ))}
            </div>
          </>
        )}
        {filteredJobListings?.length === 0 && <EmptyState />}
      </main>
    </div>
  )
}