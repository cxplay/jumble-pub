import Relay from '@/components/Relay'
import RelayPageControls from '@/components/RelayPageControls'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { normalizeUrl, simplifyUrl } from '@/lib/url'
import { useCurrentRelays } from '@/providers/CurrentRelaysProvider'
import { Server } from 'lucide-react'
import { forwardRef, useEffect, useMemo } from 'react'

const RelayPage = forwardRef(({ url }: { url?: string }, ref) => {
  const { setTemporaryRelayUrls } = useCurrentRelays()
  const normalizedUrl = useMemo(() => (url ? normalizeUrl(url) : undefined), [url])

  useEffect(() => {
    if (normalizedUrl) {
      setTemporaryRelayUrls([normalizedUrl])
    }
  }, [normalizedUrl])

  return (
    <PrimaryPageLayout
      pageName="relay"
      titlebar={<RelayPageTitlebar url={normalizedUrl} />}
      displayScrollToTopButton
      ref={ref}
    >
      <Relay url={normalizedUrl} />
    </PrimaryPageLayout>
  )
})
RelayPage.displayName = 'RelayPage'
export default RelayPage

function RelayPageTitlebar({ url }: { url?: string }) {
  return (
    <div className="flex gap-2 items-center justify-between h-full">
      <div className="flex items-center gap-2 pl-3 flex-1 w-0">
        <Server />
        <div className="text-lg font-semibold truncate">{simplifyUrl(url ?? '')}</div>
      </div>
      <div className="flex items-center flex-shrink-0">
        <RelayPageControls url={url ?? ''} />
      </div>
    </div>
  )
}
