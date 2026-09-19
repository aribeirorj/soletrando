import { useId, type ReactNode } from 'react'
import { StarIcon } from './icons'

interface NoticeCardProps {
  title: string
  closeLabel: string
  onClose: () => void
  // Os itens da lista (<li>).
  children: ReactNode
}

// Cartão de aviso da tela inicial: título com estrela, lista de itens, × e "Entendi".
export function NoticeCard({ title, closeLabel, onClose, children }: NoticeCardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="relative mt-6 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4 pr-10 text-sm text-brand-textMain"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute right-3 top-3 rounded-md px-2 text-lg leading-none text-brand-textMain/70 hover:bg-brand-blue/10"
      >
        ×
      </button>

      <h3 className="flex items-center gap-2 font-bold text-brand-blueDark">
        <StarIcon className="shrink-0 text-brand-yellowDark" />
        <span id={titleId}>{title}</span>
      </h3>

      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">{children}</ul>

      <button
        type="button"
        onClick={onClose}
        className="mt-3 rounded-xl bg-brand-blueDark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue"
      >
        Entendi
      </button>
    </section>
  )
}
