import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFetchRelayInfo } from '@/hooks'
import { normalizeHttpUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { GitBranch, Mail, SquareCode } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PostEditor from '../PostEditor'
import RelayBadges from '../RelayBadges'
import RelayIcon from '../RelayIcon'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

export default function RelayInfo({ url, className }: { url: string; className?: string }) {
  const { t } = useTranslation()
  const { relayInfo, isFetching } = useFetchRelayInfo(url)
  const [open, setOpen] = useState(false)

  if (isFetching || !relayInfo) {
    return null
  }

  return (
    <div className={cn('px-4 space-y-4 mb-2', className)}>
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <RelayIcon url={url} className="w-8 h-8" />
          <div className="text-2xl font-semibold truncate select-text">
            {relayInfo.name || relayInfo.shortUrl}
          </div>
        </div>
        <RelayBadges relayInfo={relayInfo} />
        {!!relayInfo.tags?.length && (
          <div className="flex gap-2">
            {relayInfo.tags.map((tag) => (
              <Badge variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
        {relayInfo.description && (
          <div className="text-wrap break-words whitespace-pre-wrap mt-2 select-text">
            {relayInfo.description}
          </div>
        )}
      </div>

      {relayInfo.payments_url && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">{t('Payment page')}:</div>
          <a
            href={normalizeHttpUrl(relayInfo.payments_url)}
            target="_blank"
            className="hover:underline text-primary select-text"
          >
            {relayInfo.payments_url}
          </a>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {relayInfo.pubkey && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">{t('Operator')}</div>
            <div className="flex gap-2 items-center">
              <UserAvatar userId={relayInfo.pubkey} size="small" />
              <Username userId={relayInfo.pubkey} className="font-semibold" />
            </div>
          </div>
        )}
        {relayInfo.contact && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">{t('Contact')}</div>
            <div className="flex gap-2 items-center font-semibold select-text">
              <Mail />
              {relayInfo.contact}
            </div>
          </div>
        )}
        {relayInfo.software && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">{t('Software')}</div>
            <div className="flex gap-2 items-center font-semibold select-text">
              <SquareCode />
              {formatSoftware(relayInfo.software)}
            </div>
          </div>
        )}
        {relayInfo.version && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">{t('Version')}</div>
            <div className="flex gap-2 items-center font-semibold select-text">
              <GitBranch />
              {relayInfo.version}
            </div>
          </div>
        )}
      </div>
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        {t('Share something on this Relay')}
      </Button>
      <PostEditor open={open} setOpen={setOpen} openFrom={[relayInfo.url]} />
    </div>
  )
}

function formatSoftware(software: string) {
  const parts = software.split('/')
  return parts[parts.length - 1]
}
