import { cn } from '@/lib/utils'
import Username, { SimpleUsername } from '../Username'

export function EmbeddedMention({ userId }: { userId: string }) {
  return (
    <Username userId={userId} showAt className="text-primary font-normal inline" withoutSkeleton />
  )
}

export function EmbeddedMentionText({ userId, className }: { userId: string; className?: string }) {
  return (
    <SimpleUsername userId={userId} showAt className={cn('inline', className)} withoutSkeleton />
  )
}
