import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'

export type SheetsEntry = {
  date: string
  successfulPomodoros: number
  workQuality: number
  overallProductivity: number
  meditation: boolean
  exercise: boolean
  noSnooze: boolean
  compositeScore: number
  workScore: number
  enjoymentNovelty: number
  notes: string
  sickness: string
}

type TodayEntryResponse = {
  date: string
  entry: SheetsEntry | null
}

export function useSheetsReader() {
  const [date, setDate] = useState<string | null>(null)
  const [entry, setEntry] = useState<SheetsEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJson<TodayEntryResponse>('/api/google-sheets/today')
      .then((data) => {
        setDate(data.date)
        setEntry(data.entry)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  return { date, entry, loading, error }
}
