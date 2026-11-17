import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1 text-xs text-muted">
      <span>{children}</span>
      {hint ? <span className="text-[11px] leading-snug text-muted/80">{hint}</span> : null}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-10 w-full rounded-lg border border-line bg-sand px-3 text-sm text-ink outline-none focus:border-brass',
        props.className,
      )}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-24 w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm text-ink outline-none focus:border-brass',
        props.className,
      )}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'h-10 w-full rounded-lg border border-line bg-sand px-2 text-sm text-ink outline-none focus:border-brass',
        props.className,
      )}
    />
  )
}
