import { BIG_RELAY_URLS, ExtendedKind, NOTIFICATION_LIST_STYLE } from '@/constants'
import { useInfiniteScroll } from '@/hooks'
import { compareEvents } from '@/lib/event'
import { isTouchDevice } from '@/lib/utils'
import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { useNotification } from '@/providers/NotificationProvider'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import client from '@/services/client.service'
import stuffStatsService from '@/services/stuff-stats.service'
import threadService from '@/services/thread.service'
import { TNotificationType } from '@/types'
import dayjs from 'dayjs'
import { NostrEvent, kinds, matchFilter } from 'nostr-tools'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { LoadingBar } from '../LoadingBar'
import { RefreshButton } from '../RefreshButton'
import Tabs from '../Tabs'
import { NotificationItem } from './NotificationItem'
import { NotificationSkeleton } from './NotificationItem/Notification'

const LIMIT = 100
const SHOW_COUNT = 30

const NotificationList = forwardRef((_, ref) => {
  const { t } = useTranslation()
  const { current, display } = usePrimaryPage()
  const active = useMemo(() => current === 'notifications' && display, [current, display])
  const { pubkey } = useNostr()
  const { getNotificationsSeenAt } = useNotification()
  const { notificationListStyle } = useUserPreferences()
  const [notificationType, setNotificationType] = useState<TNotificationType>('all')
  const [lastReadTime, setLastReadTime] = useState(0)
  const [refreshCount, setRefreshCount] = useState(0)
  const [timelineKey, setTimelineKey] = useState<string | undefined>(undefined)
  const [initialLoading, setInitialLoading] = useState(true)
  const [notifications, setNotifications] = useState<NostrEvent[]>([])
  const [until, setUntil] = useState<number | undefined>(dayjs().unix())
  const supportTouch = useMemo(() => isTouchDevice(), [])
  const topRef = useRef<HTMLDivElement | null>(null)
  const filterKinds = useMemo(() => {
    switch (notificationType) {
      case 'mentions':
        return [
          kinds.ShortTextNote,
          kinds.Highlights,
          ExtendedKind.COMMENT,
          ExtendedKind.VOICE_COMMENT,
          ExtendedKind.POLL
        ]
      case 'reactions':
        return [kinds.Reaction, kinds.Repost, kinds.GenericRepost, ExtendedKind.POLL_RESPONSE]
      case 'zaps':
        return [kinds.Zap]
      default:
        return [
          kinds.ShortTextNote,
          kinds.Repost,
          kinds.GenericRepost,
          kinds.Reaction,
          kinds.Zap,
          kinds.Highlights,
          ExtendedKind.COMMENT,
          ExtendedKind.POLL_RESPONSE,
          ExtendedKind.VOICE_COMMENT,
          ExtendedKind.POLL
        ]
    }
  }, [notificationType])
  useImperativeHandle(
    ref,
    () => ({
      refresh: () => {
        if (initialLoading) return
        setRefreshCount((count) => count + 1)
      }
    }),
    [initialLoading]
  )

  const handleNewEvent = useCallback(
    (event: NostrEvent) => {
      if (event.pubkey === pubkey) return
      setNotifications((oldEvents) => {
        const index = oldEvents.findIndex((oldEvent) => compareEvents(oldEvent, event) <= 0)
        if (index !== -1 && oldEvents[index].id === event.id) {
          return oldEvents
        }

        stuffStatsService.updateStuffStatsByEvents([event])
        if (index === -1) {
          return [...oldEvents, event]
        }
        return [...oldEvents.slice(0, index), event, ...oldEvents.slice(index)]
      })
    },
    [pubkey]
  )

  useEffect(() => {
    if (current !== 'notifications') return

    if (!pubkey) {
      setUntil(undefined)
      return
    }

    const init = async () => {
      setInitialLoading(true)
      setNotifications([])
      setRefreshCount(SHOW_COUNT)
      setLastReadTime(getNotificationsSeenAt())
      const relayList = await client.fetchRelayList(pubkey)

      const { closer, timelineKey } = await client.subscribeTimeline(
        [
          {
            urls: relayList.read.length > 0 ? relayList.read.slice(0, 5) : BIG_RELAY_URLS,
            filter: {
              '#p': [pubkey],
              kinds: filterKinds,
              limit: LIMIT
            }
          }
        ],
        {
          onEvents: (events, eosed) => {
            if (events.length > 0) {
              setNotifications(events.filter((event) => event.pubkey !== pubkey))
            }
            if (eosed) {
              setInitialLoading(false)
              setUntil(events.length > 0 ? events[events.length - 1].created_at - 1 : undefined)
              threadService.addRepliesToThread(events)
              stuffStatsService.updateStuffStatsByEvents(events)
            }
          },
          onNew: (event) => {
            handleNewEvent(event)
            threadService.addRepliesToThread([event])
          }
        },
        { needSaveToDb: true }
      )
      setTimelineKey(timelineKey)
      return closer
    }

    const promise = init()
    return () => {
      promise.then((closer) => closer?.())
    }
  }, [pubkey, refreshCount, filterKinds, current])

  useEffect(() => {
    if (!active || !pubkey) return

    const handler = (data: Event) => {
      const customEvent = data as CustomEvent<{ event: NostrEvent; relays: string[] }>
      const { event } = customEvent.detail
      if (
        matchFilter(
          {
            kinds: filterKinds,
            '#p': [pubkey]
          },
          event
        )
      ) {
        handleNewEvent(event)
      }
    }

    client.addEventListener('newEvent', handler)
    return () => {
      client.removeEventListener('newEvent', handler)
    }
  }, [pubkey, active, filterKinds, handleNewEvent])

  const handleLoadMore = useCallback(async () => {
    if (!timelineKey || !until) return false
    const newEvents = await client.loadMoreTimeline(timelineKey, until, LIMIT)
    if (newEvents.length === 0) {
      return false
    }

    setNotifications((oldNotifications) => [
      ...oldNotifications,
      ...newEvents.filter((event) => event.pubkey !== pubkey)
    ])
    setUntil(newEvents[newEvents.length - 1].created_at - 1)
    return true
  }, [timelineKey, until, pubkey, setNotifications, setUntil])

  const { visibleItems, shouldShowLoadingIndicator, bottomRef, setShowCount } = useInfiniteScroll({
    items: notifications,
    showCount: SHOW_COUNT,
    onLoadMore: handleLoadMore,
    initialLoading
  })

  const refresh = () => {
    topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    setTimeout(() => {
      setRefreshCount((count) => count + 1)
    }, 500)
  }

  const list = (
    <div>
      {initialLoading && shouldShowLoadingIndicator && <LoadingBar />}
      <div className={notificationListStyle === NOTIFICATION_LIST_STYLE.COMPACT ? 'mb-2' : ''} />
      {visibleItems.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isNew={notification.created_at > lastReadTime}
        />
      ))}
      <div ref={bottomRef} />
      <div className="text-center text-sm text-muted-foreground">
        {!!until || shouldShowLoadingIndicator ? (
          <NotificationSkeleton />
        ) : (
          t('no more notifications')
        )}
      </div>
    </div>
  )

  return (
    <div>
      <Tabs
        value={notificationType}
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'mentions', label: 'Mentions' },
          { value: 'reactions', label: 'Reactions' },
          { value: 'zaps', label: 'Zaps' }
        ]}
        onTabChange={(type) => {
          setShowCount(SHOW_COUNT)
          setNotificationType(type as TNotificationType)
        }}
        options={!supportTouch ? <RefreshButton onClick={() => refresh()} /> : null}
      />
      <div ref={topRef} className="scroll-mt-[calc(6rem+1px)]" />
      {supportTouch ? (
        <PullToRefresh
          onRefresh={async () => {
            refresh()
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }}
          pullingContent=""
        >
          {list}
        </PullToRefresh>
      ) : (
        list
      )}
    </div>
  )
})
NotificationList.displayName = 'NotificationList'
export default NotificationList
