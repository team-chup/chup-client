export const getTypeColor = (type: string) => {
  switch (type) {
    case "FULL_TIME":
      return "bg-emerald-100 text-emerald-800"
    case "CONTRACT":
      return "bg-orange-100 text-orange-800"
    case "INTERN":
      return "bg-purple-100 text-purple-800"
    case "MILITARY_EXCEPTION":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getEmploymentTypeText = (type: string) => {
  switch (type) {
    case "FULL_TIME":
      return "정규직"
    case "CONTRACT":
      return "계약직"
    case "INTERN":
      return "인턴"
    case "MILITARY_EXCEPTION":
      return "병역특례"
    default:
      return type
  }
}

export const getLocationText = (location: string) => {
  const locationMap: { [key: string]: string } = {
    SEOUL: "서울",
    BUSAN: "부산",
    DAEGU: "대구",
    INCHEON: "인천",
    GWANGJU: "광주",
    DAEJEON: "대전",
    ULSAN: "울산",
    SEJONG: "세종",
    GYEONGGI: "경기",
    GANGWON: "강원",
    CHUNGBUK: "충북",
    CHUNGNAM: "충남",
    JEONBUK: "전북",
    JEONNAM: "전남",
    GYEONGBUK: "경북",
    GYEONGNAM: "경남",
    JEJU: "제주"
  }
  return locationMap[location] || location
}

export const getDaysLeft = (endAt: string) => {
  const today = new Date()
  const endDate = new Date(endAt)
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "마감"
  if (diffDays === 1) return "D-Day"
  return `D-${diffDays - 1}`
} 