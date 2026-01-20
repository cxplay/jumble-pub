import NotificationList from '@/components/NotificationList'
import { Button } from '@/components/ui/button'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { cn } from '@/lib/utils'
import { usePrimaryPage } from '@/PageManager'
import {
  NotificationUserPreferenceContext,
  useNotificationUserPreference
} from '@/providers/NotificationUserPreferenceProvider'
import localStorage from '@/services/local-storage.service'
import { TPageRef } from '@/types'
import { Bell } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const NotificationListPage = forwardRef<TPageRef>((_, ref) => {
  const { current } = usePrimaryPage()
  const [hideIndirect, setHideIndirect] = useState(localStorage.getHideIndirectNotifications())
  const firstRenderRef = useRef(true)
  const notificationListRef = useRef<{ refresh: () => void }>(null)

  useEffect(() => {
    if (current === 'notifications' && !firstRenderRef.current) {
      notificationListRef.current?.refresh()
    }
    firstRenderRef.current = false
  }, [current])

  const updateHideIndirect = useCallback(
    (enable: boolean) => {
      setHideIndirect(enable)
      localStorage.setHideIndirectNotifications(enable)
    },
    [setHideIndirect]
  )

  return (
    <NotificationUserPreferenceContext.Provider
      value={{
        hideIndirect,
        updateHideIndirect
      }}
    >
      <PrimaryPageLayout
        ref={ref}
        pageName="notifications"
        titlebar={<NotificationListPageTitlebar />}
        displayScrollToTopButton
      >
        <NotificationList ref={notificationListRef} />
      </PrimaryPageLayout>
    </NotificationUserPreferenceContext.Provider>
  )
})
NotificationListPage.displayName = 'NotificationListPage'
export default NotificationListPage

function NotificationListPageTitlebar() {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 items-center justify-between h-full pl-3">
      <div className="flex items-center gap-2">
        <Bell />
        <div className="text-lg font-semibold">{t('Notifications')}</div>
      </div>
      <HideUnrelatedNotificationsToggle />
    </div>
  )
}

function HideUnrelatedNotificationsToggle() {
  const { t } = useTranslation()
  const { hideIndirect, updateHideIndirect } = useNotificationUserPreference()

  return (
    <Button
      variant="ghost"
      className={cn(
        'h-10 px-3 shrink-0 rounded-xl [&_svg]:size-5',
        hideIndirect ? 'text-foreground bg-muted/40' : 'text-muted-foreground'
      )}
      onClick={() => updateHideIndirect(!hideIndirect)}
    >
      {t('Hide indirect')}
    </Button>
  )
}
