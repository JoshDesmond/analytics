import { useEffect, useState } from 'react'
import { GoogleSheetsToday } from './GoogleSheetsToday'
import { HabiticaDailys } from './HabiticaDailys'

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

type CycleProgress = {
  name: string | null
  number: number
  starts_at: string
  ends_at: string
  points_scoped: number
  points_completed: number
}

type LinearCycleScores = {
  this_week: CycleProgress | null
  last_week: CycleProgress | null
}

function App() {
  const [productivity, setProductivity] = useState<number | null>(null)
  const [linear, setLinear] = useState<LinearCycleScores | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchJson<number>('/api/rescuetime/productivity-pulse'),
      fetchJson<LinearCycleScores>('/api/linear/cycle-scores'),
    ])
      .then(([pulse, cycleScores]) => {
        setProductivity(pulse)
        setLinear(cycleScores)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  return (
    <>
      <h1>Analytics</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <GoogleSheetsToday />
          <section>
            <h2>RescueTime — productivity pulse</h2>
            <pre>{productivity ?? '…'}</pre>
          </section>
          <HabiticaDailys />
          <section>
            <h2>Linear — cycle progress</h2>
            {linear ? (
              <>
                <h3>This week</h3>
                <pre>
                  {linear.this_week
                    ? JSON.stringify(linear.this_week, null, 2)
                    : 'No active cycle'}
                </pre>
                <h3>Last week</h3>
                <pre>
                  {linear.last_week
                    ? JSON.stringify(linear.last_week, null, 2)
                    : 'No previous cycle'}
                </pre>
              </>
            ) : (
              <pre>…</pre>
            )}
          </section>
        </>
      )}
    </>
  )
}

export default App
