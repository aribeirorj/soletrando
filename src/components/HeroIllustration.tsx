import studentsImg from '../assets/estudantes.png'
import booksImg from '../assets/livros.png'

export function HeroIllustration() {
  return (
    <div className="relative flex flex-col items-center justify-end px-4">
      <img
        src={studentsImg}
        alt="Dois estudantes do colégio usando laptop e tablet"
        className="w-full max-w-2xl object-contain drop-shadow-xl"
      />
      <img
        src={booksImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 left-0 hidden w-24 sm:block sm:w-32"
      />
    </div>
  )
}
