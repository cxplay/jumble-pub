import { getEmbeddedPubkeys } from '@/lib/event'
import { toNote } from '@/lib/link'
import { cn } from '@/lib/utils'
import { useSecondaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { AtSign, MessageCircle } from 'lucide-react'
import { Event } from 'nostr-tools'
import { useMemo } from 'react'
import ContentPreview from '../../ContentPreview'
import { FormattedTimestamp } from '../../FormattedTimestamp'
import UserAvatar from '../../UserAvatar'

export function MentionNotification({
  notification,
  isNew = false
}: {
  notification: Event
  isNew?: boolean
}) {
  const { push } = useSecondaryPage()
  const { pubkey } = useNostr()
  const isMention = useMemo(() => {
    if (!pubkey) return false
    const mentions = getEmbeddedPubkeys(notification)
    return mentions.includes(pubkey)
  }, [pubkey, notification])

  return (
    <div
      className="flex gap-2 items-center cursor-pointer py-2"
      onClick={() => push(toNote(notification))}
    >
      <UserAvatar userId={notification.pubkey} size="small" />
      {isMention ? (
        <AtSign size={24} className="text-pink-400" />
      ) : (
        <MessageCircle size={24} className="text-blue-400" />
      )}
      <ContentPreview
        className={cn('truncate flex-1 w-0', isNew ? 'font-semibold' : 'text-muted-foreground')}
        event={notification}
      />
      <div className="text-muted-foreground">
        <FormattedTimestamp timestamp={notification.created_at} short />
      </div>
    </div>
  )
}
