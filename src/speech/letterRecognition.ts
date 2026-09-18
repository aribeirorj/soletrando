import type { Model } from 'vosk-browser'
import { LETTER_GRAMMAR, parseHeardLetters } from './letterNames'

export type LetterRecognitionStatus =
  | 'idle'
  | 'loading'
  | 'listening'
  | 'unsupported'
  | 'mic-denied'
  | 'no-mic'
  | 'error'

const UNAVAILABLE_STATUSES: LetterRecognitionStatus[] = ['unsupported', 'mic-denied', 'no-mic', 'error']

// Status em que não dá para jogar por voz: o jogo cai nos botões Correto/Incorreto.
export function isRecognitionUnavailable(status: LetterRecognitionStatus): boolean {
  return UNAVAILABLE_STATUSES.includes(status)
}

export interface LetterRecognitionHandlers {
  onStatusChange: (status: LetterRecognitionStatus) => void
  onLettersHeard: (letters: string[], isFinal: boolean) => void
  // Enquanto devolver true, o reconhecedor recebe silêncio no lugar do microfone
  // (ex.: o próprio app está falando uma letra e não pode se ouvir).
  isMuted?: () => boolean
}

// Gerado por scripts/prepare-vosk-model.sh. O vosk-browser guarda o modelo extraído
// no IndexedDB indexado por esta URL: mudar o nome força um novo download.
const MODEL_URL = `${import.meta.env.BASE_URL}models/vosk-model-small-en-us-0.15.tar.gz`

let modelPromise: Promise<Model> | null = null

// Não usa createModel() do vosk-browser: ele nunca rejeita quando o download falha.
function loadModel(): Promise<Model> {
  modelPromise ??= import('vosk-browser')
    .then(
      ({ Model }) =>
        new Promise<Model>((resolve, reject) => {
          const model = new Model(MODEL_URL, -1)
          const fail = (reason: string) => {
            model.terminate()
            reject(new Error(reason))
          }
          model.on('load', (message) => {
            if (message.event === 'load' && message.result) resolve(model)
            else fail('O modelo de voz não carregou')
          })
          model.on('error', (message) => {
            fail(message.event === 'error' ? message.error : 'Erro no modelo de voz')
          })
        }),
    )
    .catch((error: unknown) => {
      modelPromise = null
      throw error
    })
  return modelPromise
}

export function isLetterRecognitionSupported(): boolean {
  return (
    window.isSecureContext === true &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof AudioContext === 'function' &&
    typeof Worker === 'function' &&
    typeof WebAssembly === 'object' &&
    typeof indexedDB === 'object'
  )
}

function microphoneErrorStatus(error: unknown): LetterRecognitionStatus {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'mic-denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no-mic'
  return 'error'
}

function debug(kind: string, text: string) {
  if (import.meta.env.DEV) console.debug('[letra-ouvida]', kind, JSON.stringify(text), Math.round(performance.now()))
}

// Liga o microfone ao reconhecedor. Devolve a função que desfaz tudo, exceto o modelo,
// que fica em memória para a próxima vez.
function listen(model: Model, stream: MediaStream, handlers: LetterRecognitionHandlers): () => void {
  const context = new AudioContext()
  const recognizer = new model.KaldiRecognizer(context.sampleRate, LETTER_GRAMMAR)
  let active = true
  let lastPartial = ''

  recognizer.on('partialresult', (message) => {
    if (!active || message.event !== 'partialresult') return
    const partial = message.result.partial
    if (!partial || partial === lastPartial) return
    lastPartial = partial
    debug('parcial', partial)
    const letters = parseHeardLetters(partial)
    if (letters.length > 0) handlers.onLettersHeard(letters, false)
  })
  recognizer.on('result', (message) => {
    if (!active || message.event !== 'result') return
    lastPartial = ''
    debug('final', message.result.text)
    handlers.onLettersHeard(parseHeardLetters(message.result.text), true)
  })
  recognizer.on('error', (message) => {
    if (message.event === 'error') debug('erro', message.error)
  })

  const source = context.createMediaStreamSource(stream)
  // ScriptProcessorNode é obsoleto, mas funciona em todos os navegadores e é o que o
  // vosk-browser documenta. A saída fica em silêncio; ligar ao destination é o que faz
  // o Chrome disparar onaudioprocess.
  const processor = context.createScriptProcessor(4096, 1, 1)
  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer
    try {
      if (handlers.isMuted?.()) recognizer.acceptWaveformFloat(new Float32Array(input.length), input.sampleRate)
      else recognizer.acceptWaveform(input)
    } catch (error) {
      debug('erro', String(error))
    }
  }
  source.connect(processor)
  processor.connect(context.destination)

  // Safari cria o AudioContext suspenso fora de um gesto do usuário.
  const resume = () => void context.resume()
  if (context.state === 'suspended') window.addEventListener('pointerdown', resume, { once: true })

  return () => {
    active = false
    window.removeEventListener('pointerdown', resume)
    processor.onaudioprocess = null
    processor.disconnect()
    source.disconnect()
    stream.getTracks().forEach((track) => track.stop())
    void context.close()
    recognizer.remove()
  }
}

export function startLetterRecognition(handlers: LetterRecognitionHandlers): () => void {
  if (!isLetterRecognitionSupported()) {
    handlers.onStatusChange('unsupported')
    return () => {}
  }

  let stopped = false
  let stopListening: (() => void) | null = null

  handlers.onStatusChange('loading')

  // Modelo e microfone em paralelo: o pedido de permissão aparece enquanto o modelo baixa.
  void Promise.allSettled([
    loadModel(),
    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    }),
  ]).then(([model, microphone]) => {
    const stream = microphone.status === 'fulfilled' ? microphone.value : null
    if (stopped || !stream || model.status === 'rejected') {
      stream?.getTracks().forEach((track) => track.stop())
      if (stopped) return
      if (microphone.status === 'rejected') handlers.onStatusChange(microphoneErrorStatus(microphone.reason))
      else handlers.onStatusChange('error')
      return
    }

    try {
      stopListening = listen(model.value, stream, handlers)
      handlers.onStatusChange('listening')
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop())
      debug('erro', String(error))
      handlers.onStatusChange('error')
    }
  })

  return () => {
    stopped = true
    stopListening?.()
    stopListening = null
  }
}
