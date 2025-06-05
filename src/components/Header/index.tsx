import { Building2, Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isAdmin?: boolean
  currentPage?: string
  userName?: string
  onLogout?: () => void
}

export function Header({ isAdmin = false, currentPage = "", onLogout }: HeaderProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // 기본 로그아웃 로직
      console.log("로그아웃")
    }
  }

  const studentNavItems = [
    { name: "채용공고", href: "/", key: "jobs" },
    { name: "지원현황", href: "/applications", key: "applications" },
    { name: "프로필", href: "/profile", key: "profile" },
  ]

  const adminNavItems = [
    { name: "대시보드", href: "/admin", key: "dashboard" },
    { name: "학생 관리", href: "/admin/students", key: "students" },
    { name: "통계", href: "/admin/analytics", key: "analytics" },
  ]

  const navItems = isAdmin ? adminNavItems : studentNavItems

  const isCurrentPage = (key: string) => {
    return currentPage === key
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CHUP.today</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`${
                  isCurrentPage(item.key) ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </a>
            ))}

            {isAdmin && (
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                공고 등록
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
            <nav className="flex flex-col space-y-4 py-4">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`px-4 py-2 ${
                    isCurrentPage(item.key) ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </a>
              ))}

              <div className="px-4">
                {isAdmin && (
                  <Button className="bg-blue-600 hover:bg-blue-700 w-full mb-2">
                    <Plus className="h-4 w-4 mr-2" />
                    공고 등록
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            </nav>
          </div>
      </div>
    </header>
  )
}
