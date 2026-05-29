import { useEffect, useState } from 'react'

async function fetchProductivityPulse(): Promise<number> {
  let res: Response
  try {
    res = await fetch('/api/hello')
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

  return res.json() as Promise<number>
}

function App() {
  const [productivity, setProductivity] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProductivityPulse()
      .then((score) => setProductivity(score))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  return (
    <>
      <h1>Analytics</h1>
      {error ? <p>Error: {error}</p> : <p>Score: {productivity ?? '…'}</p>}
    </>
  )
}

export default App
