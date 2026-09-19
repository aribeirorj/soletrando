import type { Word } from '../../types'
import type { WordCategory } from '../speakAndSpellCategories'

// Categorias do Soletrar no Soletrando: os mesmos temas do Spelling Bee, com palavras
// em português (Acordo Ortográfico de 2009), e depois as que só existem no Soletrando.
// Adjetivos e nacionalidades no masculino singular.
export const PT_SPEAK_AND_SPELL_CATEGORIES: WordCategory[] = [
  {
    id: 'colors',
    label: 'Cores',
    words: [
      'amarelo', 'azul', 'branco', 'cinza', 'laranja', 'marrom', 'preto', 'rosa',
      'roxo', 'verde', 'vermelho', 'violeta',
    ],
  },
  {
    id: 'seasons',
    label: 'Estações do Ano',
    words: ['primavera', 'verão', 'outono', 'inverno'],
  },
  {
    id: 'days-of-week',
    label: 'Dias da Semana',
    words: [
      'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira',
      'sexta-feira', 'sábado',
    ],
  },
  {
    id: 'months',
    label: 'Meses do Ano',
    words: [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto',
      'setembro', 'outubro', 'novembro', 'dezembro',
    ],
  },
  {
    id: 'school-supplies',
    label: 'Material Escolar',
    words: [
      'caderno', 'mochila', 'régua', 'borracha', 'pasta', 'livro', 'lápis', 'caneta',
      'cola', 'tesoura', 'apontador', 'estojo',
    ],
  },
  {
    id: 'house-parts',
    label: 'Partes da Casa',
    words: [
      'sótão', 'varanda', 'porão', 'banheiro', 'quarto', 'teto', 'sala de jantar',
      'porta', 'campainha', 'chão', 'garagem', 'jardim', 'corredor', 'cozinha',
      'lavanderia', 'sala de estar', 'piscina', 'telhado', 'escada', 'parede',
      'janela', 'quintal',
    ],
  },
  {
    id: 'body-parts',
    label: 'Partes do Corpo',
    words: [
      'cabelo', 'olho', 'boca', 'cabeça', 'peito', 'mão', 'barriga', 'perna', 'pé',
      'nariz', 'orelha', 'braço', 'joelho', 'ombro', 'pescoço', 'dedo',
    ],
  },
  {
    id: 'animals',
    label: 'Animais',
    words: [
      'jacaré', 'gato', 'cachorro', 'leão', 'tigre', 'pássaro', 'urso', 'girafa',
      'canguru', 'elefante', 'macaco', 'cobra', 'tubarão', 'baleia', 'lobo',
      'coelho', 'cavalo', 'tartaruga',
    ],
  },
  {
    id: 'nationalities',
    label: 'Nacionalidades',
    words: [
      'afegão', 'americano', 'argentino', 'australiano', 'brasileiro', 'britânico',
      'canadense', 'chinês', 'colombiano', 'egípcio', 'inglês', 'francês',
      'alemão', 'havaiano', 'indiano', 'irlandês', 'coreano', 'mexicano',
      'português', 'russo', 'espanhol',
    ],
  },
  {
    id: 'transportation',
    label: 'Meios de Transporte',
    words: [
      'avião', 'bicicleta', 'barco', 'ônibus', 'veleiro', 'patinete', 'navio',
      'metrô', 'táxi', 'trem', 'caminhão', 'helicóptero', 'motocicleta',
    ],
  },
  {
    id: 'food',
    label: 'Comidas',
    words: [
      'hambúrguer', 'batata frita', 'batata', 'tomate', 'alface', 'arroz', 'feijão',
      'espaguete', 'manteiga', 'pão', 'chocolate', 'açúcar', 'ovo', 'bife', 'carne',
      'queijo', 'sanduíche', 'frango', 'linguiça', 'cebola', 'peixe',
    ],
  },
  {
    id: 'drinks',
    label: 'Bebidas',
    words: [
      'suco', 'refrigerante', 'café', 'limonada', 'leite', 'vitamina', 'água', 'chá',
      'chocolate quente', 'achocolatado', 'água de coco',
    ],
  },
  {
    id: 'fruit',
    label: 'Frutas',
    words: [
      'maçã', 'abacate', 'banana', 'amora', 'cereja', 'coco', 'uva', 'avelã', 'limão',
      'manga', 'melão', 'laranja', 'pêssego', 'pera', 'abacaxi', 'ameixa', 'romã',
      'framboesa', 'morango', 'tangerina', 'melancia', 'goiaba', 'jabuticaba',
      'maracujá',
    ],
  },
  {
    id: 'music-instruments',
    label: 'Instrumentos Musicais',
    words: [
      'violão', 'guitarra', 'trompete', 'saxofone', 'violino', 'piano', 'flauta',
      'bateria', 'pandeiro', 'cavaquinho', 'tambor', 'sanfona',
    ],
  },
  {
    id: 'sports',
    label: 'Esportes',
    words: [
      'ginástica', 'arco e flecha', 'atletismo', 'basquete', 'beisebol', 'boliche',
      'boxe', 'ciclismo', 'mergulho', 'pesca', 'futebol', 'golfe', 'handebol', 'judô',
      'caratê', 'natação', 'patinação', 'surfe', 'tênis', 'vôlei', 'xadrez',
      'capoeira',
    ],
  },
  {
    id: 'clothes',
    label: 'Roupas',
    words: [
      'blusa', 'camisa', 'calça', 'sapato', 'casaco', 'óculos', 'relógio', 'anel',
      'brinco', 'saia', 'luva', 'vestido', 'suéter', 'terno', 'bermuda', 'maiô',
    ],
  },
  {
    id: 'family-members',
    label: 'Membros da Família',
    words: [
      'mãe', 'pai', 'irmão', 'irmã', 'avô', 'avó', 'tio', 'tia', 'primo', 'prima',
      'filho', 'filha', 'neto', 'neta', 'sobrinho', 'sobrinha', 'padrinho',
      'madrinha', 'afilhado', 'marido', 'esposa', 'enteado', 'padrasto', 'madrasta',
      'sogro', 'sogra', 'cunhado',
    ],
  },
  {
    id: 'occupations',
    label: 'Profissões',
    words: [
      'contador', 'ator', 'arqueólogo', 'arquiteto', 'artista', 'astronauta',
      'atleta', 'advogado', 'escritor', 'padeiro', 'bancário', 'biólogo', 'pedreiro',
      'empresário', 'açougueiro', 'carpinteiro', 'cartunista', 'cozinheiro',
      'treinador', 'compositor', 'dançarino', 'dentista', 'detetive', 'médico',
      'costureiro', 'motorista', 'economista', 'eletricista', 'engenheiro',
      'fazendeiro', 'bombeiro', 'pescador', 'florista', 'jardineiro', 'cabeleireiro',
      'jornalista', 'juiz', 'salva-vidas', 'mágico', 'carteiro', 'gerente',
      'mecânico', 'músico', 'enfermeiro', 'pintor', 'farmacêutico', 'filósofo',
      'fotógrafo', 'pianista', 'piloto', 'encanador', 'poeta', 'policial', 'político',
      'programador', 'psicólogo', 'recepcionista', 'repórter', 'pesquisador',
      'marinheiro', 'vendedor', 'cientista', 'secretário', 'cantor', 'soldado',
      'estudante', 'professor', 'técnico', 'veterinário', 'garçom',
    ],
  },
  {
    id: 'adjectives',
    label: 'Adjetivos',
    words: [
      'aventureiro', 'agressivo', 'ambicioso', 'divertido', 'bonito', 'cuidadoso',
      'charmoso', 'alegre', 'confiante', 'criativo', 'curioso', 'desrespeitoso',
      'decepcionado', 'gentil', 'feliz', 'honesto', 'inteligente', 'ciumento',
      'nervoso', 'organizado', 'extrovertido', 'paciente', 'educado', 'responsável',
      'sensato', 'sensível', 'tagarela', 'preocupado',
    ],
  },
  {
    id: 'countries',
    label: 'Países',
    words: [
      'afeganistão', 'argentina', 'austrália', 'bélgica', 'brasil', 'canadá', 'chile',
      'china', 'colômbia', 'dinamarca', 'egito', 'inglaterra', 'finlândia', 'frança',
      'alemanha', 'grécia', 'havaí', 'islândia', 'irã', 'irlanda', 'itália',
      'jamaica', 'japão', 'coreia', 'méxico', 'marrocos', 'holanda', 'paraguai',
      'portugal', 'rússia', 'escócia', 'singapura', 'espanha', 'suécia', 'suíça',
      'turquia', 'reino unido', 'estados unidos', 'uruguai',
    ],
  },
  // Só no Soletrando: lista da escola sobre ciência, informação e argumentação ("livro" já está
  // em Material Escolar).
  {
    id: 'science-and-information',
    label: 'Ciência e Informação',
    words: [
      'ciência', 'científica', 'consequência', 'inteligência', 'tecnologia', 'informação',
      'opinião', 'referência', 'responsabilidade', 'credibilidade', 'transparência', 'explicação',
      'propagação', 'comunicação', 'comparação', 'conclusão', 'desenvolvimento',
      'sustentabilidade', 'autorais', 'digitalização', 'desinformação', 'artificial', 'divulgação',
      'argumentação', 'interpretação', 'modalizador', 'conectivo', 'referenciação', 'finalidade',
      'manipulação', 'qualidade', 'reciclagem', 'investimento', 'plataforma', 'algoritmo',
      'usuário', 'conexão', 'fato', 'texto', 'tema', 'ideia', 'fonte', 'notícia', 'escola',
      'aluno', 'pesquisa', 'dados', 'autor', 'leitura', 'internet', 'cuidado', 'verdade',
      'exemplo', 'argumento',
    ],
  },
]

const SPEAK_AND_SPELL_DIFFICULTY = 'dificil' as const

export function getPortugueseSpeakAndSpellWords(categoryIds: string[] | null): Word[] {
  if (!categoryIds) return []
  const categories = PT_SPEAK_AND_SPELL_CATEGORIES.filter((c) => categoryIds.includes(c.id))
  return categories.flatMap((category) =>
    category.words.map((text) => ({ text, difficulty: SPEAK_AND_SPELL_DIFFICULTY })),
  )
}
