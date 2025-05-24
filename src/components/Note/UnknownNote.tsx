import { Button } from '@/components/ui/button'
import { getSharableEventId } from '@/lib/event'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import { Event } from 'nostr-tools'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function UnknownNote({ event, className }: { event: Event; className?: string }) {
  const { t } = useTranslation()
  const [isCopied, setIsCopied] = useState(false)

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
          navigator.clipboard.writeText(getSharableEventId(event))
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 2000)
        }}
        variant="outline"
      >
        {isCopied ? <Check /> : <Copy />} Copy event ID
      </Button>
    </div>
  )
}
