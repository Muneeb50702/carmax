// The one scroll controller: maps the pinned tour section's scroll position to tour progress,
// evaluates the timeline, damps toward it and publishes chapter changes. No other code reads scroll.
import { useEffect, type RefObject } from 'react'
import { chapters } from './chapters.ts'
import { undamped, type ParamKey } from './params.ts'
import { tour, ui } from './store.ts'
import { cameraAt, chapterP, locate, paramsAt, phaseAt, stillP, type CamPose } from './timeline.ts'

let section: HTMLElement | null = null
let stage: HTMLElement | null = null
const raw: CamPose = { pos: [0, 0, 0], tgt: [0, 0, 0], fov: 30, inside: 0 }
const framed: CamPose = { pos: [0, 0, 0], tgt: [0, 0, 0], fov: 30, inside: 0 }

export type Layout = 'side' | 'bottom' | 'short'
export function layoutFor(w: number, h: number): Layout {
  if (w / h < 0.95) return 'bottom'
  if (h < 520) return 'short'
  return 'side'
}

type Area = { top: number; bottom: number; left: number; right: number }
const area: Area = { top: 0, bottom: 0, left: 0, right: 0 }
const rect = (sel: string) => {
  const el = stage?.querySelector(sel)
  const r = el?.getBoundingClientRect()
  return r && r.width > 0 ? r : null
}

/** The part of the stage not covered by text: the subject is framed into it. */
function freeArea(w: number, h: number, introCard: number, out: Area) {
  const layout = layoutFor(w, h)
  const header = rect('.header')?.bottom ?? 60
  const panel = rect('.panel')
  if (layout === 'bottom') {
    out.top = rect('.chapter-bar')?.bottom ?? header
    out.bottom = panel ? panel.top : h * 0.6
    out.left = 0
    out.right = w
  } else {
    const rail = rect('.rail')
    out.top = header
    out.bottom = h
    out.left = panel ? panel.right : 0
    out.right = rail ? rail.left + 30 : w
  }
  if (introCard < 1) {
    // the opening card sits between the wordmark and the hero copy
    const word = rect('.intro-word')
    const hero = rect('.hero-copy')
    const k = introCard
    const cardTop = word ? word.bottom : header
    const cardBottom = hero ? hero.top : h
    out.top = cardTop + (out.top - cardTop) * k
    out.bottom = cardBottom + (out.bottom - cardBottom) * k
    out.left *= k
    out.right = w + (out.right - w) * k
  }
  if (out.bottom - out.top < h * 0.2) out.bottom = out.top + h * 0.2
}

/** Reframe a camera pose for the stage shape: portrait screens pull back and widen, and the subject is centred in the free area. */
function frame(src: CamPose, w: number, h: number, a: Area, introCard: number, out: CamPose) {
  const aspect = w / h
  const deficit = Math.min(Math.max(1.2 / aspect, 1), 2.8)
  const inside = src.inside
  // how much of the screen the subject actually gets
  const room = layoutFor(w, h) === 'bottom' ? Math.min(Math.max(Math.sqrt(0.7 / ((a.bottom - a.top) / h)), 1), 1.45) : Math.min(Math.max(Math.sqrt(0.62 / ((a.right - a.left) / w)), 1), 1.3)
  const fit = 1 + (room - 1) * introCard // the opening card is framed by the base pose
  const tanK = (1 + (deficit - 1) * (0.38 + 0.08 * inside)) * (1 + (fit - 1) * inside)
  const distK = (1 + (deficit - 1) * 0.28 * (1 - inside)) * (1 + (fit - 1) * (1 - inside))
  for (let k = 0; k < 3; k++) {
    out.tgt[k] = src.tgt[k]
    out.pos[k] = src.tgt[k] + (src.pos[k] - src.tgt[k]) * distK
  }
  const half = (src.fov * Math.PI) / 360
  out.fov = (Math.atan(Math.tan(half) * tanK) * 360) / Math.PI
  out.inside = inside
  tour.shift[0] = (a.left + a.right) / w - 1
  tour.shift[1] = 1 - (a.top + a.bottom) / h
}

function readProgress() {
  if (!section || !stage) return tour.p
  const range = section.offsetHeight - stage.offsetHeight
  if (range <= 0) return 0
  return Math.min(Math.max(-section.getBoundingClientRect().top / range, 0), 1)
}

// `?snap` disables damping so automated screenshots show the exact scroll state.
const testSnap = typeof location !== 'undefined' && new URLSearchParams(location.search).has('snap')
let lastNow = 0
const keys = Object.keys(tour.target) as ParamKey[]

