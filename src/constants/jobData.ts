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
  { value: "frontend", label: "프론트엔드 개발자" },
  { value: "backend", label: "백엔드 개발자" },
  { value: "fullstack", label: "풀스택 개발자" },
  { value: "mobile", label: "모바일 개발자" },
  { value: "devops", label: "DevOps 엔지니어" },
  { value: "data", label: "데이터 엔지니어" },
  { value: "ai_ml", label: "AI/ML 엔지니어" },
  { value: "qa", label: "QA 엔지니어" },
  { value: "ui_ux", label: "UI/UX 디자이너" },
  { value: "product", label: "프로덕트 매니저" }
]

export const EMPLOYMENT_TYPES: Option[] = [
  { value: "FULL_TIME", label: "정규직" },
  { value: "CONTRACT", label: "계약직" },
  { value: "INTERN", label: "인턴" },
  { value: "MILITARY_EXCEPTION", label: "병역특례" }
]