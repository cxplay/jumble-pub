import { Event } from 'nostr-tools'
import { Card } from '@renderer/components/ui/card'
import { toNote } from '@renderer/lib/link'
import { useSecondaryPage } from '@renderer/PageManager'
import Note from '../Note'
import { useFetchEventById } from '@renderer/hooks'
import { getParentEventId, getRootEventId } from '@renderer/lib/event'

export default function ShortTextNoteCard({
  event,
  className,
  size = 'normal',
  hideStats = false
}: {
  event: Event
  className?: string
  size?: 'normal' | 'small'
  hideStats?: boolean
}) {
  const { push } = useSecondaryPage()
  const rootEvent = useFetchEventById(getRootEventId(event))
  const parentEvent = useFetchEventById(getParentEventId(event))

  return (
    <div
      className={className}
      onClick={(e) => {
        e.stopPropagation()
        push(toNote(event))
      }}
    >
      <Card
        className={`hover:bg-muted/50 text-left cursor-pointer ${size === 'normal' ? 'p-4' : 'p-3'}`}
      >
        <Note
          size={size}
          event={event}
          parentEvent={parentEvent ?? rootEvent}
          hideStats={hideStats}
        />
      </Card>
    </div>
  )
}
