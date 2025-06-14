export type CompanyLocation =
  | "SEOUL"
  | "BUSAN"
  | "DAEGU"
  | "INCHEON"
  | "GWANGJU"
  | "DAEJEON"
  | "ULSAN"
  | "SEJONG"
  | "GYEONGGI"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "JEONBUK"
  | "JEONNAM"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "JEJU"

export type EmploymentType = "FULL_TIME" | "CONTRACT" | "INTERN" | "MILITARY_EXCEPTION"

export interface Position {
  id: number
  name: string
}

export interface JobPosting {
  id: number
  companyName: string
  companyLocation: CompanyLocation
  employmentType: EmploymentType
  positions: Position[]
  applicationCount: number
  createdAt: string
  startAt: string
  endAt: string
}

export interface JobListingsResponse {
  count: number
  postings: JobPosting[]
}

export interface AttachmentFile {
  url: string
  name: string
}

export interface JobPostingDetail {
  id: number
  companyName: string
  companyDescription: string
  companyLocation: CompanyLocation
  employmentType: EmploymentType
  positions: Position[]
  applicationCount: number
  startAt: string
  endAt: string
  createdAt: string
  files: AttachmentFile[]
  applied: boolean
}

export interface CreateJobPostingRequest {
  companyName: string
  companyDescription: string
  companyLocation: CompanyLocation
  employmentType: EmploymentType
  positions: number[]
  files: AttachmentFile[]
  startAt: string
  endAt: string
}