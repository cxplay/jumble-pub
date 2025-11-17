import { getEventKey, getKeyFromTag, getParentTag } from '@/lib/event'
import { getHighlightSourceTag } from '@/lib/event-metadata'
import { Event, kinds } from 'nostr-tools'
import { createContext, useCallback, useContext, useState } from 'react'

type TReplyContext = {
  repliesMap: Map<string, { events: Event[]; eventKeySet: Set<string> }>
  addReplies: (replies: Event[]) => void
}

const ReplyContext = createContext<TReplyContext | undefined>(undefined)

export const useReply = () => {
  const context = useContext(ReplyContext)
  if (!context) {
    throw new Error('useReply must be used within a ReplyProvider')
  }
  return context
}

export function ReplyProvider({ children }: { children: React.ReactNode }) {
  const [repliesMap, setRepliesMap] = useState<
    Map<string, { events: Event[]; eventKeySet: Set<string> }>
  >(new Map())

  const addReplies = useCallback((replies: Event[]) => {
    const newReplyKeySet = new Set<string>()
    const newReplyEventMap = new Map<string, Event[]>()
    replies.forEach((reply) => {
      const key = getEventKey(reply)
      if (newReplyKeySet.has(key)) return
      newReplyKeySet.add(key)

      let parentKey: string | undefined
      if (reply.kind === kinds.Highlights) {
        console.log('reply', reply)
        const sourceTag = getHighlightSourceTag(reply)
        if (!sourceTag) return

        parentKey = getKeyFromTag(sourceTag)
      } else {
        const parentTag = getParentTag(reply)
        if (!parentTag) return

        parentKey = getKeyFromTag(parentTag.tag)
      }

      if (parentKey) {
        if (reply.kind === kinds.Highlights) {
          console.log('parentKey', parentKey)
        }
        newReplyEventMap.set(parentKey, [...(newReplyEventMap.get(parentKey) || []), reply])
      }
    })
    if (newReplyEventMap.size === 0) return

    setRepliesMap((prev) => {
      for (const [key, newReplyEvents] of newReplyEventMap.entries()) {
        const replies = prev.get(key) || { events: [], eventKeySet: new Set() }
        newReplyEvents.forEach((reply) => {
          const key = getEventKey(reply)
          if (!replies.eventKeySet.has(key)) {
            replies.events.push(reply)
            replies.eventKeySet.add(key)
          }
        })
        prev.set(key, replies)
      }
      return new Map(prev)
    })
  }, [])

  return (
    <ReplyContext.Provider
      value={{
        repliesMap,
        addReplies
      }}
    >
      {children}
    </ReplyContext.Provider>
  )
}
