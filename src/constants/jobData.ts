interface Option {
  value: string;
  label: string;
}

export const LOCATIONS: Option[] = [
  { value: "SEOUL", label: "서울" },
  { value: "BUSAN", label: "부산" },
  { value: "DAEGU", label: "대구" },
  { value: "INCHEON", label: "인천" },
  { value: "GWANGJU", label: "광주" },
  { value: "DAEJEON", label: "대전" },
  { value: "ULSAN", label: "울산" },
  { value: "SEJONG", label: "세종" },
  { value: "GYEONGGI", label: "경기" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "JEJU", label: "제주" }
]

export const POSITIONS: Option[] = [
  { value: "프론트엔드 개발자", label: "프론트엔드 개발자" },
  { value: "백엔드 개발자", label: "백엔드 개발자" },
  { value: "풀스택 개발자", label: "풀스택 개발자" },
  { value: "모바일 개발자", label: "모바일 개발자" },
  { value: "DevOps 엔지니어", label: "DevOps 엔지니어" },
  { value: "데이터 엔지니어", label: "데이터 엔지니어" },
  { value: "AI/ML 엔지니어", label: "AI/ML 엔지니어" },
  { value: "QA 엔지니어", label: "QA 엔지니어" },
  { value: "UI/UX 디자이너", label: "UI/UX 디자이너" },
  { value: "프로덕트 매니저", label: "프로덕트 매니저" }
]

export const EMPLOYMENT_TYPES: Option[] = [
  { value: "FULL_TIME", label: "정규직" },
  { value: "CONTRACT", label: "계약직" },
  { value: "INTERN", label: "인턴" },
  { value: "MILITARY_EXCEPTION", label: "병역특례" }
]