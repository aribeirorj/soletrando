import { SPEAK_AND_SPELL_POINTS_PER_LETTER } from '../store/gameStore'
import { MAX_ATTEMPTS } from '../store/spellingProgress'
import { NoticeCard } from './NoticeCard'

interface WhatsNewNoticeProps {
  onClose: () => void
}

// Aviso na tela inicial (Individual e Turma) sobre as novidades do Falar e Soletrar.
export function WhatsNewNotice({ onClose }: WhatsNewNoticeProps) {
  return (
    <NoticeCard title="Novidades no Falar e Soletrar" closeLabel="Fechar novidades" onClose={onClose}>
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
    </NoticeCard>
  )
}
