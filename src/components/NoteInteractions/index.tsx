import { Separator } from '@/components/ui/separator'
import { Event } from 'nostr-tools'
import { useState } from 'react'
import HideUntrustedContentButton from '../HideUntrustedContentButton'
import QuoteList from '../QuoteList'
import ReplyNoteList from '../ReplyNoteList'
import { Tabs, TTabValue } from './Tabs'

export default function NoteInteractions({
  pageIndex,
  event
}: {
  pageIndex?: number
  event: Event
}) {
  const [type, setType] = useState<TTabValue>('replies')

  return (
    <>
      <div className="flex items-center justify-between pr-1">
        <Tabs selectedTab={type} onTabChange={setType} />
        <HideUntrustedContentButton type="interactions" />
      </div>
      <Separator />
      {type === 'replies' ? (
        <ReplyNoteList index={pageIndex} event={event} />
      ) : (
        <QuoteList event={event} />
      )}
    </>
  )
}
