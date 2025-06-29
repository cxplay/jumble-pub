import libreTranslate from '@/services/libre-translate.service'
import storage from '@/services/local-storage.service'
import translation from '@/services/translation.service'
import { TTranslationAccount, TTranslationServiceConfig } from '@/types'
import { Event, kinds } from 'nostr-tools'
import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNostr } from './NostrProvider'

const translatedEventCache: Map<string, Event> = new Map()
const translatedTextCache: Map<string, string> = new Map()

type TTranslationServiceContext = {
  config: TTranslationServiceConfig
  translatedEventIdSet: Set<string>
  translateText: (text: string) => Promise<string>
  translateEvent: (event: Event) => Promise<Event | void>
  getTranslatedEvent: (eventId: string) => Event | null
  showOriginalEvent: (eventId: string) => void
  getAccount: () => Promise<TTranslationAccount | void>
  regenerateApiKey: () => Promise<string | undefined>
  updateConfig: (newConfig: TTranslationServiceConfig) => void
}

const TranslationServiceContext = createContext<TTranslationServiceContext | undefined>(undefined)

export const useTranslationService = () => {
  const context = useContext(TranslationServiceContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

export function TranslationServiceProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const [config, setConfig] = useState<TTranslationServiceConfig>({ service: 'jumble' })
  const { pubkey, startLogin } = useNostr()
  const [translatedEventIdSet, setTranslatedEventIdSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    translation.changeCurrentPubkey(pubkey)
    const config = storage.getTranslationServiceConfig(pubkey)
    setConfig(config)
  }, [pubkey])

  const getAccount = async (): Promise<TTranslationAccount | void> => {
    if (config.service !== 'jumble') return
    if (!pubkey) {
      startLogin()
      return
    }
    return await translation.getAccount()
  }

  const regenerateApiKey = async (): Promise<string | undefined> => {
    if (config.service !== 'jumble') return
    if (!pubkey) {
      startLogin()
      return
    }
    return await translation.regenerateApiKey()
  }

  const getTranslatedEvent = (eventId: string): Event | null => {
    const target = i18n.language
    const cacheKey = target + '_' + eventId
    return translatedEventCache.get(cacheKey) ?? null
  }

  const translate = async (text: string, target: string): Promise<string> => {
    if (config.service === 'jumble') {
      return await translation.translate(text, target)
    } else {
      return await libreTranslate.translate(text, target, config.server, config.api_key)
    }
  }

  const translateText = async (text: string): Promise<string> => {
    if (!text) {
      return text
    }

    const target = i18n.language
    const cacheKey = target + '_' + text
    const cache = translatedTextCache.get(cacheKey)
    if (cache) {
      return cache
    }

    const translatedText = await translate(text, target)
    translatedTextCache.set(cacheKey, translatedText)
    return translatedText
  }

  const translateHighlightEvent = async (event: Event): Promise<Event> => {
    const target = i18n.language
    const comment = event.tags.find((tag) => tag[0] === 'comment')?.[1]
    if (!event.content && !comment) {
      return event
    }
    const [translatedContent, translatedComment] = await Promise.all([
      translate(event.content, target),
      !!comment && translate(comment, target)
    ])

    const translatedEvent: Event = {
      ...event,
      content: translatedContent
    }
    if (translatedComment) {
      translatedEvent.tags = event.tags.map((tag) =>
        tag[0] === 'comment' ? ['comment', translatedComment] : tag
      )
    }
    setTranslatedEventIdSet((prev) => new Set(prev.add(event.id)))
    return translatedEvent
  }

  const translateEvent = async (event: Event): Promise<Event | void> => {
    if (config.service === 'jumble' && !pubkey) {
      startLogin()
      return
    }

    const target = i18n.language
    const cacheKey = target + '_' + event.id
    const cache = translatedEventCache.get(cacheKey)
    if (cache) {
      setTranslatedEventIdSet((prev) => new Set(prev.add(event.id)))
      return cache
    }

    let translatedEvent: Event | undefined
    if (event.kind === kinds.Highlights) {
      translatedEvent = await translateHighlightEvent(event)
    } else {
      const translatedText = await translate(event.content, target)
      if (!translatedText) {
        return
      }
      translatedEvent = { ...event, content: translatedText }
    }

    translatedEventCache.set(cacheKey, translatedEvent)
    setTranslatedEventIdSet((prev) => new Set(prev.add(event.id)))
    return translatedEvent
  }

  const showOriginalEvent = (eventId: string) => {
    setTranslatedEventIdSet((prev) => {
      const newSet = new Set(prev)
      newSet.delete(eventId)
      return newSet
    })
  }

  const updateConfig = (newConfig: TTranslationServiceConfig) => {
    setConfig(newConfig)
    storage.setTranslationServiceConfig(newConfig, pubkey)
  }

  return (
    <TranslationServiceContext.Provider
      value={{
        config,
        translatedEventIdSet,
        getAccount,
        regenerateApiKey,
        translateText,
        translateEvent,
        getTranslatedEvent,
        showOriginalEvent,
        updateConfig
      }}
    >
      {children}
    </TranslationServiceContext.Provider>
  )
}
