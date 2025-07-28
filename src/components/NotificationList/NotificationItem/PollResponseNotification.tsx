import { useFetchEvent } from '@/hooks'
import { toNote } from '@/lib/link'
import { generateBech32IdFromETag, tagNameEquals } from '@/lib/tag'
import { cn } from '@/lib/utils'
import { useSecondaryPage } from '@/PageManager'
import { Vote } from 'lucide-react'
import { Event } from 'nostr-tools'
import { useMemo } from 'react'
import ContentPreview from '../../ContentPreview'
import { FormattedTimestamp } from '../../FormattedTimestamp'
import UserAvatar from '../../UserAvatar'

export function PollResponseNotification({
  notification,
  isNew = false
}: {
  notification: Event
  isNew?: boolean
}) {
  const { push } = useSecondaryPage()
  const eventId = useMemo(() => {
    const eTag = notification.tags.find(tagNameEquals('e'))
    return eTag ? generateBech32IdFromETag(eTag) : undefined
  }, [notification])
  const { event: pollEvent } = useFetchEvent(eventId)

  if (!pollEvent) {
    return null
  }

  return (
    <div
      className="flex gap-2 items-center cursor-pointer py-2"
      onClick={() => push(toNote(pollEvent))}
    >
      <UserAvatar userId={notification.pubkey} size="small" />
      <Vote size={24} className="text-violet-400" />
      <ContentPreview
        className={cn('truncate flex-1 w-0', isNew ? 'font-semibold' : 'text-muted-foreground')}
        event={pollEvent}
      />
      <div className="text-muted-foreground">
        <FormattedTimestamp timestamp={notification.created_at} short />
      </div>
    </div>
  )
}
