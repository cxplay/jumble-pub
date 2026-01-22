import { cn } from '@/lib/utils'

export function Titlebar({
  children,
  className,
  hideBottomBorder = false
}: {
  children?: React.ReactNode
  className?: string
  hideBottomBorder?: boolean
}) {
  return (
    <div
      className={cn(
        'sticky top-0 z-40 h-12 w-full select-none bg-background [&_svg]:size-5 [&_svg]:shrink-0',
        !hideBottomBorder && 'border-b',
        className
      )}
    >
      {children}
    </div>
  )
}
