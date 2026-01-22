import { cn } from '@/lib/utils'
import { Event } from 'nostr-tools'
import { useTranslation } from 'react-i18next'

export default function VideoNotePreview({
  event,
  className
}: {
  event: Event
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div className={cn('pointer-events-none', className)}>
      [{t('Media')}] <span className="pr-0.5 italic">{event.content}</span>
    </div>
  )
}
