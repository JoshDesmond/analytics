import { useEffect, useState } from 'react'
import { withDateQuery } from '@/lib/api-paths'
import { fetchJson } from '@/lib/api'

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

type EntryResponse = {
  date: string
  tab: string | null
  entry: SheetsEntry | null
}

export function useSheetsReader(date: string) {
  const [entry, setEntry] = useState<SheetsEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setEntry(null)

    fetchJson<EntryResponse>(withDateQuery('/api/google-sheets/entry', date))
      .then((data) => {
        if (cancelled) return
        setEntry(data.entry)
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

  return { entry, loading, error }
}
