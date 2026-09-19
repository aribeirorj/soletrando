import { getLanguage } from '../language/current'

export function HeroIllustration() {
  const hero = getLanguage().hero
  if (!hero) return null

  return (
    <div className="relative hidden flex-col items-center justify-end px-4 lg:flex">
      <img
        src={hero.src}
        alt={hero.alt}
        className="w-full max-w-2xl object-contain drop-shadow-xl"
      />
    </div>
  )
}
