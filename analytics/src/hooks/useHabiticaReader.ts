import { useEffect, useState } from 'react'
import { withDateQuery } from '@/lib/api-paths'
import { fetchJson } from '@/lib/api'

export type DailySummary = {
  id: string
  name: string
  completed: boolean
}

type AllDailysResponse = {
  date: string
  dueToday: DailySummary[]
  other: DailySummary[]
}

export function useHabiticaReader(date: string) {
  const [dueToday, setDueToday] = useState<DailySummary[]>([])
  const [other, setOther] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setDueToday([])
    setOther([])

    fetchJson<AllDailysResponse>(
      withDateQuery('/api/habitica/dailys/today', date),
    )
      .then((data) => {
        if (cancelled) return
        setDueToday(data.dueToday)
        setOther(data.other)
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
    dueToday,
    other,
    loading,
    error,
    setDueToday,
    setOther,
    setError,
  }
}
