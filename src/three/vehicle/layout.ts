// Panel maps: which (x, s) rectangles of the body surface are paint, glass, trim or lamps,
// and which move together (doors, hood, roof, canopy hatch).
import type { Patch } from './surface'

export type Mat = 'paint' | 'roof' | 'black' | 'plastic' | 'under' | 'chrome' | 'glass' | 'lamp' | 'drl' | 'mainLamp' | 'tail' | 'grille'
export type Group = 'body' | 'door' | 'hood' | 'roof' | 'canopy' | 'hatch'
export type Panel = Patch & { mat: Mat; group: Group }

const g = 0.005 // shut-line gap along x
const gs = 0.004 // shut-line gap along s

type Doors = { front: [number, number]; rear: [number, number] }

/** Framed doors for one side. The +z front door is its own group so it can swing open. */
function doors(side: number, d: Doors, out: Panel[]) {
  const sides = [side]
  const dg: Group = side > 0 ? 'door' : 'body'
  const [f0, f1] = d.front
  const [r0, r1] = d.rear
  out.push(
    { x: [f0 + g, f1 - g], s: [0.205, 0.52], sides, mat: 'paint', group: dg },
    { x: [f0 + g, f1 - g], s: [0.52, 0.532], sides, mat: 'chrome', group: dg },
    { x: [f0 + 0.03, f1 - g], s: [0.532, 0.772], sides, mat: 'glass', group: dg },
    { x: [f0 + g, f0 + 0.03], s: [0.532, 0.8], sides, mat: 'black', group: dg },
    { x: [f0 + 0.03, f1 - g], s: [0.772, 0.8], sides, mat: 'black', group: dg },
    { x: [r0 + g, r1 - g], s: [0.205, 0.52], sides, mat: 'paint', group: 'body' },
    { x: [r0 + g, r1 - g], s: [0.52, 0.532], sides, mat: 'chrome', group: 'body' },
    { x: [r1 - 0.09, r1 - g], s: [0.532, 0.8], sides, mat: 'black', group: 'body' },
    { x: [r0 + 0.025, r1 - 0.09], s: [0.532, 0.772], sides, mat: 'glass', group: 'body' },
    { x: [r0 + g, r0 + 0.025], s: [0.532, 0.8], sides, mat: 'black', group: 'body' },
    { x: [r0 + 0.025, r1 - 0.09], s: [0.772, 0.8], sides, mat: 'black', group: 'body' },
  )
}

function front(xF: number, d: Doors, cowl: number, roofF: number, hoodR: number, hoodF: number, fascia: number, side: number, out: Panel[]) {
  const sides = [side]
  out.push(
    { x: [d.front[1] + g, fascia], s: [0.2, 0.505], sides, mat: 'paint', group: 'body' },
    { x: [fascia, xF], s: [0.2, 0.505], sides, mat: 'paint', group: 'body' },
    { x: [cowl - 0.02, hoodR - g], s: [0.505, 1], sides, mat: 'black', group: 'body' },
    { x: [hoodF + g, xF], s: [0.505, 1], sides, mat: 'paint', group: 'body' },
    { x: [roofF, cowl - 0.02], s: [0.8, 0.86], sides, mat: 'black', group: 'body' },
    { x: [roofF, cowl - 0.02], s: [0.86, 1], sides, mat: 'glass', group: 'body' },
  )
}

export const suvDoors: Doors = { front: [-0.05, 0.92], rear: [-0.98, -0.06] }

