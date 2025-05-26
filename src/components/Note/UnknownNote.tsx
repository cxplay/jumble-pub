import { Button } from '@/components/ui/button'
import { getSharableEventId } from '@/lib/event'
import { toNjump } from '@/lib/link'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import { Event } from 'nostr-tools'
import { useTranslation } from 'react-i18next'

export function UnknownNote({ event, className }: { event: Event; className?: string }) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-col gap-2 items-center text-muted-foreground font-medium my-4',
        className
      )}
    >
      <div>{t('Cannot handle event of kind k', { k: event.kind })}</div>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          window.open(toNjump(getSharableEventId(event)), '_blank')
        }}
        variant="outline"
      >
        <ExternalLink />
        <div>{t('View on njump.me')}</div>
      </Button>
    </div>
  )
}
