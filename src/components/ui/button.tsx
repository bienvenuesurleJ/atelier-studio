import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass',
  {
    variants: {
      variant: {
        default: 'bg-brass text-sand hover:bg-brass-2',
        quiet: 'bg-paper-2 text-ink border border-line hover:border-brass',
        ghost: 'bg-transparent text-ink hover:bg-paper-2',
        danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger/10',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 px-2.5 text-xs',
        icon: 'h-9 w-9 px-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
