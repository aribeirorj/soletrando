import heroImg from '../assets/hero-abelha.png'

export function HeroIllustration() {
  return (
    <div className="relative hidden flex-col items-center justify-end px-4 lg:flex">
      <img
        src={heroImg}
        alt="Abelha de óculos escuros com microfone, blocos ABC e o logo Spelling Bee"
        className="w-full max-w-2xl object-contain drop-shadow-xl"
      />
    </div>
  )
}
