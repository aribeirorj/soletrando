import pencilsImg from '../assets/porta-lapis.png'
import { HeartIcon } from './icons'

export function DecorativeAside() {
  return (
    <div className="pointer-events-none hidden w-32 flex-col items-center gap-6 xl:flex">
      <HeartIcon className="h-5 w-5 text-brand-red" />
      <img src={pencilsImg} alt="" aria-hidden="true" className="w-28" />
    </div>
  )
}
