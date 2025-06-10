export type CompanyLocation =
  | 'SEOUL'
  | 'BUSAN'
  | 'DAEGU'
  | 'INCHEON'
  | 'GWANGJU'
  | 'DAEJEON'
  | 'ULSAN'
  | 'SEJONG'
  | 'GYEONGGI'
  | 'GANGWON'
  | 'CHUNGBUK'
  | 'CHUNGNAM'
  | 'JEONBUK'
  | 'JEONNAM'
  | 'GYEONGBUK'
  | 'GYEONGNAM'
  | 'JEJU';

export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'INTERN' | 'MILITARY_EXCEPTION';

export type ResumeType = 'LINK' | 'PDF';

export type ApplicationStatus = 'PENDING' | 'ANNOUNCED';

export type ResultStatus = 'FIRST' | 'FAILED';

export interface ResultRequest {
  status: ResultStatus;
  failedReason?: string;
}

export interface Position {
  id: number;
  name: string;
}

export interface Resume {
  name: string;
  type: ResumeType;
  url: string;
}

export interface ApplicationResult {
  status: ResultStatus;
  failedReason?: string;
  announcedAt: string;
  createAt?: string;
}

export interface Applicant {
  name: string;
  email: string;
  studentNumber: string;
  phoneNumber: string;
}

export interface Application {
  id: number;
  applicationId: number;
  companyName: string;
  companyLocation: CompanyLocation;
  employmentType: EmploymentType;
  position: Position;
  resume: Resume;
  status: ApplicationStatus;
  result?: ApplicationResult;
  startAt: string;
  endAt: string;
  createAt: string;
}

export interface DetailedApplication {
  id: number;
  applicant: Applicant;
  position: Position;
  resume: Resume;
  status: ApplicationStatus;
  result?: ApplicationResult;
  createAt: string;
}

export interface ApplicationsResponse {
  count: number;
  applications: Application[];
}

export interface DetailedApplicationsResponse {
  count: number;
  applications: DetailedApplication[];
} 