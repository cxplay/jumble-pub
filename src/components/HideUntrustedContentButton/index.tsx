import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { useUserTrust } from '@/providers/UserTrustProvider'
import { VariantProps } from 'class-variance-authority'
import { Shield, ShieldCheck } from 'lucide-react'

export default function HideUntrustedContentButton({
  type,
  size = 'icon'
}: {
  type: 'interactions' | 'notifications'
  size?: VariantProps<typeof buttonVariants>['size']
}) {
  const {
    hideUntrustedInteractions,
    hideUntrustedNotifications,
    updateHideUntrustedInteractions,
    updateHideUntrustedNotifications
  } = useUserTrust()

  const enabled = type === 'interactions' ? hideUntrustedInteractions : hideUntrustedNotifications

  const updateEnabled =
    type === 'interactions' ? updateHideUntrustedInteractions : updateHideUntrustedNotifications

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={size}>
          {enabled ? (
            <ShieldCheck className="text-green-400" />
          ) : (
            <Shield className="text-muted-foreground" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {enabled ? 'Show' : 'Hide'} untrusted {type}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {enabled
              ? `Currently hiding ${type} from untrusted users. `
              : `Currently showing all ${type}. `}
            Trusted users include people you follow and people they follow.
            {enabled
              ? ` Click continue to show all ${type}.`
              : ` Click continue to hide ${type} from untrusted users.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => updateEnabled(!enabled)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
