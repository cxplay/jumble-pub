import { useTranslatedEvent } from '@/hooks'
import { createFakeEvent } from '@/lib/event'
import { cn } from '@/lib/utils'
import { Event } from 'nostr-tools'
import { useMemo } from 'react'
import Content from '../Content'

export default function Highlight({ event, className }: { event: Event; className?: string }) {
  const translatedEvent = useTranslatedEvent(event.id)
  const comment = useMemo(
    () => (translatedEvent?.tags ?? event.tags).find((tag) => tag[0] === 'comment')?.[1],
    [event, translatedEvent]
  )

  return (
    <div className={cn('text-wrap break-words whitespace-pre-wrap space-y-4', className)}>
      {comment && <Content event={createFakeEvent({ content: comment })} />}
      <div className="flex gap-4">
        <div className="w-1 flex-shrink-0 my-1 bg-primary/60 rounded-md" />
        <div className="italic whitespace-pre-line">
          {translatedEvent?.content ?? event.content}
        </div>
      </div>
    </div>
  )
}
