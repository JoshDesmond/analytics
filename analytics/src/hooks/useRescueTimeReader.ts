import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'

export function useRescueTimeReader() {
  const [productivity, setProductivity] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJson<number>('/api/rescuetime/productivity-pulse')
      .then(setProductivity)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  return { productivity, loading, error }
}
