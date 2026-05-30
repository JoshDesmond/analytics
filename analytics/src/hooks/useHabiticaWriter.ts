import { useCallback } from 'react'
import { postJson } from '@/lib/api'
import type { DailySummary } from './useHabiticaReader'

type HabiticaWriterDeps = {
  setDueToday: React.Dispatch<React.SetStateAction<DailySummary[]>>
  setOther: React.Dispatch<React.SetStateAction<DailySummary[]>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

export function useHabiticaWriter({
  setDueToday,
  setOther,
  setError,
}: HabiticaWriterDeps) {
  const toggleDaily = useCallback(
    (id: string, completed: boolean) => {
      setError(null)
      const update = (prev: DailySummary[]) =>
        prev.map((daily) =>
          daily.id === id ? { ...daily, completed } : daily,
        )

      setDueToday(update)
      setOther(update)

      void postJson<void>(
        `/api/habitica/dailys/${encodeURIComponent(id)}/completed`,
        { completed },
      ).catch((err: unknown) => {
        const revert = (prev: DailySummary[]) =>
          prev.map((daily) =>
            daily.id === id ? { ...daily, completed: !completed } : daily,
          )
        setDueToday(revert)
        setOther(revert)
        setError(err instanceof Error ? err.message : String(err))
      })
    },
    [setDueToday, setOther, setError],
  )

  return { toggleDaily }
}