function step(now: number) {
  const dt = Math.min((now - lastNow) / 1000 || 0.016, 0.1)
  lastNow = now
  const s = ui.get()
  const p = readProgress()
  tour.p = p
  const { index, t } = locate(p)
  const effT = s.reduced ? chapters[index].still : t
  tour.index = index
  tour.t = effT

  paramsAt(index, effT, tour.target)
  if (s.chapter === index) Object.assign(tour.target, s.manual)
  tour.target.coverColor = s.coverColor
  cameraAt(s.reduced ? stillP(index) : p, raw)
  const w = stage?.clientWidth || innerWidth
  const h = stage?.clientHeight || innerHeight
  const introK = s.reduced ? (index === 0 ? 0 : 1) : tour.cur.introCard
  freeArea(w, h, introK, area)
  frame(raw, w, h, area, introK, framed)

  const snap = tour.snap || s.reduced || testSnap
  tour.snap = false
  const kp = snap ? 1 : 1 - Math.exp(-dt * 6.5)
  const kc = snap ? 1 : 1 - Math.exp(-dt * 5)
  for (const k of keys) {
    tour.cur[k] = undamped.includes(k) ? tour.target[k] : tour.cur[k] + (tour.target[k] - tour.cur[k]) * kp
  }
  for (let k = 0; k < 3; k++) {
    tour.cam.pos[k] += (framed.pos[k] - tour.cam.pos[k]) * kc
    tour.cam.tgt[k] += (framed.tgt[k] - tour.cam.tgt[k]) * kc
  }
  tour.cam.fov += (framed.fov - tour.cam.fov) * kc
  tour.cam.inside = framed.inside
  tour.sweepPhase = p

  if (stage) {
    stage.style.setProperty('--intro', (s.reduced ? (index === 0 ? 0 : 1) : tour.cur.introCard).toFixed(4))
    stage.style.setProperty('--progress', p.toFixed(4))
    stage.style.setProperty('--chapter-t', t.toFixed(3))
    stage.classList.toggle('intro-done', s.reduced ? index > 0 : tour.cur.introCard > 0.4)
  }

  const phase = phaseAt(index, effT)
  if (index !== s.chapter) ui.set({ chapter: index, phase, manual: {} })
  else if (phase !== s.phase) ui.set({ phase })
}

let raf = 0
let running = false
function loop(now: number) {
  step(now)
  raf = running ? requestAnimationFrame(loop) : 0
}
function start() {
  if (running) return
  running = true
  tour.snap = true
  raf = requestAnimationFrame(loop)
}
function stop() {
  running = false
  cancelAnimationFrame(raf)
}

/** Scroll so a chapter is on screen. Far jumps are instant so the camera doesn't fly through the car. */
export function jumpToChapter(index: number, instant = false) {
  if (!section || !stage) return
  const c = chapters[index]
  const t = index === 0 ? 0 : index === chapters.length - 1 ? 0.7 : Math.min(c.cam[0].t + 0.03, 0.6)
  const range = section.offsetHeight - stage.offsetHeight
  const top = section.getBoundingClientRect().top + scrollY + chapterP(index, t) * range
  const far = instant || Math.abs(index - ui.get().chapter) > 1 || ui.get().reduced
  if (far) tour.snap = true
  scrollTo({ top: Math.ceil(top) + 1, behavior: far ? 'instant' : 'smooth' })
}

export function setManual(patch: Record<string, number>) {
  ui.set({ manual: { ...ui.get().manual, ...patch } })
}
export const resumeTour = () => ui.set({ manual: {} })

export function useTourController(sectionRef: RefObject<HTMLElement | null>, stageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    section = sectionRef.current
    stage = stageRef.current
    if (!section) return
    // Run only while the tour is on screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '200px 0px' })
    io.observe(section)

    // Keep the same tour position across orientation changes and width resizes.
    let lastW = innerWidth
    let held = -1
    const onResize = () => {
      if (innerWidth === lastW) return // mobile toolbar show/hide: section height uses lvh, nothing to fix
      lastW = innerWidth
      if (held < 0) held = tour.p
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (held > 0 && held < 1 && section && stage) {
          const range = section.offsetHeight - stage.offsetHeight
          scrollTo({ top: section.getBoundingClientRect().top + scrollY + held * range, behavior: 'instant' })
          tour.snap = true
        }
        held = -1
      }, 180)
    }
    let timer = 0
    addEventListener('resize', onResize)
    return () => {
      io.disconnect()
      removeEventListener('resize', onResize)
      stop()
    }
  }, [sectionRef, stageRef])
}
