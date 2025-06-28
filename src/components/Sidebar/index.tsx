import Icon from '@/assets/Icon'
import Logo from '@/assets/Logo'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import AccountButton from './AccountButton'
import RelaysButton from './ExploreButton'
import HomeButton from './HomeButton'
import NotificationsButton from './NotificationButton'
import PostButton from './PostButton'
import SearchButton from './SearchButton'
import SettingsButton from './SettingsButton'

export default function PrimaryPageSidebar() {
  const { isSmallScreen } = useScreenSize()
  if (isSmallScreen) return null

  return (
    <div className="w-16 xl:w-52 flex flex-col pb-2 pt-4 px-2 justify-between h-full shrink-0">
      <div className="space-y-2">
        <div className="px-3 xl:px-4 mb-6 w-full">
          <Icon className="xl:hidden" />
          <Logo className="max-xl:hidden" />
        </div>
        <HomeButton />
        <RelaysButton />
        <NotificationsButton />
        <SearchButton />
        <SettingsButton />
        <PostButton />
      </div>
      <AccountButton />
    </div>
  )
}
