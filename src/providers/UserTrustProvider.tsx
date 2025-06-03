import client from '@/services/client.service'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNostr } from './NostrProvider'
import storage from '@/services/local-storage.service'

type TUserTrustContext = {
  enabled: boolean
  updateEnabled: (enabled: boolean) => void
  isUserTrusted: (pubkey: string) => boolean
}

const UserTrustContext = createContext<TUserTrustContext | undefined>(undefined)

export const useUserTrust = () => {
  const context = useContext(UserTrustContext)
  if (!context) {
    throw new Error('useUserTrust must be used within a UserTrustProvider')
  }
  return context
}

const wotSet = new Set<string>()

export function UserTrustProvider({ children }: { children: React.ReactNode }) {
  const { pubkey: currentPubkey } = useNostr()
  const [enabled, setEnabled] = useState(storage.getHideUntrustedEvents())

  useEffect(() => {
    if (!currentPubkey) return

    const initWoT = async () => {
      const followings = await client.fetchFollowings(currentPubkey)
      await Promise.allSettled(
        followings.map(async (pubkey) => {
          wotSet.add(pubkey)
          const _followings = await client.fetchFollowings(pubkey)
          _followings.forEach((following) => wotSet.add(following))
        })
      )
    }
    initWoT()
  }, [currentPubkey])

  const isUserTrusted = useCallback(
    (pubkey: string) => {
      if (!currentPubkey || !enabled) return true
      return wotSet.has(pubkey)
    },
    [currentPubkey, enabled]
  )

  const updateEnabled = (enabled: boolean) => {
    setEnabled(enabled)
    storage.setHideUntrustedEvents(enabled)
  }

  return (
    <UserTrustContext.Provider value={{ enabled, updateEnabled, isUserTrusted }}>
      {children}
    </UserTrustContext.Provider>
  )
}
