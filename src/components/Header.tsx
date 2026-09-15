import schoolCrest from '../assets/logo-branca.png'

export function Header() {
  return (
    <header className="relative overflow-hidden bg-brand-blueDark text-white">
      <div className="mx-auto flex h-20 max-w-[1800px] items-center gap-3 px-4 sm:h-24">
        <img
          src={schoolCrest}
          alt=""
          aria-hidden="true"
          className="h-12 w-auto shrink-0 object-contain sm:h-14"
        />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight sm:text-2xl">
            Escola Municipal Clério Boechat
          </h1>
          <p className="truncate text-xs text-white/80 sm:text-sm">
            Educação hoje, um futuro melhor amanhã!
          </p>
        </div>
      </div>
      <svg
        className="block h-3 w-full text-brand-red"
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0 Q 100 12 200 4 T 400 2 V12 H0 Z" fill="currentColor" />
      </svg>
    </header>
  )
}
