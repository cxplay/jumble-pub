import Explore from '@/components/Explore'
import FollowingFavoriteRelayList from '@/components/FollowingFavoriteRelayList'
import Tabs from '@/components/Tabs'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { Compass } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type TExploreTabs = 'following' | 'explore'

const ExplorePage = forwardRef((_, ref) => {
  const [tab, setTab] = useState<TExploreTabs>('explore')

  return (
    <PrimaryPageLayout
      ref={ref}
      pageName="explore"
      titlebar={<ExplorePageTitlebar />}
      displayScrollToTopButton
    >
      <Tabs
        value={tab}
        tabs={[
          { value: 'explore', label: 'Explore' },
          { value: 'following', label: "Following's Favorites" }
        ]}
        onTabChange={(tab) => setTab(tab as TExploreTabs)}
      />
      {tab === 'following' ? <FollowingFavoriteRelayList /> : <Explore />}
    </PrimaryPageLayout>
  )
})
ExplorePage.displayName = 'ExplorePage'
export default ExplorePage

function ExplorePageTitlebar() {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 items-center h-full pl-3">
      <Compass />
      <div className="text-lg font-semibold">{t('Explore')}</div>
    </div>
  )
}
