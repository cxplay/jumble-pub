import Settings from '@/components/Settings'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { TPageRef } from '@/types'
import { SettingsIcon } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

const SettingsPage = forwardRef<TPageRef>((_, ref) => (
  <PrimaryPageLayout
    pageName="settings"
    ref={ref}
    titlebar={<SettingsPageTitlebar />}
    displayScrollToTopButton
  >
    <Settings />
  </PrimaryPageLayout>
))
SettingsPage.displayName = 'SettingsPage'
export default SettingsPage

function SettingsPageTitlebar() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full items-center gap-2 pl-3">
      <SettingsIcon />
      <div className="text-lg font-semibold">{t('Settings')}</div>
    </div>
  )
}
