import { useSyncExternalStore } from 'react'
import { defaultParams, type Params } from './params.ts'
import type { CamPose } from './timeline.ts'

export type Quality = 'high' | 'mobile' | 'low'
export type StageMode = 'loading' | 'ready' | 'fallback' | 'lost'

type UI = {
  chapter: number
  phase: number
  manual: Partial<Params> // overrides for the current chapter only
  mode: StageMode
  quality: Quality
  reduced: boolean
  enquiryService: string
  coverColor: number // seat cover example colour, kept across chapters
  project: string | null // open project dialog
}

function createStore<T extends object>(initial: T) {
  let state = initial
  const subs = new Set<() => void>()
  return {
    get: () => state,
    set(patch: Partial<T>) {
      state = { ...state, ...patch }
      subs.forEach((f) => f())
    },
    subscribe(f: () => void) {
      subs.add(f)
      return () => subs.delete(f)
    },
  }
}

const reducedQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null

export const ui = createStore<UI>({
  chapter: 0,
  phase: 0,
  manual: {},
  mode: 'loading',
  quality: 'high',
  reduced: !!reducedQuery?.matches,
  enquiryService: '',
  coverColor: 0,
  project: null,
})
reducedQuery?.addEventListener('change', (e) => ui.set({ reduced: e.matches }))

export function useUI<K>(select: (s: UI) => K): K {
  return useSyncExternalStore(ui.subscribe, () => select(ui.get()))
}

const pose = (): CamPose => ({ pos: [6, 1.2, 7], tgt: [0, 0.7, 0], fov: 30, inside: 0 })

// Per-frame state shared by the controller (writer) and the 3D scene (reader). Never triggers React renders.
export const tour = {
  p: 0,
  index: 0,
  t: 0,
  target: { ...defaultParams },
  cur: { ...defaultParams },
  cam: pose(), // damped camera pose after screen framing
  shift: [0, 0] as [number, number], // projection offset in NDC so the subject clears the text panel
  snap: true, // skip damping for one frame (first frame, chapter jumps)
  sweepPhase: 0,
}
