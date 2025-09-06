import { Badge } from '@/components/ui/badge'
import { TRelayInfo } from '@/types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function RelayBadges({ relayInfo }: { relayInfo: TRelayInfo }) {
  const { t } = useTranslation()

  const badges = useMemo(() => {
    const b: string[] = []
    if (relayInfo.limitation?.payment_required) {
      b.push('Payment')
    }
    return b
  }, [relayInfo])

  if (!badges.length) {
    return null
  }

  return (
    <div className="flex gap-2">
      {badges.includes('Payment') && (
        <Badge className="bg-orange-400 hover:bg-orange-400/80">{t('relayInfoBadgePayment')}</Badge>
      )}
    </div>
  )
}
