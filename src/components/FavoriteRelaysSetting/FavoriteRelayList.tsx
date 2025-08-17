import { useFavoriteRelays } from '@/providers/FavoriteRelaysProvider'
import { useTranslation } from 'react-i18next'
import RelayItem from './RelayItem'

export default function FavoriteRelayList() {
  const { t } = useTranslation()
  const { favoriteRelays } = useFavoriteRelays()

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground font-semibold select-none">{t('Relays')}</div>
      {favoriteRelays.map((relay) => (
        <RelayItem key={relay} relay={relay} />
      ))}
    </div>
  )
}