export function suvPanels(xF: number, xR: number): Panel[] {
  const out: Panel[] = [
    { x: [xR, xF], s: [0, 0.1], mat: 'under', group: 'body' },
    { x: [xR, xF], s: [0.1, 0.2], mat: 'plastic', group: 'body' },
    { x: [0.975 + g, 2.11 - g], s: [0.505 + gs, 1], mat: 'paint', group: 'hood' },
    { x: [-1.62, 0.15], s: [0.8, 1], mat: 'roof', group: 'roof' },
  ]
  const q0 = -1.58
  const q1 = -1.08
  const rg0 = -2.03
  const rg1 = -1.66
  for (const side of [1, -1]) {
    const sides = [side]
    doors(side, suvDoors, out)
    front(xF, suvDoors, 0.95, 0.15, 0.975, 2.11, 1.98, side, out)
    out.push(
      // rear quarter, C-pillar, quarter glass, D-pillar, tailgate and rear glass
      { x: [xR, suvDoors.rear[0] - g], s: [0.2, 0.52], sides, mat: 'paint', group: 'body' },
      { x: [q1, suvDoors.rear[0] - g], s: [0.52, 0.8], sides, mat: 'black', group: 'body' },
      { x: [q0, q1], s: [0.52, 0.532], sides, mat: 'chrome', group: 'body' },
      { x: [q0, q1], s: [0.532, 0.772], sides, mat: 'glass', group: 'body' },
      { x: [q0, q1], s: [0.772, 0.8], sides, mat: 'black', group: 'body' },
      { x: [q0 - 0.04, q0], s: [0.52, 0.8], sides, mat: 'black', group: 'body' },
      { x: [xR, rg0], s: [0.52, 1], sides, mat: 'paint', group: 'body' },
      { x: [rg0, rg1], s: [0.52, 0.88], sides, mat: 'paint', group: 'body' },
      { x: [rg0, rg1], s: [0.88, 1], sides, mat: 'glass', group: 'body' },
      { x: [rg1, q0 - 0.04], s: [0.52, 0.8], sides, mat: 'paint', group: 'body' },
      { x: [rg1, -1.62], s: [0.8, 1], sides, mat: 'paint', group: 'body' },
      // lamps and grille sit just proud of the body
      { x: [1.97, 2.212], s: [0.385, 0.478], sides, mat: 'lamp', group: 'body', offset: 0.004 },
      { x: [1.985, 2.208], s: [0.455, 0.466], sides, mat: 'drl', group: 'body', offset: 0.007 },
      { x: [2.03, 2.17], s: [0.4, 0.44], sides, mat: 'mainLamp', group: 'body', offset: 0.006 },
      { x: [2.165, xF], s: [0.22, 0.365], sides, mat: 'grille', group: 'body', offset: 0.006 },
      { x: [-2.215, -1.95], s: [0.43, 0.505], sides, mat: 'tail', group: 'body', offset: 0.004 },
      { x: [xR, -2.12], s: [0.476, 0.49], sides, mat: 'tail', group: 'body', offset: 0.006 },
    )
  }
  return out
}

export const pickupDoors: Doors = { front: [0.0, 1.18], rear: [-0.93, -0.01] }
export const bedRange: [number, number] = [-2.64, -1.06]

export function pickupPanels(xF: number, xR: number): Panel[] {
  const out: Panel[] = [
    { x: [xR, xF], s: [0, 0.1], mat: 'under', group: 'body' },
    { x: [xR, xF], s: [0.1, 0.2], mat: 'plastic', group: 'body' },
    { x: [1.25 + g, 2.52 - g], s: [0.505 + gs, 1], mat: 'paint', group: 'hood' },
    { x: [-0.96, 0.64], s: [0.8, 1], mat: 'paint', group: 'roof' },
    { x: [xR, -2.64], s: [0.505, 1], mat: 'paint', group: 'body' }, // tailgate top cap
  ]
  for (const side of [1, -1]) {
    const sides = [side]
    doors(side, pickupDoors, out)
    front(xF, pickupDoors, 1.22, 0.64, 1.25, 2.52, 2.42, side, out)
    out.push(
      { x: [xR, -2.645], s: [0.2, 0.505], sides, mat: 'paint', group: 'body' }, // tailgate
      { x: [-2.64, -1.045], s: [0.2, 0.52], sides, mat: 'paint', group: 'body' }, // bed side
      { x: [-1.035, pickupDoors.rear[0] - g], s: [0.2, 0.52], sides, mat: 'paint', group: 'body' },
      { x: [-1.035, pickupDoors.rear[0] - g], s: [0.52, 0.8], sides, mat: 'black', group: 'body' },
      // cab back wall with its window
      { x: [-1.06, -1.03], s: [0.8, 1], sides, mat: 'paint', group: 'body' },
      { x: [-1.03, -0.975], s: [0.8, 0.88], sides, mat: 'paint', group: 'body' },
      { x: [-1.03, -0.975], s: [0.88, 1], sides, mat: 'glass', group: 'body' },
      { x: [-0.975, -0.96], s: [0.8, 1], sides, mat: 'paint', group: 'body' },
      { x: [2.41, 2.655], s: [0.4, 0.49], sides, mat: 'lamp', group: 'body', offset: 0.004 },
      { x: [2.43, 2.65], s: [0.468, 0.478], sides, mat: 'drl', group: 'body', offset: 0.007 },
      { x: [2.46, 2.6], s: [0.415, 0.45], sides, mat: 'mainLamp', group: 'body', offset: 0.006 },
      { x: [2.58, xF], s: [0.21, 0.39], sides, mat: 'grille', group: 'body', offset: 0.006 },
      { x: [-2.662, -2.6], s: [0.3, 0.5], sides, mat: 'tail', group: 'body', offset: 0.004 },
    )
  }
  return out
}

export function canopyPanels(): Panel[] {
  return [
    { x: [-2.56, -1.08], s: [0.52, 1], mat: 'paint', group: 'canopy' },
    { x: [-2.645, -2.56], s: [0.52, 0.86], mat: 'paint', group: 'canopy' },
    { x: [-2.45, -1.2], s: [0.57, 0.77], mat: 'glass', group: 'canopy', offset: 0.003 },
    { x: [-2.645, -2.56], s: [0.86, 1], mat: 'black', group: 'hatch' },
    { x: [-2.64, -2.605], s: [0.9, 1], mat: 'glass', group: 'hatch', offset: 0.003 },
  ]
}
