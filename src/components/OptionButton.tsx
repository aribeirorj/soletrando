import type { ReactNode } from 'react'

interface OptionButtonProps {
  selected: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  disabled?: boolean
  selectedClassName: string
  align?: 'center' | 'left'
}

export function OptionButton({
  selected,
  onClick,
  icon,
  label,
  disabled,
  selectedClassName,
  align = 'center',
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex flex-1 items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition disabled:opacity-50 [&>svg]:shrink-0 ${
        align === 'left' ? 'justify-start text-left' : 'justify-center text-center'
      } ${
        selected
          ? selectedClassName
          : 'border-border bg-white text-brand-textMain hover:bg-brand-grayLight'
      }`}
    >
      {icon}
      <span className="min-w-0 hyphens-auto">{label}</span>
    </button>
  )
}
