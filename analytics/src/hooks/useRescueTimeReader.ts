import { useEffect, useState } from 'react'
import { withDateQuery } from '@/lib/api-paths'
import { fetchJson } from '@/lib/api'

export type RescueTimeProductivityScore = -2 | -1 | 0 | 1 | 2

export type RescueTimeDailyUserSummary = {
  date: string
  productivityPulse: number
  totalTrackedSeconds: number
  programmingSeconds: number
  productivityByLevel: {
    veryProductiveSeconds: number
    productiveSeconds: number
    neutralSeconds: number
    unproductiveSeconds: number
    veryUnproductiveSeconds: number
    uncategorizedSeconds: number
  }
}

export type RescueTimeTopActivity = {
  rank: number
  name: string
  category: string
  seconds: number
  productivity: RescueTimeProductivityScore
}

export type RescueTimeTopActivities = {
  date: string
  activities: RescueTimeTopActivity[]
}

export type RescueTimeDeviceSeconds = {
  date: string
  desktopSeconds: number
  mobileSeconds: number
}

export function useRescueTimeReader(date: string) {
  const [productivityPulse, setProductivityPulse] = useState<number | null>(
    null,
  )
  const [dailyUserSummary, setDailyUserSummary] =
    useState<RescueTimeDailyUserSummary | null>(null)
  const [topActivities, setTopActivities] =
    useState<RescueTimeTopActivities | null>(null)
  const [deviceSeconds, setDeviceSeconds] =
    useState<RescueTimeDeviceSeconds | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setProductivityPulse(null)
    setDailyUserSummary(null)
    setTopActivities(null)
    setDeviceSeconds(null)

    Promise.all([
      fetchJson<number>(
        withDateQuery('/api/rescuetime/productivity-pulse', date),
      ),
      fetchJson<RescueTimeDailyUserSummary>(
        withDateQuery('/api/rescuetime/daily-user-summary', date),
      ),
      fetchJson<RescueTimeTopActivities>(
        `${withDateQuery('/api/rescuetime/top-activities', date)}&limit=3`,
      ),
      fetchJson<RescueTimeDeviceSeconds>(
        withDateQuery('/api/rescuetime/device-seconds', date),
      ),
    ])
      .then(([pulse, summary, activities, devices]) => {
        if (cancelled) return
        setProductivityPulse(pulse)
        setDailyUserSummary(summary)
        setTopActivities(activities)
        setDeviceSeconds(devices)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [date])

  return {
    productivityPulse,
    dailyUserSummary,
    topActivities,
    deviceSeconds,
    loading,
    error,
  }
}
