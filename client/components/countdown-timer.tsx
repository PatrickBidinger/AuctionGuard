"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  targetDate: Date
  label: string
  compact?: boolean
  onExpire?: () => void;
}

export function CountdownTimer({ targetDate, label, compact = false, onExpire}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        onExpire?.();
        return
      }

      setIsExpired(false)
      setTimeLeft({
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  if (isExpired) {
    return (
      <div className={cn("text-sm", compact && "text-xs")}>
        <span className="text-muted-foreground">{label}</span>
        <div className="font-mono text-muted-foreground">Ended</div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="text-xs">
        <span className="text-muted-foreground">{label}</span>
        <div className="font-mono font-medium tabular-nums">
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 font-mono text-sm font-medium tabular-nums">
        <span className="rounded bg-background px-1.5 py-0.5">{formatNumber(timeLeft.hours)}</span>
        <span className="text-muted-foreground">:</span>
        <span className="rounded bg-background px-1.5 py-0.5">{formatNumber(timeLeft.minutes)}</span>
        <span className="text-muted-foreground">:</span>
        <span className="rounded bg-background px-1.5 py-0.5">{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  )
}
