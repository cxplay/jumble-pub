import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useTheme } from '@/providers/ThemeProvider'
import EmojiPickerReact, {
  EmojiStyle,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme
} from 'emoji-picker-react'
import { MouseDownEvent } from 'emoji-picker-react/dist/config/config'

export default function EmojiPicker({ onEmojiClick }: { onEmojiClick: MouseDownEvent }) {
  const { themeSetting } = useTheme()
  const { isSmallScreen } = useScreenSize()

  return (
    <EmojiPickerReact
      theme={
        themeSetting === 'system' ? Theme.AUTO : themeSetting === 'dark' ? Theme.DARK : Theme.LIGHT
      }
      width={isSmallScreen ? '100%' : 350}
      autoFocusSearch={false}
      searchDisabled
      emojiStyle={EmojiStyle.NATIVE}
      skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
      style={
        {
          '--epr-bg-color': 'hsl(var(--background))',
          '--epr-category-label-bg-color': 'hsl(var(--background))',
          '--epr-text-color': 'hsl(var(--foreground))',
          '--epr-hover-bg-color': 'hsl(var(--muted) / 0.5)',
          '--epr-picker-border-color': 'transparent'
        } as React.CSSProperties
      }
      suggestedEmojisMode={SuggestionMode.FREQUENT}
      onEmojiClick={onEmojiClick}
    />
  )
}
