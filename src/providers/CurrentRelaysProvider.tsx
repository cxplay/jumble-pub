import { usePrimaryPage } from '@/PageManager'
import { createContext, useContext, useEffect, useState } from 'react'
import { useFeed } from './FeedProvider'

type TCurrentRelaysContext = {
  currentRelayUrls: string[]
  setTemporaryRelayUrls: (urls: string[]) => void
}

const CurrentRelaysContext = createContext<TCurrentRelaysContext | undefined>(undefined)

export const useCurrentRelays = () => {
  const context = useContext(CurrentRelaysContext)
  if (!context) {
    throw new Error('useCurrentRelays must be used within a CurrentRelaysProvider')
  }
  return context
}

export function CurrentRelaysProvider({ children }: { children: React.ReactNode }) {
  const { current } = usePrimaryPage()
  const { relayUrls } = useFeed()
  const [currentRelayUrls, setCurrentRelayUrls] = useState<string[]>([])
  const [temporaryRelayUrls, setTemporaryRelayUrls] = useState<string[]>([])

  useEffect(() => {
    setCurrentRelayUrls(current === 'relay' ? temporaryRelayUrls : relayUrls)
  }, [temporaryRelayUrls, current, relayUrls])

  return (
    <CurrentRelaysContext.Provider value={{ currentRelayUrls, setTemporaryRelayUrls }}>
      {children}
    </CurrentRelaysContext.Provider>
  )
}
