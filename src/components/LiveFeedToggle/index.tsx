import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import { Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function LiveFeedToggle() {
  const { t } = useTranslation()
  const { enableLiveFeed, updateEnableLiveFeed } = useUserPreferences()

  return (
    <Button
      variant="ghost"
      size="titlebar-icon"
      title={t(enableLiveFeed ? 'Disable live feed' : 'Enable live feed')}
      onClick={() => updateEnableLiveFeed(!enableLiveFeed)}
    >
      <Radio
        className={cn(
          'size-4',
          enableLiveFeed
            ? 'text-green-400 focus:text-green-300 animate-pulse'
            : 'text-muted-foreground focus:text-foreground'
        )}
      />
    </Button>
  )
}
