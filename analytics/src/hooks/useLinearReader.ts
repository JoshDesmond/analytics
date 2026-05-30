import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'

export type CycleProgress = {
  name: string | null
  number: number
  starts_at: string
  ends_at: string
  points_scoped: number
  points_completed: number
}

export type LinearCycleScores = {
  this_week: CycleProgress | null
  last_week: CycleProgress | null
}

export function useLinearReader() {
  const [cycleScores, setCycleScores] = useState<LinearCycleScores | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJson<LinearCycleScores>('/api/linear/cycle-scores')
      .then(setCycleScores)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  return { cycleScores, loading, error }
}
