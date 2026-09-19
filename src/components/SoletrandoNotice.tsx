import { SPEAK_AND_SPELL_POINTS_PER_LETTER } from '../store/gameStore'
import { getLanguage } from '../language/current'
import { NoticeCard } from './NoticeCard'

interface SoletrandoNoticeProps {
  onClose: () => void
}

// Aviso na tela inicial do Soletrando (Individual e Turma): o que muda em relação ao Spelling Bee.
export function SoletrandoNotice({ onClose }: SoletrandoNoticeProps) {
  const accentKeys = getLanguage().accentButtons.join(' ')

  return (
    <NoticeCard title="Como funciona o Soletrando" closeLabel="Fechar aviso" onClose={onClose}>
      <li>
        <strong>Acentos e hífen contam:</strong> "cafe" no lugar de "café" é erro. No Ouvir e Digitar, use as teclas{' '}
        {accentKeys} abaixo do campo.
      </li>
      <li>
        <strong>Letras Embaralhadas:</strong> letra com acento e hífen são blocos próprios (É, Ç, -).
      </li>
      <li>
        <strong>Soletrar:</strong> o aluno fala cada letra, dizendo o acento ("é com acento agudo", "cê
        cedilha") e o hífen. Alguém marca <strong>Correto</strong> ou <strong>Incorreto</strong> para cada letra.
      </li>
      <li>
        <strong>Pronúncia correta:</strong> o botão 🔊 <strong>Ouvir a pronúncia</strong> fala a letra em português,
        com o acento.
      </li>
      <li>
        <strong>Pontuação:</strong> cada letra certa vale {SPEAK_AND_SPELL_POINTS_PER_LETTER} pontos na hora; letra com
        acento e hífen contam como uma letra. A palavra só conta como acerto se todas as letras estiverem certas.
      </li>
    </NoticeCard>
  )
}
