import client from '@/services/client.service'
import storage from '@/services/local-storage.service'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNostr } from './NostrProvider'

type TUserTrustContext = {
  hideUntrustedInteractions: boolean
  hideUntrustedNotifications: boolean
  updateHideUntrustedInteractions: (hide: boolean) => void
  updateHideUntrustedNotifications: (hide: boolean) => void
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
  const [hideUntrustedInteractions, setHideUntrustedInteractions] = useState(() =>
    storage.getHideUntrustedInteractions()
  )
  const [hideUntrustedNotifications, setHideUntrustedNotifications] = useState(() =>
    storage.getHideUntrustedNotifications()
  )

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
      if (!currentPubkey) return true
      return wotSet.has(pubkey)
    },
    [currentPubkey]
  )

  const updateHideUntrustedInteractions = (hide: boolean) => {
    setHideUntrustedInteractions(hide)
    storage.setHideUntrustedInteractions(hide)
  }

  const updateHideUntrustedNotifications = (hide: boolean) => {
    setHideUntrustedNotifications(hide)
    storage.setHideUntrustedNotifications(hide)
  }

  return (
    <UserTrustContext.Provider
      value={{
        hideUntrustedInteractions,
        hideUntrustedNotifications,
        updateHideUntrustedInteractions,
        updateHideUntrustedNotifications,
        isUserTrusted
      }}
    >
      {children}
    </UserTrustContext.Provider>
  )
}
