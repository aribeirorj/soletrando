import type { ReactNode } from 'react'

interface OptionButtonProps {
  selected: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  disabled?: boolean
  selectedClassName: string
}

export function OptionButton({
  selected,
  onClick,
  icon,
  label,
  disabled,
  selectedClassName,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition disabled:opacity-50 ${
        selected
          ? selectedClassName
          : 'border-border bg-white text-brand-textMain hover:bg-brand-grayLight'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
