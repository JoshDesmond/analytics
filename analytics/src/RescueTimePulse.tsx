import { useRescueTimeReader } from './hooks/useRescueTimeReader'

export function RescueTimePulse() {
  const { productivity, loading, error } = useRescueTimeReader()

  if (loading) {
    return (
      <section>
        <h2>RescueTime — productivity pulse</h2>
        <p>…</p>
      </section>
    )
  }

  return (
    <section>
      <h2>RescueTime — productivity pulse</h2>
      {error ? <p>Error: {error}</p> : <pre>{productivity ?? '…'}</pre>}
    </section>
  )
}
