import NormalFeed from '@/components/NormalFeed'
import RelayInfo from '@/components/RelayInfo'
import SearchInput from '@/components/SearchInput'
import { useFetchRelayInfo } from '@/hooks'
import { normalizeUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import NotFound from '../NotFound'

export default function Relay({ url, className }: { url?: string; className?: string }) {
  const { t } = useTranslation()
  const normalizedUrl = useMemo(() => (url ? normalizeUrl(url) : undefined), [url])
  const { relayInfo } = useFetchRelayInfo(normalizedUrl)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedInput, setDebouncedInput] = useState(searchInput)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(searchInput)
    }, 1000)

    return () => {
      clearTimeout(handler)
    }
  }, [searchInput])

  if (!normalizedUrl) {
    return <NotFound />
  }

  return (
    <div className={cn('pt-3', className)}>
      <RelayInfo url={normalizedUrl} />
      {relayInfo?.supported_nips?.includes(50) && (
        <div className="px-4 py-2">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('Search')}
          />
        </div>
      )}
      <NormalFeed
        subRequests={[
          { urls: [normalizedUrl], filter: debouncedInput ? { search: debouncedInput } : {} }
        ]}
      />
    </div>
  )
}
