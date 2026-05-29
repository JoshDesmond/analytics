import { useCallback, useEffect, useState } from 'react'

type DailySummary = {
  id: string
  name: string
  completed: boolean
}

type AllDailysResponse = {
  date: string
  dueToday: DailySummary[]
  other: DailySummary[]
}

async function fetchJson<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(path)
  } catch {
    throw new Error(
      'Cannot reach the API server (connection refused). In a second terminal, run: cd backend && npm run dev',
    )
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) detail = body.error
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail)
  }

  return res.json() as Promise<T>
}

async function postDailyCompleted(
  taskId: string,
  completed: boolean,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(`/api/habitica/dailys/${encodeURIComponent(taskId)}/completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
  } catch {
    throw new Error(
      'Cannot reach the API server (connection refused). In a second terminal, run: cd backend && npm run dev',
    )
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) detail = body.error
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail)
  }
}

function DailyList({
  dailys,
  onToggle,
}: {
  dailys: DailySummary[]
  onToggle: (id: string, completed: boolean) => void
}) {
  if (dailys.length === 0) {
    return <p>None.</p>
  }

  return (
    <ul>
      {dailys.map((daily) => (
        <li key={daily.id}>
          <label>
            <input
              type="checkbox"
              checked={daily.completed}
              onChange={(e) => onToggle(daily.id, e.target.checked)}
            />{' '}
            {daily.name}
          </label>
        </li>
      ))}
    </ul>
  )
}

export function HabiticaDailys() {
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

  const toggleDaily = useCallback((id: string, completed: boolean) => {
    setError(null)
    const update = (prev: DailySummary[]) =>
      prev.map((daily) =>
        daily.id === id ? { ...daily, completed } : daily,
      )

    setDueToday(update)
    setOther(update)

    void postDailyCompleted(id, completed).catch((err: unknown) => {
      const revert = (prev: DailySummary[]) =>
        prev.map((daily) =>
          daily.id === id ? { ...daily, completed: !completed } : daily,
        )
      setDueToday(revert)
      setOther(revert)
      setError(err instanceof Error ? err.message : String(err))
    })
  }, [])

  if (loading) {
    return (
      <section>
        <h2>Habitica — dailys</h2>
        <p>…</p>
      </section>
    )
  }

  const hasAny = dueToday.length > 0 || other.length > 0

  return (
    <section>
      <h2>Habitica — dailys</h2>
      {date && <p>{date}</p>}
      {error && <p>Error: {error}</p>}
      {!hasAny ? (
        <p>No dailys found.</p>
      ) : (
        <>
          <h3>Due today</h3>
          <DailyList dailys={dueToday} onToggle={toggleDaily} />
          <h3>Other</h3>
          <DailyList dailys={other} onToggle={toggleDaily} />
        </>
      )}
    </section>
  )
}
