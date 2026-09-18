import { useId } from 'react'
import { SPEAK_AND_SPELL_POINTS_PER_LETTER } from '../store/gameStore'
import { MAX_ATTEMPTS } from '../store/spellingProgress'
import { StarIcon } from './icons'

interface WhatsNewNoticeProps {
  onClose: () => void
}

// Aviso na tela inicial (Individual e Turma) sobre as novidades do Falar e Soletrar.
export function WhatsNewNotice({ onClose }: WhatsNewNoticeProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="relative mt-6 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4 pr-10 text-sm text-brand-textMain"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar novidades"
        className="absolute right-3 top-3 rounded-md px-2 text-lg leading-none text-brand-textMain/70 hover:bg-brand-blue/10"
      >
        ×
      </button>

      <h3 className="flex items-center gap-2 font-bold text-brand-blueDark">
        <StarIcon className="shrink-0 text-brand-yellowDark" />
        <span id={titleId}>Novidades no Falar e Soletrar</span>
      </h3>

      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
        <li>
          <strong>Correção automática:</strong> com microfone, o app ouve cada letra que o aluno fala, corrige sozinho e
          avança. Cada letra tem até {MAX_ATTEMPTS} tentativas.
        </li>
        <li>
          <strong>Pronúncia correta:</strong> o botão 🔊 <strong>Ouvir a pronúncia</strong> fala a letra em inglês. Se o
          aluno errar {MAX_ATTEMPTS} vezes, o app mostra e fala a letra certa.
        </li>
        <li>
          <strong>Pontuação:</strong> cada letra certa vale {SPEAK_AND_SPELL_POINTS_PER_LETTER} pontos na hora, no
          placar. Letra errada não pontua, mas as outras letras continuam valendo. A palavra só conta como acerto se
          todas as letras estiverem certas.
        </li>
        <li>
          <strong>Sem microfone?</strong> Aparecem os botões <strong>Correto</strong> e <strong>Incorreto</strong> para
          marcar cada letra.
        </li>
      </ul>

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
