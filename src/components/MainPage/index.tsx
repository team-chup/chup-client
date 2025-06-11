"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import JobSearchFilter from "@/components/JobSearchFilter"
import JobCard from "@/components/JobCard"
import EmptyState from "@/components/EmptyState"
import { useProfileQuery } from "@/hooks/useProfileQuery"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useJobListingsQuery } from "@/hooks/useJobListingsQuery"

interface MainPageProps {
  isAdmin: boolean;
}

const SkeletonCard = memo(({ index }: { index: number }) => (
  <Card key={index} className="hover:shadow-md min-h-[140px] transition-shadow bg-white">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-3">
              <Skeleton className="h-6 w-48 bg-gray-200" />
              <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              <Skeleton className="h-5 w-24 rounded-full bg-gray-200" />
              <Skeleton className="h-5 w-20 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-20 bg-gray-200" />
              <Skeleton className="h-4 w-16 bg-gray-200" />
              <Skeleton className="h-4 w-14 bg-gray-200" />
            </div>
          </div>
        </div>
        <Link href="#">
          <Button className="bg-blue-600 hover:bg-blue-700 text-[#fafafa]" disabled>
            상세보기
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
));

const SkeletonCardList = memo(() => (
  <>
    {[0, 1, 2].map((index) => (
      <SkeletonCard key={index} index={index} />
    ))}
  </>
));

export default function MainPage({ isAdmin = false }: MainPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedType, setSelectedType] = useState("")


  const { data: profile, isLoading: isProfileLoading } = useProfileQuery()
  const { data: jobListings, isLoading: isJobListingsLoading } = useJobListingsQuery()

  const filteredJobListings = useMemo(() => {
    if (!jobListings?.postings) return [];
    
    return jobListings.postings.filter((job) => {
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
    });
  }, [jobListings?.postings, searchQuery, selectedPosition, selectedLocation, selectedType]);

  const isLoading = useMemo(() => 
    isProfileLoading || isJobListingsLoading,
    [isProfileLoading, isJobListingsLoading]
  );

  const isEmpty = useMemo(() => 
    !isLoading && filteredJobListings.length === 0,
    [isLoading, filteredJobListings.length]
  );

  const handleReset = useCallback(() => {
    setSearchQuery("")
    setSelectedPosition("")
    setSelectedLocation("")
    setSelectedType("")
  }, []);
  
  const ProfileName = useMemo(() => {
    if (isLoading || !profile) {
      return <Skeleton className="inline-block h-7 w-[78px] bg-gray-200 align-middle" />;
    }
    return <span className="font-semibold">{profile.name || ""}</span>;
  }, [isLoading, profile]);

  const PostingCount = useMemo(() => {
    return <span className="font-semibold">{isLoading ? 0 : jobListings?.count || 0}</span>;
  }, [isLoading, jobListings?.count]);

  return (
    <div className="h-[calc(100vh-(4rem+1px))] bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {isAdmin ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                관리자 대시보드 👨‍🏫
              </h1>
              <p className="text-gray-600">
                총{" "}
                {PostingCount}
                개의 채용공고를 관리하고 있습니다.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                안녕하세요,{" "}
                {ProfileName}
                님! 👋
              </h1>
              <p className="text-gray-600">
                새로운 채용 기회를 찾아보세요. 총{" "}
                {PostingCount}
                개의 공고가 있습니다.
              </p>
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
          onReset={handleReset}
        />

        <div className="grid gap-6">
          {isLoading ? (
            <SkeletonCardList />
          ) : (
            filteredJobListings.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                companyName={job.companyName}
                companyLocation={job.companyLocation}
                employmentType={job.employmentType}
                positions={job.positions}
                applicationCount={job.applicationCount}
                endAt={job.endAt}
                authority={profile?.authority}
              />
            ))
          )}
        </div>

        {isEmpty && <EmptyState />}
      </main>
    </div>
  )
}