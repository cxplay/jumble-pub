import { cn } from '@/lib/utils'
import { useDeepBrowsing } from '@/providers/DeepBrowsingProvider'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type TabDefinition = {
  value: string
  label: string
}

export default function Tabs({
  tabs,
  value,
  onTabChange,
  threshold = 800
}: {
  tabs: TabDefinition[]
  value: string
  onTabChange?: (tab: string) => void
  threshold?: number
}) {
  const { t } = useTranslation()
  const { deepBrowsing, lastScrollTop } = useDeepBrowsing()
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })

  useEffect(() => {
    const handleResize = () => {
      const activeIndex = tabs.findIndex((tab) => tab.value === value)
      if (tabs.length === 4) {
        console.log('notification tabs', activeIndex, value)
      }
      if (activeIndex >= 0 && tabRefs.current[activeIndex]) {
        const activeTab = tabRefs.current[activeIndex]
        const { offsetWidth, offsetLeft } = activeTab
        const padding = 24 // 12px padding on each side
        if (tabs.length === 4) {
          console.log('notification tabs', offsetWidth, offsetLeft, padding)
        }
        setIndicatorStyle({
          width: offsetWidth - padding,
          left: offsetLeft + padding / 2
        })
      }
    }
    window.addEventListener('resize', handleResize)
    setTimeout(() => handleResize(), 20) // ensure tabs are rendered before calculating
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [value])

  return (
    <div
      className={cn(
        'sticky flex justify-around top-12 p-1 bg-background z-30 w-full transition-transform',
        deepBrowsing && lastScrollTop > threshold ? '-translate-y-[calc(100%+12rem)]' : ''
      )}
    >
      {tabs.map((tab, index) => (
        <div
          key={tab.value}
          ref={(el) => (tabRefs.current[index] = el)}
          className={cn(
            `text-center w-full py-2 font-semibold clickable cursor-pointer rounded-lg`,
            value === tab.value ? '' : 'text-muted-foreground'
          )}
          onClick={() => onTabChange?.(tab.value)}
        >
          {t(tab.label)}
        </div>
      ))}
      <div
        className="absolute bottom-0 h-1 bg-primary rounded-full transition-all duration-500"
        style={{
          width: `${indicatorStyle.width}px`,
          left: `${indicatorStyle.left}px`
        }}
      />
    </div>
  )
}
