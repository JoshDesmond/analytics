import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'

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

export function useHabiticaReader() {
  const [date, setDate] = useState<string | null>(null)
  const [dueToday, setDueToday] = useState<DailySummary[]>([])
  const [other, setOther] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJson<AllDailysResponse>('/api/habitica/dailys/today')
      .then((data) => {
        setDate(data.date)
        setDueToday(data.dueToday)
        setOther(data.other)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  return {
    date,
    dueToday,
    other,
    loading,
    error,
    setDueToday,
    setOther,
    setError,
  }
}
