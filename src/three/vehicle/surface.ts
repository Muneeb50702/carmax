// Parametric vehicle body. A body is a loft of cross-sections along x (forward), described by
// side-view curves (top silhouette, beltline), a plan-view superellipse and wheel arches.
// S(x, s, side) returns a point: s ∈ [0,1] walks one half-section from the bottom centre,
// out and up the side, over the greenhouse and back to the top centre. Panels are (x, s) rectangles.
import { BufferGeometry, Float32BufferAttribute } from 'three'

export type Profile = {
  xF: number
  xR: number
  W: number // max half width
  nF: number // plan superellipse exponents (higher = squarer corners)
  nR: number
  top: [number, number][]
  belt: [number, number][]
  sill: number
  botF: number
  botR: number
  wheelY: number
  wheels: number[] // wheel centre x positions
  archR: number
  tumble: number // greenhouse inset at full window height, fraction of half width
  crown: number
}

/** Monotone cubic (Fritsch–Carlson) through points sorted by x. No overshoot between keys. */
export function monotone(pts: [number, number][]) {
  const n = pts.length
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const d = xs.slice(0, -1).map((x, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - x))
  const m = xs.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2))
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const h = a * a + b * b
    if (h > 9) {
      const t = 3 / Math.sqrt(h)
      m[i] = t * a * d[i]
      m[i + 1] = t * b * d[i]
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (x > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i]
    const t = (x - xs[i]) / h
    const t2 = t * t
    const t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  }
}

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const sstep = (v: number) => {
  const x = c01(v)
  return x * x * (3 - 2 * x)
}
const smax = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.max(a, b) + (h * h * k) / 4
}

// Section bands (see header). Exported so panels can be described in terms of them.
export const S = { bottom: 0.1, corner: 0.16, side: 0.45, shoulder: 0.52, glass: 0.8, edge: 0.86 }

export type Body = ReturnType<typeof makeBody>

export function makeBody(P: Profile) {
  const top = monotone(P.top)
  const belt = monotone(P.belt)
  const xc = (P.xF + P.xR) / 2
  const L = (P.xF - P.xR) / 2
  const halfW = (x: number) => {
    const u = Math.min(Math.abs((x - xc) / L), 1)
    const n = x > xc ? P.nF : P.nR
    return P.W * Math.pow(Math.max(1 - Math.pow(u, n), 0), 1 / n)
  }
  const frontArch = P.wheels[0] + P.archR
  const rearArch = P.wheels[P.wheels.length - 1] - P.archR
  const bot = (x: number) => {
    let b = P.sill
    if (x > frontArch) b = P.sill + (P.botF - P.sill) * sstep((x - frontArch) / (P.xF - frontArch))
    if (x < rearArch) b = P.sill + (P.botR - P.sill) * sstep((rearArch - x) / (rearArch - P.xR))
    for (const wx of P.wheels) {
      const dx = x - wx
      if (Math.abs(dx) < P.archR + 0.05) {
        const a = Math.abs(dx) < P.archR ? P.wheelY + Math.sqrt(P.archR * P.archR - dx * dx) : P.wheelY
        b = smax(b, a, 0.05)
      }
    }
    return b
  }

  /** Writes the point at (x, s) on side ±1 into out[0..2]. */
  function point(x: number, s: number, side: number, out: number[]) {
    const w = halfW(x)
    const b = bot(x)
    const tp = top(x)
    const blt = belt(x)
    const rr = 0.045 + 0.03 * c01((tp - blt) / 0.3)
    const be = Math.min(blt, tp - rr)
    const upperH = Math.max(0, tp - rr - be)
    const zs = w * 0.965
    const zt = zs - P.tumble * w * sstep(upperH / 0.45)
    const rc = Math.min(0.08, Math.max(0.005, (be - 0.06 - b) * 0.5))
    let z: number
    let y: number
    if (s <= S.bottom) {
      const u = s / S.bottom
      z = u * w * 0.88
      y = b
    } else if (s <= S.corner) {
      const th = ((s - S.bottom) / (S.corner - S.bottom)) * (Math.PI / 2)
      z = w * 0.88 + w * 0.085 * Math.sin(th)
      y = b + rc - rc * Math.cos(th)
    } else if (s <= S.side) {
      const u = (s - S.corner) / (S.side - S.corner)
      // lower body tucks in; a shallow feature line runs along the doors
      const crease = Math.exp(-(((u - 0.6) / 0.07) ** 2))
      z = w * (0.955 + 0.045 * Math.sin((u * Math.PI) / 2) - 0.006 * crease)
      y = b + rc + (be - 0.06 - (b + rc)) * u
    } else if (s <= S.shoulder) {
      const th = ((s - S.side) / (S.shoulder - S.side)) * (Math.PI / 2)
      z = zs + w * 0.035 * Math.cos(th)
      y = be - 0.06 + 0.06 * Math.sin(th)
    } else if (s <= S.glass) {
      const u = (s - S.shoulder) / (S.glass - S.shoulder)
      z = zs + (zt - zs) * u + 0.012 * Math.sin(Math.PI * u) * c01(upperH / 0.3)
      y = be + (tp - rr - be) * u
    } else if (s <= S.edge) {
      const th = ((s - S.glass) / (S.edge - S.glass)) * (Math.PI / 2)
      z = zt - rr + rr * Math.cos(th)
      y = tp - rr + rr * Math.sin(th)
    } else {
      const u = (s - S.edge) / (1 - S.edge)
      const z0 = zt - rr
      z = z0 * (1 - u)
      y = tp + P.crown * w * (1 - (1 - u) * (1 - u))
    }
    out[0] = x
    out[1] = y
    out[2] = z * side
  }

  return { P, point, halfW, bot, top, belt }
}

