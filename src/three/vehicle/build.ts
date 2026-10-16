import {
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Path,
  Shape,
  Vector2,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Group, Mat, Panel } from './layout'
import { buildPatch, makeBody, makeGrid, type Body, type Grid, type Patch, type Profile } from './surface'

export type Built = {
  body: Body
  grid: Grid
  /** merged geometry per group → material */
  parts: Record<string, Partial<Record<Mat, BufferGeometry>>>
  /** inner shell per group (dark cabin side of every opaque panel) */
  inner: Record<string, BufferGeometry>
}

const opaque: Mat[] = ['paint', 'roof', 'black', 'plastic', 'chrome']

export function buildVehicle(profile: Profile, panels: Panel[], detail: number): Built {
  const body = makeBody(profile)
  const xCuts = panels.flatMap((p) => p.x)
  const sCuts = panels.flatMap((p) => p.s)
  const grid = makeGrid(profile, Math.round(150 * detail), Math.round(60 * detail), xCuts, sCuts)
  const byKey = new Map<string, BufferGeometry[]>()
  const innerBy = new Map<string, BufferGeometry[]>()
  for (const p of panels) {
    const geo = buildPatch(body, grid, p)
    const key = `${p.group}|${p.mat}`
    byKey.set(key, [...(byKey.get(key) ?? []), geo])
    if (opaque.includes(p.mat) && !p.offset) innerBy.set(p.group, [...(innerBy.get(p.group) ?? []), geo])
  }
  const parts: Built['parts'] = {}
  for (const [key, list] of byKey) {
    const [group, mat] = key.split('|') as [Group, Mat]
    ;(parts[group] ??= {})[mat] = list.length === 1 ? list[0] : mergeGeometries(list)!
  }
  const inner: Built['inner'] = {}
  for (const [group, list] of innerBy) inner[group] = list.length === 1 ? list[0] : mergeGeometries(list)!
  return { body, grid, parts, inner }
}

/** Extra patches on an already built body (film, visors, tint). Edges are added to a copy of the grid. */
export function extraPatches(b: Built, patches: Patch[]) {
  const xs = [...new Set([...b.grid.xs, ...patches.flatMap((p) => p.x)])].sort((a, c) => a - c)
  const ss = [...new Set([...b.grid.ss, ...patches.flatMap((p) => p.s)])].sort((a, c) => a - c)
  const list = patches.map((p) => buildPatch(b.body, { xs, ss }, p))
  return list.length === 1 ? list[0] : mergeGeometries(list)!
}

// ---- wheels ----
export function wheelGeometries(r: number, width: number, rimR: number, segs: number) {
  const h = width / 2
  const prof = [
    [rimR - 0.004, -h * 0.82],
    [rimR + 0.012, -h * 0.96],
    [r - 0.05, -h],
    [r - 0.012, -h * 0.9],
    [r, -h * 0.55],
    [r, h * 0.55],
    [r - 0.012, h * 0.9],
    [r - 0.05, h],
    [rimR + 0.012, h * 0.96],
    [rimR - 0.004, h * 0.82],
  ].map(([a, b]) => new Vector2(a, b))
  const tire = new LatheGeometry(prof, segs)
  tire.rotateX(Math.PI / 2) // axis → z

  // Five twin-spoke alloy face: a disc with ten windows.
  const face = new Shape()
  face.absarc(0, 0, rimR, 0, Math.PI * 2, false)
  const ri = rimR * 0.36
  const ro = rimR * 0.86
  const n = 10
  for (let i = 0; i < n; i++) {
    // narrow gap between twin spokes on odd windows, wide spoke on even ones
    const a0 = (i / n) * Math.PI * 2 + (i % 2 ? 0.06 : 0.2)
    const a1 = ((i + 1) / n) * Math.PI * 2 - (i % 2 ? 0.2 : 0.06)
    const hole = new Path()
    hole.absarc(0, 0, ri + 0.012 * (i % 2), a0 + 0.06, a1 - 0.06, false)
    hole.absarc(0, 0, ro, a1, a0, true)
    hole.closePath()
    face.holes.push(hole)
  }
  const rim = new ExtrudeGeometry(face, { depth: 0.022, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.008, bevelSegments: 2, curveSegments: segs })
  rim.translate(0, 0, h * 0.62)
  const barrel = new CylinderGeometry(rimR * 0.98, rimR * 0.98, width * 0.82, segs, 1, true)
  barrel.rotateX(Math.PI / 2)
  const hub = new CylinderGeometry(rimR * 0.2, rimR * 0.24, 0.03, 24)
  hub.rotateX(Math.PI / 2)
  hub.translate(0, 0, h * 0.68)
  const disc = new CylinderGeometry(rimR * 0.78, rimR * 0.78, 0.026, segs)
  disc.rotateX(Math.PI / 2)
  disc.translate(0, 0, h * 0.1)
  const caliper = new CylinderGeometry(rimR * 0.8, rimR * 0.8, 0.07, 12, 1, false, -0.55, 1.1)
  caliper.rotateX(Math.PI / 2)
  caliper.translate(0, 0, h * 0.1)
  return { tire, rim, barrel, hub, disc, caliper }
}

/** Roof spoiler: an extruded aerofoil across the top of the tailgate. */
export function spoilerGeometry(width: number) {
  const s = new Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(-0.08, 0.035, -0.22, 0.03, -0.32, -0.025)
  s.lineTo(-0.3, -0.045)
  s.bezierCurveTo(-0.2, -0.02, -0.08, -0.02, 0, -0.03)
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: width, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, curveSegments: 16 })
  g.translate(0, 0, -width / 2)
  return g
}
