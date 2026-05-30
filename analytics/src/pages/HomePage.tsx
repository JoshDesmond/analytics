import { useState } from 'react'
import { DateCarousel } from '@/components/date-carousel/DateCarousel'
import { SelectedDateProvider } from '@/context/SelectedDateContext'
import { GoogleSheetsDay } from '@/features/google-sheets/GoogleSheetsDay'
import { HabiticaDailys } from '@/features/habitica/HabiticaDailys'
import { LinearCycleScores } from '@/features/linear/LinearCycleScores'
import { RescueTime } from '@/features/rescuetime/RescueTime'
import { todayIsoDate } from '@/lib/dates'

export function HomePage() {
  const [selectedDate, setSelectedDate] = useState(() => todayIsoDate())

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-medium text-foreground">
        Analytics
      </h1>
      <DateCarousel onDateChange={setSelectedDate} />
      <SelectedDateProvider date={selectedDate}>
        <GoogleSheetsDay />
        <RescueTime />
        <HabiticaDailys />
      </SelectedDateProvider>
      <LinearCycleScores />
    </>
  )
}
