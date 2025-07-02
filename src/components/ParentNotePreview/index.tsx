import { Skeleton } from '@/components/ui/skeleton'
import { useFetchEvent } from '@/hooks'
import { isSupportedKind } from '@/lib/event'
import { cn } from '@/lib/utils'
import { useMuteList } from '@/providers/MuteListProvider'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ContentPreview from '../ContentPreview'
import UserAvatar from '../UserAvatar'

export default function ParentNotePreview({
  eventId,
  className,
  onClick
}: {
  eventId: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined
}) {
  const { t } = useTranslation()
  const { mutePubkeys } = useMuteList()
  const { event, isFetching } = useFetchEvent(eventId)
  const isMuted = useMemo(
    () => (event ? mutePubkeys.includes(event.pubkey) : false),
    [mutePubkeys, event]
  )

  if (isFetching) {
    return (
      <div
        className={cn(
          'flex gap-1 items-center text-sm rounded-full px-2 bg-muted w-44 max-w-full text-muted-foreground hover:text-foreground cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <div className="shrink-0">{t('reply to')}</div>
        <Skeleton className="w-4 h-4 rounded-full" />
        <div className="py-1 flex-1">
          <Skeleton className="h-3" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div
        className={cn(
          'flex gap-1 items-center text-sm rounded-full px-2 bg-muted w-fit max-w-full text-muted-foreground',
          className
        )}
      >
        <div className="shrink-0">{t('reply to')}</div>
        <div>{`[${t('Note not found')}]`}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex gap-1 items-center text-sm rounded-full px-2 bg-muted w-fit max-w-full text-muted-foreground hover:text-foreground cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="shrink-0">{t('reply to')}</div>
      {event && <UserAvatar className="shrink-0" userId={event.pubkey} size="tiny" />}
      {isMuted ? (
        <div className="truncate">[{t('This user has been muted')}]</div>
      ) : !isSupportedKind(event.kind) ? (
        <div className="truncate">[{t('Cannot handle event of kind k', { k: event.kind })}]</div>
      ) : (
        <ContentPreview className="truncate" event={event} />
      )}
    </div>
  )
}
