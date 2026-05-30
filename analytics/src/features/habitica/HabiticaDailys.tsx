import { useSelectedDate } from '@/context/SelectedDateContext'
import { useHabiticaReader } from '@/hooks/useHabiticaReader'
import type { DailySummary } from '@/hooks/useHabiticaReader'
import { useHabiticaWriter } from '@/hooks/useHabiticaWriter'

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
  const date = useSelectedDate()
  const {
    dueToday,
    other,
    loading,
    error,
    setDueToday,
    setOther,
    setError,
  } = useHabiticaReader(date)
  const { toggleDaily } = useHabiticaWriter({
    setDueToday,
    setOther,
    setError,
  })

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
      <p className="entry-date">{date}</p>
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
