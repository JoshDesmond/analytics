import { createContext, useContext, type ReactNode } from 'react'

const SelectedDateContext = createContext<string | null>(null)

export function SelectedDateProvider({
  date,
  children,
}: {
  date: string
  children: ReactNode
}) {
  return (
    <SelectedDateContext.Provider value={date}>
      {children}
    </SelectedDateContext.Provider>
  )
}

export function useSelectedDate(): string {
  const date = useContext(SelectedDateContext)
  if (!date) {
    throw new Error('useSelectedDate must be used within SelectedDateProvider')
  }
  return date
}
