// Pure functions of tour progress p ∈ [0, 1]. Scrolling backward replays them in reverse,
// and a paused scroll always resolves to the same stable state.
import { chapters, type V3 } from './chapters.ts'
import { defaultParams, type Params } from './params.ts'

const weights = chapters.map((c) => c.weight)
const total = weights.reduce((a, b) => a + b, 0)
/** normalised start of each chapter, plus a trailing 1 */
export const starts = weights.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w / total], [0])

export const totalWeight = total

export function locate(p: number) {
  const q = Math.min(Math.max(p, 0), 1)
  let i = 0
  while (i < chapters.length - 1 && q >= starts[i + 1]) i++
  return { index: i, t: (q - starts[i]) / (starts[i + 1] - starts[i]) }
}

export const chapterP = (index: number, t: number) => starts[index] + t * (starts[index + 1] - starts[index])

export function paramsAt(index: number, t: number, out: Params = { ...defaultParams }): Params {
  Object.assign(out, defaultParams)
  for (let j = 0; j < index; j++) chapters[j].apply(1, out)
  chapters[index].apply(t, out)
  return out
}

export function phaseAt(index: number, t: number) {
  const ph = chapters[index].phases
  let k = 0
  while (k < ph.length - 1 && t >= ph[k + 1][0]) k++
  return k
}

// ---- camera path ----
type GKey = { p: number; pos: V3; tgt: V3; fov: number; inside: boolean }
export const camKeys: GKey[] = chapters.flatMap((c, i) =>
  c.cam.map((k) => ({ p: chapterP(i, k.t), pos: k.pos, tgt: k.tgt, fov: k.fov ?? 32, inside: !!c.inside })),
)

const smooth = (x: number) => x * x * (3 - 2 * x)

function tangent(a: V3 | undefined, b: V3, c: V3 | undefined, out: number[]) {
  const prev = a ?? b
  const next = c ?? b
  let len = 0
  for (let k = 0; k < 3; k++) {
    out[k] = (next[k] - prev[k]) / 2
    len += out[k] * out[k]
  }
  // Limit the tangent to the shorter neighbouring chord so short "hold" segments don't bulge.
  const chord = (u: V3) => Math.hypot(u[0] - b[0], u[1] - b[1], u[2] - b[2])
  const lim = Math.min(a ? chord(a) : Infinity, c ? chord(c) : Infinity)
  len = Math.sqrt(len)
  if (len > lim && len > 0) for (let k = 0; k < 3; k++) out[k] *= lim / len
}

const m0 = [0, 0, 0]
const m1 = [0, 0, 0]
function hermite(keys: V3[], i: number, u: number, out: V3) {
  const b = keys[i]
  const c = keys[i + 1]
  tangent(keys[i - 1], b, c, m0)
  tangent(b, c, keys[i + 2], m1)
  const u2 = u * u
  const u3 = u2 * u
  const h00 = 2 * u3 - 3 * u2 + 1
  const h10 = u3 - 2 * u2 + u
  const h01 = -2 * u3 + 3 * u2
  const h11 = u3 - u2
  for (let k = 0; k < 3; k++) out[k] = h00 * b[k] + h10 * m0[k] + h01 * c[k] + h11 * m1[k]
}

const posList = camKeys.map((k) => k.pos)
const tgtList = camKeys.map((k) => k.tgt)

export type CamPose = { pos: V3; tgt: V3; fov: number; inside: number }

export function cameraAt(p: number, out: CamPose): CamPose {
  const n = camKeys.length
  if (p <= camKeys[0].p) return copyKey(camKeys[0], out)
  if (p >= camKeys[n - 1].p) return copyKey(camKeys[n - 1], out)
  let i = 0
  while (i < n - 2 && p >= camKeys[i + 1].p) i++
  const a = camKeys[i]
  const b = camKeys[i + 1]
  const u = smooth((p - a.p) / (b.p - a.p))
  hermite(posList, i, u, out.pos)
  hermite(tgtList, i, u, out.tgt)
  out.fov = a.fov + (b.fov - a.fov) * u
  out.inside = (a.inside ? 1 - u : 0) + (b.inside ? u : 0)
  return out
}

function copyKey(k: GKey, out: CamPose) {
  out.pos = [...k.pos]
  out.tgt = [...k.tgt]
  out.fov = k.fov
  out.inside = k.inside ? 1 : 0
  return out
}

/** Pose shown for a chapter when motion is reduced. */
export const stillP = (index: number) => chapterP(index, chapters[index].still)