// ---- grids ----

export type Grid = { xs: number[]; ss: number[] }

/** Stations cluster toward the nose and tail where the plan curves fastest. Panel edges are inserted exactly so panels share vertices. */
export function makeGrid(P: Profile, nx: number, ns: number, xCuts: number[], sCuts: number[]): Grid {
  const xc = (P.xF + P.xR) / 2
  const L = (P.xF - P.xR) / 2
  const xs = new Set<number>()
  for (let i = 0; i < nx; i++) xs.add(+(xc + L * Math.sin((Math.PI / 2) * (-1 + (2 * i) / (nx - 1)))).toFixed(5))
  xCuts.forEach((x) => xs.add(+x.toFixed(5)))
  // denser through rounded bands
  const bands: [number, number, number][] = [
    [0, S.bottom, 3],
    [S.bottom, S.corner, 5],
    [S.corner, S.side, 10],
    [S.side, S.shoulder, 7],
    [S.shoulder, S.glass, 10],
    [S.glass, S.edge, 7],
    [S.edge, 1, 9],
  ]
  const k = ns / 51
  const ss = new Set<number>()
  for (const [a, b, n] of bands) {
    const m = Math.max(2, Math.round(n * k))
    for (let i = 0; i <= m; i++) ss.add(+(a + ((b - a) * i) / m).toFixed(5))
  }
  sCuts.forEach((s) => ss.add(+s.toFixed(5)))
  return { xs: [...xs].sort((a, b) => a - b), ss: [...ss].sort((a, b) => a - b) }
}

export type Patch = {
  x: [number, number]
  s: [number, number]
  sides?: number[]
  offset?: number // along the outward normal
}

const pA = [0, 0, 0]
const pB = [0, 0, 0]
const pC = [0, 0, 0]
const pD = [0, 0, 0]

function normalAt(body: Body, x: number, s: number, side: number, out: number[]) {
  for (let e = 1e-4; e < 0.02; e *= 4) {
    body.point(x + e, s, side, pA)
    body.point(x - e, s, side, pB)
    body.point(x, Math.min(s + e, 1), side, pC)
    body.point(x, Math.max(s - e, 0), side, pD)
    const dx0 = pA[0] - pB[0], dx1 = pA[1] - pB[1], dx2 = pA[2] - pB[2]
    const ds0 = pC[0] - pD[0], ds1 = pC[1] - pD[1], ds2 = pC[2] - pD[2]
    // outward = dx × ds on the +z side
    let n0 = dx1 * ds2 - dx2 * ds1
    let n1 = dx2 * ds0 - dx0 * ds2
    let n2 = dx0 * ds1 - dx1 * ds0
    if (side < 0) (n0 = -n0), (n1 = -n1), (n2 = -n2)
    const len = Math.hypot(n0, n1, n2)
    if (len > 1e-12) {
      out[0] = n0 / len
      out[1] = n1 / len
      out[2] = n2 / len
      return
    }
  }
  out[0] = Math.sign(x || 1)
  out[1] = 0
  out[2] = 0
}

export function buildPatch(body: Body, grid: Grid, patch: Patch): BufferGeometry {
  const xi = grid.xs.filter((x) => x >= patch.x[0] - 1e-6 && x <= patch.x[1] + 1e-6)
  const si = grid.ss.filter((s) => s >= patch.s[0] - 1e-6 && s <= patch.s[1] + 1e-6)
  const sides = patch.sides ?? [1, -1]
  const pos: number[] = []
  const nor: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const p = [0, 0, 0]
  const n = [0, 0, 0]
  const off = patch.offset ?? 0
  for (const side of sides) {
    const base = pos.length / 3
    for (let i = 0; i < xi.length; i++) {
      for (let k = 0; k < si.length; k++) {
        body.point(xi[i], si[k], side, p)
        normalAt(body, xi[i], si[k], side, n)
        pos.push(p[0] + n[0] * off, p[1] + n[1] * off, p[2] + n[2] * off)
        nor.push(n[0], n[1], n[2])
        uv.push((xi[i] - patch.x[0]) / (patch.x[1] - patch.x[0] || 1), (si[k] - patch.s[0]) / (patch.s[1] - patch.s[0] || 1))
      }
    }
    const ns = si.length
    for (let i = 0; i < xi.length - 1; i++) {
      for (let k = 0; k < ns - 1; k++) {
        const a = base + i * ns + k
        const b = a + ns
        const c = a + 1
        const d = b + 1
        if (side > 0) idx.push(a, b, c, c, b, d)
        else idx.push(a, c, b, c, d, b)
      }
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeBoundingSphere()
  return g
}
