import { useSelectedDate } from '@/context/SelectedDateContext'
import { useSheetsReader } from '@/hooks/useSheetsReader'
import type { SheetsEntry } from '@/hooks/useSheetsReader'
import { isToday } from '@/lib/dates'

function boolLabel(value: boolean): string {
  return value ? 'Yes' : 'No'
}

function EntryDetails({ entry }: { entry: SheetsEntry }) {
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

export function GoogleSheetsDay() {
  const date = useSelectedDate()
  const { entry, loading, error } = useSheetsReader(date)

  if (loading) {
    return (
      <section>
        <h2>Google Sheets</h2>
        <p>…</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Google Sheets</h2>
      <p className="entry-date">{date}</p>
      {error ? (
        <p>Error: {error}</p>
      ) : entry ? (
        <EntryDetails entry={entry} />
      ) : (
        <p>
          {isToday(date)
            ? 'No row for today in the spreadsheet yet.'
            : 'No row for this date in the spreadsheet.'}
        </p>
      )}
    </section>
  )
}
