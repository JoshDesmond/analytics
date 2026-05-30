import { GoogleSheetsToday } from './GoogleSheetsToday'
import { HabiticaDailys } from './HabiticaDailys'
import { LinearCycleScores } from './LinearCycleScores'
import { RescueTimePulse } from './RescueTimePulse'

function App() {
  return (
    <>
      <h1>Analytics</h1>
      <GoogleSheetsToday />
      <RescueTimePulse />
      <HabiticaDailys />
      <LinearCycleScores />
    </>
  )
}

export default App
