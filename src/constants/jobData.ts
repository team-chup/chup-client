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

export const EMPLOYMENT_TYPES: Option[] = [
  { value: "FULL_TIME", label: "정규직" },
  { value: "CONTRACT", label: "계약직" },
  { value: "INTERN", label: "인턴" },
  { value: "MILITARY_EXCEPTION", label: "병역특례" }
]