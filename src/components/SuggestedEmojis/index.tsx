import { Button } from '@/components/ui/button'
import { parseNativeEmoji } from 'emoji-picker-react/src/dataUtils/parseNativeEmoji'
import { getSuggested } from 'emoji-picker-react/src/dataUtils/suggested'
import { MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SuggestedEmojis({
  onEmojiClick,
  onMoreButtonClick
}: {
  onEmojiClick: (emoji: string) => void
  onMoreButtonClick: () => void
}) {
  const [suggestedEmojis, setSuggestedEmojis] = useState<string[]>([
    '1f44d',
    '2764-fe0f',
    '1f602',
    '1f972',
    '1f440',
    '1fae1',
    '1fac2'
  ]) // 👍 ❤️ 😂 🥲 👀 🫡 🫂

  useEffect(() => {
    try {
      const suggested = getSuggested()
      const suggestEmojis = suggested.sort((a, b) => b.count - a.count).map((item) => item.unified)
      setSuggestedEmojis((pre) =>
        [...suggestEmojis, ...pre.filter((e) => !suggestEmojis.includes(e))].slice(0, 8)
      )
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="flex gap-2 p-1" onClick={(e) => e.stopPropagation()}>
      {suggestedEmojis.map((emoji, index) => (
        <div
          key={index}
          className="w-8 h-8 rounded-lg clickable flex justify-center items-center text-xl"
          onClick={() => onEmojiClick(parseNativeEmoji(emoji))}
        >
          {parseNativeEmoji(emoji)}
        </div>
      ))}
      <Button variant="ghost" className="w-8 h-8 text-muted-foreground" onClick={onMoreButtonClick}>
        <MoreHorizontal size={24} />
      </Button>
    </div>
  )
}
