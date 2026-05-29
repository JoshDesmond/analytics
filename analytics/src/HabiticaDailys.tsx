import { useCallback, useEffect, useState } from 'react'

type DailySummary = {
  id: string
  name: string
  completed: boolean
}

type TodaysDailysResponse = {
  date: string
  dailys: DailySummary[]
}

async function fetchJson<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(path)
  } catch {
    throw new Error(
      'Cannot reach the API server (connection refused). In a second terminal, run: cd analytics-backend && npm run dev',
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
      'Cannot reach the API server (connection refused). In a second terminal, run: cd analytics-backend && npm run dev',
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

export function HabiticaDailys() {
  const [date, setDate] = useState<string | null>(null)
  const [dailys, setDailys] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJson<TodaysDailysResponse>('/api/habitica/dailys/today')
      .then((data) => {
        setDate(data.date)
        setDailys(data.dailys)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleDaily = useCallback((id: string, completed: boolean) => {
    setError(null)
    setDailys((prev) =>
      prev.map((daily) =>
        daily.id === id ? { ...daily, completed } : daily,
      ),
    )

    void postDailyCompleted(id, completed).catch((err: unknown) => {
      setDailys((prev) =>
        prev.map((daily) =>
          daily.id === id ? { ...daily, completed: !completed } : daily,
        ),
      )
      setError(err instanceof Error ? err.message : String(err))
    })
  }, [])

  if (loading) {
    return (
      <section>
        <h2>Habitica — today&apos;s dailys</h2>
        <p>…</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Habitica — today&apos;s dailys</h2>
      {date && <p>{date}</p>}
      {error && <p>Error: {error}</p>}
      {dailys.length === 0 ? (
        <p>No dailys due today.</p>
      ) : (
        <ul>
          {dailys.map((daily) => (
            <li key={daily.id}>
              <label>
                <input
                  type="checkbox"
                  checked={daily.completed}
                  onChange={(e) => toggleDaily(daily.id, e.target.checked)}
                />{' '}
                {daily.name}
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
