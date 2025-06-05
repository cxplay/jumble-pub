import { Separator } from '@/components/ui/separator'
import { BIG_RELAY_URLS, ExtendedKind } from '@/constants'
import {
  getParentEventTag,
  getRootEventHexId,
  getRootEventTag,
  isReplyNoteEvent
} from '@/lib/event'
import { generateEventIdFromETag, tagNameEquals } from '@/lib/tag'
import { useSecondaryPage } from '@/PageManager'
import { useReply } from '@/providers/ReplyProvider'
import { useUserTrust } from '@/providers/UserTrustProvider'
import client from '@/services/client.service'
import { Filter, Event as NEvent, kinds } from 'nostr-tools'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReplyNote from '../ReplyNote'

type TRootInfo = { type: 'event'; id: string; pubkey: string } | { type: 'I'; id: string }

const LIMIT = 100
const SHOW_COUNT = 10

export default function ReplyNoteList({
  index,
  event,
  className
}: {
  index?: number
  event: NEvent
  className?: string
}) {
  const { t } = useTranslation()
  const { currentIndex } = useSecondaryPage()
  const { isUserTrusted } = useUserTrust()
  const [rootInfo, setRootInfo] = useState<TRootInfo | undefined>(undefined)
  const { repliesMap, addReplies } = useReply()
  const replies = useMemo(() => {
    const replyIdSet = new Set<string>()
    const replyEvents: NEvent[] = []
    let parentEventIds = [event.id]
    while (parentEventIds.length > 0) {
      const events = parentEventIds.flatMap((id) => repliesMap.get(id)?.events || [])
      events.forEach((evt) => {
        if (replyIdSet.has(evt.id)) return
        replyIdSet.add(evt.id)
        replyEvents.push(evt)
      })
      parentEventIds = events.map((evt) => evt.id)
    }
    return replyEvents.sort((a, b) => a.created_at - b.created_at)
  }, [event.id, repliesMap])
  const [timelineKey, setTimelineKey] = useState<string | undefined>(undefined)
  const [until, setUntil] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  const [showCount, setShowCount] = useState(SHOW_COUNT)
  const [highlightReplyId, setHighlightReplyId] = useState<string | undefined>(undefined)
  const replyRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchRootEvent = async () => {
      let root: TRootInfo = { type: 'event', id: event.id, pubkey: event.pubkey }
      const rootEventTag = getRootEventTag(event)
      if (rootEventTag) {
        const [, rootEventHexId, , , rootEventPubkey] = rootEventTag
        if (rootEventHexId && rootEventPubkey) {
          root = { type: 'event', id: rootEventHexId, pubkey: rootEventPubkey }
        } else {
          const rootEventId = generateEventIdFromETag(rootEventTag)
          if (rootEventId) {
            const rootEvent = await client.fetchEvent(rootEventId)
            if (rootEvent) {
              root = { type: 'event', id: rootEvent.id, pubkey: rootEvent.pubkey }
            }
          }
        }
      } else if (event.kind === ExtendedKind.COMMENT) {
        const rootITag = event.tags.find(tagNameEquals('I'))
        if (rootITag) {
          root = { type: 'I', id: rootITag[1] }
        }
      }
      setRootInfo(root)
    }
    fetchRootEvent()
  }, [event])

  const onNewReply = useCallback((evt: NEvent) => {
    addReplies([evt])
  }, [])

  useEffect(() => {
    if (!rootInfo) return
    const handleEventPublished = (data: Event) => {
      const customEvent = data as CustomEvent<NEvent>
      const evt = customEvent.detail
      const rootId = getRootEventHexId(evt)
      if (rootId === rootInfo.id && isReplyNoteEvent(evt)) {
        onNewReply(evt)
      }
    }

    client.addEventListener('eventPublished', handleEventPublished)
    return () => {
      client.removeEventListener('eventPublished', handleEventPublished)
    }
  }, [rootInfo, onNewReply])

  useEffect(() => {
    if (loading || !rootInfo || currentIndex !== index) return

    const init = async () => {
      setLoading(true)

      try {
        const relayList = await client.fetchRelayList(
          (rootInfo as { pubkey?: string }).pubkey ?? event.pubkey
        )
        const relayUrls = relayList.read.concat(BIG_RELAY_URLS)
        const seenOn = client.getSeenEventRelayUrls(rootInfo.id)
        relayUrls.unshift(...seenOn)

        const filters: (Omit<Filter, 'since' | 'until'> & {
          limit: number
        })[] = []
        if (rootInfo.type === 'event') {
          filters.push({
            '#e': [rootInfo.id],
            kinds: [kinds.ShortTextNote],
            limit: LIMIT
          })
          if (event.kind !== kinds.ShortTextNote) {
            filters.push({
              '#E': [rootInfo.id],
              kinds: [ExtendedKind.COMMENT],
              limit: LIMIT
            })
          }
        } else {
          filters.push({
            '#I': [rootInfo.id],
            kinds: [ExtendedKind.COMMENT],
            limit: LIMIT
          })
        }
        const { closer, timelineKey } = await client.subscribeTimeline(
          filters.map((filter) => ({
            urls: relayUrls.slice(0, 5),
            filter
          })),
          {
            onEvents: (evts, eosed) => {
              if (evts.length > 0) {
                addReplies(evts.filter((evt) => isReplyNoteEvent(evt)))
              }
              if (eosed) {
                setUntil(evts.length >= LIMIT ? evts[evts.length - 1].created_at - 1 : undefined)
                setLoading(false)
              }
            },
            onNew: (evt) => {
              if (!isReplyNoteEvent(evt)) return
              addReplies([evt])
            }
          }
        )
        setTimelineKey(timelineKey)
        return closer
      } catch {
        setLoading(false)
      }
      return
    }

    const promise = init()
    return () => {
      promise.then((closer) => closer?.())
    }
  }, [rootInfo, currentIndex, index, onNewReply])

  useEffect(() => {
    if (replies.length === 0) {
      loadMore()
    }
  }, [replies])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '10px',
      threshold: 0.1
    }

    const observerInstance = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && showCount < replies.length) {
        setShowCount((prev) => prev + SHOW_COUNT)
      }
    }, options)

    const currentBottomRef = bottomRef.current

    if (currentBottomRef) {
      observerInstance.observe(currentBottomRef)
    }

    return () => {
      if (observerInstance && currentBottomRef) {
        observerInstance.unobserve(currentBottomRef)
      }
    }
  }, [replies, showCount])

  const loadMore = useCallback(async () => {
    if (loading || !until || !timelineKey) return

    setLoading(true)
    const events = await client.loadMoreTimeline(timelineKey, until, LIMIT)
    const olderEvents = events.filter((evt) => isReplyNoteEvent(evt))
    if (olderEvents.length > 0) {
      addReplies(olderEvents)
    }
    setUntil(events.length ? events[events.length - 1].created_at - 1 : undefined)
    setLoading(false)
  }, [loading, until, timelineKey])

  const highlightReply = useCallback((eventId: string, scrollTo = true) => {
    if (scrollTo) {
      const ref = replyRefs.current[eventId]
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
    setHighlightReplyId(eventId)
    setTimeout(() => {
      setHighlightReplyId((pre) => (pre === eventId ? undefined : pre))
    }, 1500)
  }, [])

  return (
    <>
      {(loading || (!!until && replies.length > 0)) && (
        <div
          className={`text-sm text-center text-muted-foreground mt-2 ${!loading ? 'hover:text-foreground cursor-pointer' : ''}`}
          onClick={loadMore}
        >
          {loading ? t('loading...') : t('load more older replies')}
        </div>
      )}
      {replies.length > 0 && (loading || until) && <Separator className="mt-2" />}
      <div className={className}>
        {replies.slice(0, showCount).map((reply) => {
          if (!isUserTrusted(reply.pubkey)) {
            const repliesForThisReply = repliesMap.get(reply.id)
            // If the reply is not trusted and there are no trusted replies for this reply, skip rendering
            if (
              !repliesForThisReply ||
              repliesForThisReply.events.every((evt) => !isUserTrusted(evt.pubkey))
            ) {
              return null
            }
          }

          const parentEventTag = getParentEventTag(reply)
          const parentEventOriginalId = parentEventTag?.[1]
          const parentEventId = parentEventTag ? generateEventIdFromETag(parentEventTag) : undefined
          return (
            <div
              ref={(el) => (replyRefs.current[reply.id] = el)}
              key={reply.id}
              className="scroll-mt-12"
            >
              <ReplyNote
                event={reply}
                parentEventId={event.id !== parentEventOriginalId ? parentEventId : undefined}
                onClickParent={() => parentEventOriginalId && highlightReply(parentEventOriginalId)}
                highlight={highlightReplyId === reply.id}
              />
            </div>
          )
        })}
      </div>
      {!loading && (
        <div className="text-sm mt-2 text-center text-muted-foreground">
          {replies.length > 0 ? t('no more replies') : t('no replies')}
        </div>
      )}
      <div ref={bottomRef} />
    </>
  )
}
