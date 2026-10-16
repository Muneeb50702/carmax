import { ui, type Quality } from './tour/store'

const SIMPLE_KEY = 'carmax:simple-view'

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function detectQuality(): Quality {
  const cores = navigator.hardwareConcurrency || 4
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  if (cores <= 2 || mem <= 2) return 'low'
  if (matchMedia('(pointer: coarse)').matches || innerWidth < 900) return 'mobile'
  return 'high'
}

function readSimplePref() {
  try {
    return localStorage.getItem(SIMPLE_KEY) === '1'
  } catch {
    return false
  }
}

/** Remember the visitor's choice of the simple (no 3D) tour. */
export function setSimpleView(on: boolean) {
  try {
    if (on) localStorage.setItem(SIMPLE_KEY, '1')
    else localStorage.removeItem(SIMPLE_KEY)
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
  }
  ui.set({ mode: on ? 'fallback' : 'loading' })
}

/** Runs before the first render. `?simple` and `?quality=low|mobile|high` exist for testing. */
export function initEnvironment() {
  const q = new URLSearchParams(location.search)
  const forced = q.get('quality') as Quality | null
  ui.set({
    quality: forced && ['high', 'mobile', 'low'].includes(forced) ? forced : detectQuality(),
    mode: !webglAvailable() || readSimplePref() || q.has('simple') ? 'fallback' : 'loading',
  })
}
