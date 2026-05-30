import type { ReactNode } from 'react'
import { useSelectedDate } from '@/context/SelectedDateContext'
import { useRescueTimeReader } from '@/hooks/useRescueTimeReader'
import type {
  RescueTimeDailyUserSummary,
  RescueTimeProductivityScore,
  RescueTimeTopActivities,
} from '@/hooks/useRescueTimeReader'

const PRODUCTIVITY_LABELS: Record<RescueTimeProductivityScore, string> = {
  [-2]: 'Very distracting',
  [-1]: 'Distracting',
  0: 'Neutral',
  1: 'Productive',
  2: 'Very productive',
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`)
  return parts.join(' ') || '0s'
}

function EndpointBlock({
  method,
  path,
  children,
}: {
  method: string
  path: string
  children: ReactNode
}) {
  return (
    <article className="api-surface">
      <h3>
        <code>
          {method} {path}
        </code>
      </h3>
      {children}
    </article>
  )
}

function ProductivityPulseSurface({ pulse }: { pulse: number }) {
  return (
    <EndpointBlock method="GET" path="/api/rescuetime/productivity-pulse">
      <dl className="entry-metrics">
        <div className="entry-metric">
          <dt>Productivity pulse</dt>
          <dd>{pulse.toFixed(1)}</dd>
        </div>
      </dl>
      <p className="endpoint-note">
        Computed from interval productivity rows (
        <code>anapi/data?by=interval&amp;rk=productivity&amp;interval=day</code>
        ).
      </p>
    </EndpointBlock>
  )
}

function DailyUserSummarySurface({
  summary,
}: {
  summary: RescueTimeDailyUserSummary
}) {
  const level = summary.productivityByLevel
  const productivityRows: { label: string; seconds: number }[] = [
    { label: 'Very productive', seconds: level.veryProductiveSeconds },
    { label: 'Productive', seconds: level.productiveSeconds },
    { label: 'Neutral', seconds: level.neutralSeconds },
    { label: 'Unproductive', seconds: level.unproductiveSeconds },
    { label: 'Very unproductive', seconds: level.veryUnproductiveSeconds },
    { label: 'Uncategorized', seconds: level.uncategorizedSeconds },
  ]

  return (
    <EndpointBlock method="GET" path="/api/rescuetime/daily-user-summary">
      <p className="entry-date">{summary.date}</p>
      <dl className="entry-metrics">
        <div className="entry-metric">
          <dt>Productivity pulse (summary)</dt>
          <dd>{summary.productivityPulse}</dd>
        </div>
        <div className="entry-metric">
          <dt>Total tracked</dt>
          <dd>{formatDuration(summary.totalTrackedSeconds)}</dd>
        </div>
        <div className="entry-metric">
          <dt>Programming (Software Development)</dt>
          <dd>{formatDuration(summary.programmingSeconds)}</dd>
        </div>
      </dl>

      <h4>Productivity levels</h4>
      <dl className="entry-metrics">
        {productivityRows.map(({ label, seconds }) => (
          <div key={label} className="entry-metric">
            <dt>{label}</dt>
            <dd>{formatDuration(seconds)}</dd>
          </div>
        ))}
      </dl>

      <p className="endpoint-note">
        From <code>daily_user_summaries?verbose=true</code> (includes{' '}
        <code>software_development_hours</code>).
      </p>
    </EndpointBlock>
  )
}

function TopActivitiesSurface({ data }: { data: RescueTimeTopActivities }) {
  return (
    <EndpointBlock method="GET" path="/api/rescuetime/top-activities?limit=3">
      <p className="entry-date">{data.date}</p>
      {data.activities.length === 0 ? (
        <p>No activities logged for this day.</p>
      ) : (
        <ol className="top-activities">
          {data.activities.map((activity) => (
            <li key={activity.rank}>
              <strong>{activity.name}</strong> —{' '}
              {formatDuration(activity.seconds)}
              <span className="activity-meta">
                {' '}
                ({activity.category};{' '}
                {PRODUCTIVITY_LABELS[activity.productivity]})
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="endpoint-note">
        From <code>anapi/data?by=rank&amp;rk=activity</code> (first three rows).
      </p>
    </EndpointBlock>
  )
}

function DeviceSecondsSurface({
  desktopSeconds,
  mobileSeconds,
  date,
}: {
  date: string
  desktopSeconds: number
  mobileSeconds: number
}) {
  return (
    <EndpointBlock method="GET" path="/api/rescuetime/device-seconds">
      <p className="entry-date">{date}</p>
      <dl className="entry-metrics">
        <div className="entry-metric">
          <dt>Desktop</dt>
          <dd>{formatDuration(desktopSeconds)}</dd>
        </div>
        <div className="entry-metric">
          <dt>Mobile</dt>
          <dd>{formatDuration(mobileSeconds)}</dd>
        </div>
      </dl>
      <p className="endpoint-note">
        Sum of <code>by=rank&amp;rk=overview</code> with{' '}
        <code>restrict_source_type=computers</code> and <code>mobile</code>.
      </p>
    </EndpointBlock>
  )
}

export function RescueTime() {
  const date = useSelectedDate()
  const {
    productivityPulse,
    dailyUserSummary,
    topActivities,
    deviceSeconds,
    loading,
    error,
  } = useRescueTimeReader(date)

  if (loading) {
    return (
      <section>
        <h2>RescueTime</h2>
        <p>…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2>RescueTime</h2>
        <p>Error: {error}</p>
      </section>
    )
  }

  return (
    <section>
      <h2>RescueTime</h2>
      {productivityPulse !== null ? (
        <ProductivityPulseSurface pulse={productivityPulse} />
      ) : null}
      {dailyUserSummary ? (
        <DailyUserSummarySurface summary={dailyUserSummary} />
      ) : null}
      {topActivities ? <TopActivitiesSurface data={topActivities} /> : null}
      {deviceSeconds ? (
        <DeviceSecondsSurface
          date={deviceSeconds.date}
          desktopSeconds={deviceSeconds.desktopSeconds}
          mobileSeconds={deviceSeconds.mobileSeconds}
        />
      ) : null}
    </section>
  )
}
