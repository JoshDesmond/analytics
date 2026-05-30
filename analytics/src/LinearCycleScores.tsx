import { useLinearReader } from './hooks/useLinearReader'

export function LinearCycleScores() {
  const { cycleScores, loading, error } = useLinearReader()

  if (loading) {
    return (
      <section>
        <h2>Linear — cycle progress</h2>
        <p>…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2>Linear — cycle progress</h2>
        <p>Error: {error}</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Linear — cycle progress</h2>
      {cycleScores ? (
        <>
          <h3>This week</h3>
          <pre>
            {cycleScores.this_week
              ? JSON.stringify(cycleScores.this_week, null, 2)
              : 'No active cycle'}
          </pre>
          <h3>Last week</h3>
          <pre>
            {cycleScores.last_week
              ? JSON.stringify(cycleScores.last_week, null, 2)
              : 'No previous cycle'}
          </pre>
        </>
      ) : (
        <pre>…</pre>
      )}
    </section>
  )
}
