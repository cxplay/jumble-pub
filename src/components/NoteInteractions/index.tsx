import { Separator } from '@/components/ui/separator'
import { Event } from 'nostr-tools'
import { useState } from 'react'
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
      <Tabs selectedTab={type} onTabChange={setType} />
      <Separator />
      {type === 'replies' ? (
        <ReplyNoteList index={pageIndex} event={event} />
      ) : (
        <QuoteList event={event} />
      )}
    </>
  )
}
