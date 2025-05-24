import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Event } from 'nostr-tools'
import { FormattedTimestamp } from '../FormattedTimestamp'
import { UnknownNote } from '../Note/UnknownNote'
import UserAvatar from '../UserAvatar'
import Username from '../Username'
import RepostDescription from './RepostDescription'

export default function UnknownNoteCard({
  event,
  className,
  embedded = false,
  reposter
}: {
  event: Event
  className?: string
  embedded?: boolean
  reposter?: string
}) {
  return (
    <div className={className}>
      <div className={cn(embedded ? 'p-2 sm:p-3 border rounded-lg' : 'px-4 py-3')}>
        <RepostDescription reposter={reposter} />
        <div className="flex items-center space-x-2">
          <UserAvatar userId={event.pubkey} size={embedded ? 'small' : 'normal'} />
          <div
            className={`flex-1 w-0 ${embedded ? 'flex space-x-2 items-center overflow-hidden' : ''}`}
          >
            <Username
              userId={event.pubkey}
              className={cn('font-semibold flex truncate', embedded ? 'text-sm' : '')}
              skeletonClassName={embedded ? 'h-3' : 'h-4'}
            />
            <div className="text-xs text-muted-foreground line-clamp-1">
              <FormattedTimestamp timestamp={event.created_at} />
            </div>
          </div>
        </div>
        <UnknownNote event={event} />
      </div>
      {!embedded && <Separator />}
    </div>
  )
}
