import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[70] max-h-[min(85vh,720px)] w-[min(560px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border border-line bg-paper p-5 shadow-2xl',
            className,
          )}
        >
          <Dialog.Title className="font-serif text-2xl">{title}</Dialog.Title>
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
