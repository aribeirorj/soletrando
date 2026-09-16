import type { SVGProps } from 'react'

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 7c-1.5-1.3-3.5-2-6-2H3v13h3c2.5 0 4.5.7 6 2 1.5-1.3 3.5-2 6-2h3V5h-3c-2.5 0-4.5.7-6 2Z" />
      <path d="M12 7v13" />
    </Icon>
  )
}

export function LightbulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
    </Icon>
  )
}

export function SpeakerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 9v6h4l5 5V4L8 9H4Z" />
      <path d="M16 8a5 5 0 0 1 0 8" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </Icon>
  )
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5" />
    </Icon>
  )
}

export function XCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.5 9.5 5 5" />
      <path d="m14.5 9.5-5 5" />
    </Icon>
  )
}

export function MicrophoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
      <path d="M8 22h8" />
    </Icon>
  )
}

export function TrophyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H6a2 2 0 0 0 0 4h1" />
      <path d="M16 5h2a2 2 0 0 1 0 4h-1" />
      <path d="M12 11v3" />
      <path d="M10 17h4v3h-4z" />
      <path d="M9 20h6" />
    </Icon>
  )
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </Icon>
  )
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 21c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <path d="M16 8.5a3 3 0 1 0 0-6" />
      <path d="M15 15.5c3 0 6.5 1.7 6.5 5.5" />
    </Icon>
  )
}

export function GamepadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="2" y="7" width="20" height="10" rx="4" />
      <path d="M7 10v4" />
      <path d="M5 12h4" />
      <circle cx="16" cy="10.5" r="1" />
      <circle cx="18.5" cy="13" r="1" />
    </Icon>
  )
}

export function ShuffleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 6h4l10 12h4" />
      <path d="M17 4l4 2-4 2" />
      <path d="M3 18h4l3-4" />
      <path d="M14 8l3-4" />
      <path d="M17 20l4-2-4-2" />
    </Icon>
  )
}

export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="4" y="12" width="4" height="8" />
      <rect x="10" y="7" width="4" height="13" />
      <rect x="16" y="3" width="4" height="17" />
    </Icon>
  )
}

export function SproutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 22v-7" />
      <path d="M12 15c-4 0-7-3-7-7 4 0 7 3 7 7Z" />
      <path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7Z" />
    </Icon>
  )
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 2l2.9 6.3 6.9.8-5 4.8 1.3 6.9L12 17.9 5.9 20.8l1.3-6.9-5-4.8 6.9-.8Z" />
    </Icon>
  )
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 5v14l11-7Z" />
    </svg>
  )
}

export function PaperPlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </Icon>
  )
}
