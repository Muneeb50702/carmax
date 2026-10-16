import type { Profile } from './surface'

// Compact SUV, roughly 4.45 m long: the class of the Sportage, Oshan X7 and Deepal S05 seen in the posts.
// x forward, y up, z to the right-hand (driver's) side: Pakistan is right-hand drive.
export const suvProfile: Profile = {
  xF: 2.225,
  xR: -2.225,
  W: 0.925,
  nF: 6,
  nR: 7,
  sill: 0.36,
  botF: 0.43,
  botR: 0.48,
  wheelY: 0.36,
  wheels: [1.36, -1.32],
  archR: 0.425,
  tumble: 0.2,
  crown: 0.035,
  top: [
    [-2.225, 1.04], [-2.19, 1.12], [-2.1, 1.2], [-2.0, 1.33], [-1.8, 1.5], [-1.55, 1.565], [-0.6, 1.618],
    [0.12, 1.61], [0.5, 1.39], [0.97, 1.05], [1.4, 0.995], [1.95, 0.945], [2.12, 0.895], [2.2, 0.83], [2.225, 0.77],
  ],
  belt: [[-2.225, 1.03], [-1.9, 1.125], [-1.2, 1.115], [0, 1.08], [0.9, 1.045], [1.5, 0.99], [2.225, 0.88]],
}

// Double-cab pickup, roughly 5.33 m long, for the Revo canopy chapter.
const pickupCab: [number, number][] = [
  [-1.03, 1.3], [-1.0, 1.7], [-0.96, 1.8], [-0.8, 1.83], [0.3, 1.84], [0.62, 1.78], [1.22, 1.17], [1.7, 1.12], [2.4, 1.07], [2.6, 1.0], [2.665, 0.92],
]
export const pickupProfile: Profile = {
  xF: 2.665,
  xR: -2.665,
  W: 0.925,
  nF: 6,
  nR: 10,
  sill: 0.42,
  botF: 0.52,
  botR: 0.62,
  wheelY: 0.385,
  wheels: [1.62, -1.465],
  archR: 0.45,
  tumble: 0.15,
  crown: 0.03,
  top: [[-2.665, 1.08], [-2.64, 1.12], [-1.06, 1.12], ...pickupCab],
  belt: [[-2.665, 1.1], [-1.1, 1.1], [-0.9, 1.15], [0.6, 1.13], [1.3, 1.1], [2.665, 1.0]],
}

// Same pickup with a canopy roof over the bed. Only its bed section is used, for the canopy shell.
export const canopyProfile: Profile = {
  ...pickupProfile,
  top: [[-2.665, 1.08], [-2.645, 1.3], [-2.6, 1.74], [-2.5, 1.79], [-1.1, 1.8], [-1.06, 1.8], ...pickupCab.slice(2)],
}
