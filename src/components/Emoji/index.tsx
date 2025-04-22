import { cn } from '@/lib/utils'
import { TEmoji } from '@/types'
import { Heart } from 'lucide-react'
import { HTMLAttributes, useState } from 'react'

export default function Emoji({
  emoji,
  className = ''
}: HTMLAttributes<HTMLDivElement> & {
  className?: string
  emoji: TEmoji | string
}) {
  const [hasError, setHasError] = useState(false)

  if (typeof emoji === 'string') {
    return emoji === '+' ? (
      <Heart className={cn('size-4 text-red-400 fill-red-400', className)} />
    ) : (
      <span className={cn('whitespace-nowrap', className)}>{emoji}</span>
    )
  }

  if (hasError) {
    return <span className={cn('whitespace-nowrap', className)}>{`:${emoji.shortcode}:`}</span>
  }

  return (
    <img
      src={emoji.url}
      alt={emoji.shortcode}
      className={cn('inline-block size-4', className)}
      onLoad={() => {
        setHasError(false)
      }}
      onError={() => {
        setHasError(true)
      }}
    />
  )
}
