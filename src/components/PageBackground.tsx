import { PaperPlaneIcon } from './icons'

export function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -left-24 top-16 h-[420px] w-[420px] rounded-[45%_55%_60%_40%/50%_40%_60%_50%] bg-brand-blue/10" />
      <div className="absolute left-[2%] top-[22%] h-[280px] w-[560px] rounded-[60%_40%_45%_55%/45%_60%_40%_55%] bg-brand-blue/10" />
      <div className="absolute -right-24 top-24 hidden h-[380px] w-[380px] rounded-[55%_45%_40%_60%/40%_50%_60%_50%] bg-brand-blue/10 lg:block" />
      <div className="absolute -bottom-16 left-0 h-[260px] w-[75%] rounded-[60%_40%_70%_30%/50%_60%_40%_50%] bg-brand-yellow/20" />
      <div className="absolute -bottom-24 -right-16 hidden h-[300px] w-[55%] rounded-[50%_50%_30%_70%/60%_40%_60%_40%] bg-brand-yellow/15 sm:block" />

      <div className="absolute left-3 top-28 flex select-none flex-col text-6xl font-black leading-[0.9] text-brand-blue/15 sm:text-7xl">
        <span className="-rotate-6">A</span>
        <span className="translate-x-6 rotate-3">B</span>
        <span className="translate-x-2 -rotate-3">C</span>
      </div>

      <div className="absolute right-16 top-24 hidden -rotate-12 text-brand-blue/30 xl:block">
        <PaperPlaneIcon className="h-10 w-10" strokeWidth="1.5" />
        <div className="mt-1 h-16 w-px border-l-2 border-dashed border-brand-blue/25" />
      </div>
    </div>
  )
}
