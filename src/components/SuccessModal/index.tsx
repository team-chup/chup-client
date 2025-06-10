"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"

interface SuccessModalProps {
  companyName: string;
  positionName: string;
  onClose: () => void;
}

export default function SuccessModal({ companyName, positionName, onClose }: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(true)

      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 51 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white">
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-blue-600" />
            </div>
            {showConfetti && (
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">지원이 완료되었습니다! 🎉</h1>

          <p className="text-gray-600 mb-6">
            {companyName}의 {positionName} 포지션에 성공적으로 지원하셨습니다. 지원 확인 이메일이 발송되었습니다.
          </p>


          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/applications")}
            >
              지원 현황 보기
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/main")}
            >
              다른 공고 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 