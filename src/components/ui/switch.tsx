import { Switch } from 'radix-ui'
import { cn } from '@/lib/utils'

export function Toggle({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (value: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative h-6 w-11 rounded-full border border-line bg-sand transition data-[state=checked]:bg-moss',
        )}
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-ink transition data-[state=checked]:translate-x-5" />
      </Switch.Root>
    </label>
  )
}
