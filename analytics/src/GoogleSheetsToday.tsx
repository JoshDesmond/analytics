import { useEffect, useState } from 'react'

type Entry = {
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
  entry: Entry | null
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

function boolLabel(value: boolean): string {
  return value ? 'Yes' : 'No'
}

function EntryDetails({ entry }: { entry: Entry }) {
  const metrics: { label: string; value: string | number }[] = [
    { label: 'Successful pomodoros', value: entry.successfulPomodoros },
    { label: 'Work quality', value: entry.workQuality },
    { label: 'Overall productivity', value: entry.overallProductivity },
    { label: 'Meditation', value: boolLabel(entry.meditation) },
    { label: 'Exercise', value: boolLabel(entry.exercise) },
    { label: 'No snooze', value: boolLabel(entry.noSnooze) },
    { label: 'Composite score', value: entry.compositeScore },
    { label: 'Work score', value: entry.workScore },
    { label: 'Enjoyment / novelty', value: entry.enjoymentNovelty },
  ]

  return (
    <>
      <dl className="entry-metrics">
        {metrics.map(({ label, value }) => (
          <div key={label} className="entry-metric">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {entry.notes ? (
        <p>
          <strong>Notes:</strong> {entry.notes}
        </p>
      ) : null}
      {entry.sickness ? (
        <p>
          <strong>Sickness:</strong> {entry.sickness}
        </p>
      ) : null}
    </>
  )
}

export function GoogleSheetsToday() {
  const [date, setDate] = useState<string | null>(null)
  const [entry, setEntry] = useState<Entry | null>(null)
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

  if (loading) {
    return (
      <section>
        <h2>Today</h2>
        <p>…</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Today</h2>
      {date && <p className="entry-date">{date}</p>}
      {error ? (
        <p>Error: {error}</p>
      ) : entry ? (
        <EntryDetails entry={entry} />
      ) : (
        <p>No row for today in the spreadsheet yet.</p>
      )}
    </section>
  )
}
