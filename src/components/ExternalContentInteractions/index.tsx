import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SPECIAL_TRUST_SCORE_FILTER_ID } from '@/constants'
import { useState } from 'react'
import QuoteList from '../QuoteList'
import ReactionList from '../ReactionList'
import ReplyNoteList from '../ReplyNoteList'
import TrustScoreFilter from '../TrustScoreFilter'
import { Tabs, TTabValue } from './Tabs'

export default function ExternalContentInteractions({
  externalContent
}: {
  externalContent: string
}) {
  const [type, setType] = useState<TTabValue>('replies')
  let list
  switch (type) {
    case 'replies':
      list = <ReplyNoteList stuff={externalContent} />
      break
    case 'reactions':
      list = <ReactionList stuff={externalContent} />
      break
    case 'quotes':
      list = <QuoteList stuff={externalContent} />
      break
    default:
      break
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <ScrollArea className="w-0 flex-1">
          <Tabs selectedTab={type} onTabChange={setType} />
          <ScrollBar orientation="horizontal" className="pointer-events-none opacity-0" />
        </ScrollArea>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex size-10 items-center justify-center">
          <TrustScoreFilter filterId={SPECIAL_TRUST_SCORE_FILTER_ID.INTERACTIONS} />
        </div>
      </div>
      <Separator />
      {list}
    </>
  )
}
