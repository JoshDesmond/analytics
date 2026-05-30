import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { addDays, formatDisplayDate, isToday, todayIsoDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

type DateCarouselProps = {
  onDateChange: (date: string) => void
}

/**
 * Slides are ordered newest → oldest: index 0 is today, index 1 is yesterday, etc.
 * The left control moves to an older day; the right control returns toward today.
 */
export function DateCarousel({ onDateChange }: DateCarouselProps) {
  const [dates, setDates] = useState<string[]>(() => [todayIsoDate()])
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const pendingOlderRef = useRef(false)

  const canGoNewer = selectedIndex > 0

  const syncIndex = useCallback(() => {
    if (!api) return
    const index = api.selectedScrollSnap()
    setSelectedIndex(index)
    const date = dates[index]
    if (date) onDateChange(date)
  }, [api, dates, onDateChange])

  useEffect(() => {
    if (!api) return
    syncIndex()
    api.on('select', syncIndex)
    api.on('reInit', syncIndex)
    return () => {
      api.off('select', syncIndex)
      api.off('reInit', syncIndex)
    }
  }, [api, syncIndex])

  useEffect(() => {
    if (!api || !pendingOlderRef.current) return
    pendingOlderRef.current = false
    api.reInit()
    api.scrollTo(dates.length - 1)
  }, [api, dates])

  const goToOlderDay = useCallback(() => {
    if (!api) return

    const isOnLastSlide = selectedIndex === dates.length - 1
    if (isOnLastSlide) {
      const oldest = dates[dates.length - 1]
      const older = addDays(oldest, -1)
      pendingOlderRef.current = true
      setDates((prev) => [...prev, older])
      return
    }

    api.scrollNext()
  }, [api, dates, selectedIndex])

  const goToNewerDay = useCallback(() => {
    api?.scrollPrev()
  }, [api])

  return (
    <div className="date-carousel mb-8 w-full max-w-2xl">
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', watchDrag: true }}
        className="mx-auto w-full max-w-xl px-12"
      >
        <CarouselContent>
          {dates.map((date) => (
            <CarouselItem key={date}>
              <div className="flex flex-col items-center gap-1 py-2 text-center">
                <p className="text-lg font-medium text-foreground">
                  {isToday(date) ? 'Today' : formatDisplayDate(date)}
                </p>
                <p className="text-sm text-muted-foreground">{date}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute top-1/2 left-0 size-9 -translate-y-1/2 rounded-full"
          onClick={goToOlderDay}
          aria-label="Previous day"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            'absolute top-1/2 right-0 size-9 -translate-y-1/2 rounded-full',
            !canGoNewer && 'invisible',
          )}
          onClick={goToNewerDay}
          disabled={!canGoNewer}
          aria-label="Next day"
        >
          <ChevronRight className="size-4" />
        </Button>
      </Carousel>
    </div>
  )
}
