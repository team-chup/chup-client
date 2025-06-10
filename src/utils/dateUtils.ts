import { format } from "date-fns"
import { ko } from "date-fns/locale"

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-"
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "-"
    }
    return format(date, 'MM/dd', { locale: ko })
  } catch (error) {
    console.error(error)
    return "-"
  }
}
