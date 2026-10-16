// Concept line illustrations. They stand in for client photos and are always labelled as illustrations.
import type { ReactNode } from 'react'

export type IllustrationKind = 'ppf' | 'seat' | 'screen' | 'styling' | 'visor' | 'canopy' | 'accessory'

const paths: Record<IllustrationKind, ReactNode> = {
  ppf: (
    <>
      <path d="M20 118 C60 96 150 88 220 96 L232 120 L20 132 Z" className="il-body" />
      <path d="M44 86 C90 70 160 66 214 76 L226 98 C150 90 80 96 40 110 Z" className="il-accent" />
      <path d="M40 110 C80 96 150 90 226 98" className="il-line" />
      <path d="M150 64 l10 -16 M176 66 l8 -16 M124 66 l12 -14" className="il-faint" />
    </>
  ),
  seat: (
    <>
      <path d="M92 40 h44 a10 10 0 0 1 10 10 l-6 62 h-58 l-4 -62 a10 10 0 0 1 10 -10 Z" className="il-body" />
      <path d="M80 112 h86 a10 10 0 0 1 10 10 v8 h-108 v-8 a10 10 0 0 1 12 -10 Z" className="il-body" />
      <path d="M100 24 h28 a6 6 0 0 1 6 6 v6 h-40 v-6 a6 6 0 0 1 6 -6 Z" className="il-accent" />
      <path d="M96 56 l36 28 M132 56 l-36 28 M96 84 l36 22 M132 84 l-36 22" className="il-faint" />
    </>
  ),
  screen: (
    <>
      <path d="M20 120 C60 92 196 92 236 120 L236 140 L20 140 Z" className="il-body" />
      <rect x="84" y="62" width="88" height="54" rx="8" className="il-accent" />
      <rect x="94" y="72" width="68" height="34" rx="4" className="il-line" />
      <path d="M128 116 v14" className="il-faint" />
    </>
  ),
  styling: (
    <>
      <path d="M18 110 C30 84 70 60 120 58 h60 c22 0 40 20 52 40 l6 14 v14 H18 Z" className="il-body" />
      <path d="M112 50 h72 l10 -10" className="il-accent" />
      <path d="M120 58 h60" className="il-accent" />
      <circle cx="226" cy="108" r="7" className="il-accent" />
      <circle cx="64" cy="128" r="14" className="il-line" />
      <circle cx="190" cy="128" r="14" className="il-line" />
    </>
  ),
  visor: (
    <>
      <path d="M40 120 V70 C40 54 52 44 70 44 H196 C210 44 218 54 218 66 V120 Z" className="il-body" />
      <path d="M58 104 V74 c0 -10 6 -16 16 -16 h52 v46 Z M140 58 h50 c8 0 12 6 12 12 v34 h-62 Z" className="il-line" />
      <path d="M58 50 C60 40 70 36 82 36 H200 c10 0 16 6 16 14" className="il-accent" />
      <path d="M140 64 h56 v36 h-56 Z" className="il-faint" />
    </>
  ),
  canopy: (
    <>
      <path d="M14 112 C24 92 44 80 70 78 l18 -22 h40 l8 22 H240 v40 H14 Z" className="il-body" />
      <path d="M136 52 H232 a6 6 0 0 1 6 6 V78 H136 Z" className="il-accent" />
      <path d="M232 52 l16 -22" className="il-line" />
      <circle cx="60" cy="122" r="15" className="il-line" />
      <circle cx="196" cy="122" r="15" className="il-line" />
    </>
  ),
  accessory: (
    <>
      <path d="M100 60 h56 l-6 70 h-44 Z" className="il-body" />
      <path d="M96 52 h64 a6 6 0 0 1 0 12 h-64 a6 6 0 0 1 0 -12 Z" className="il-accent" />
      <path d="M118 80 h20" className="il-faint" />
    </>
  ),
}

export function Illustration({ kind, title }: { kind: IllustrationKind; title?: string }) {
  return (
    <svg className="illustration" viewBox="0 0 256 160" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {paths[kind]}
    </svg>
  )
}
