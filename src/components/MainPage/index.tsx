"use client"

import { useState, useMemo, useCallback } from "react"
import JobSearchFilter from "@/components/JobSearchFilter"
import JobCard from "@/components/JobCard"
import EmptyState from "@/components/EmptyState"
import { useProfileQuery } from "@/hooks/useProfileQuery"
import { Skeleton } from "@/components/ui/skeleton"
import { useJobListingsQuery } from "@/hooks/useJobListingsQuery"
import { usePositionsQuery } from "@/hooks/usePositionsQuery"
import { SkeletonJobCard } from "@/components/JobCard"
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
  const { data: jobListings, isLoading: isJobListingsLoading } = useJobListingsQuery()
  const { data: positions, isLoading: isPositionsLoading } = usePositionsQuery()

  const filteredJobListings = useMemo(() => {
    if (!jobListings?.postings) return [];
    
    return jobListings.postings.filter((job) => {
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
    });
  }, [jobListings?.postings, searchQuery, selectedPosition, selectedLocation, selectedType]);

  const isLoading = useMemo(() => 
    isProfileLoading || isJobListingsLoading || isPositionsLoading,
    [isProfileLoading, isJobListingsLoading, isPositionsLoading]
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
          positions={positions || []}
        />

        <div className="grid gap-6">
          {isLoading ? (
            [0, 1, 2].map((index) => (
              <SkeletonJobCard key={index} index={index} />
            ))
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