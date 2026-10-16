// Every animated value in the 3D scene. Chapters write targets; the controller damps toward them.
export const defaultParams = {
  introCard: 0, // 0 = small framed card, 1 = full-bleed studio
  drl: 0, // daytime running light strip
  lamps: 0, // head and tail lamps
  hoodHi: 0,
  filmVis: 0,
  filmLift: 1, // 1 = held above the hood, 0 = settled
  filmTilt: 1,
  sweep: 0, // squeegee light travelling across the film
  sweepVis: 0,
  ppfStack: 0, // educational layer stack
  spoilerVis: 0,
  spoilerSep: 1,
  spoilerHi: 0,
  roofBlack: 0,
  roofHi: 0,
  lampHi: 0,
  door: 0,
  cabinLight: 0,
  seatHi: 0,
  coverSep: 0,
  coverColor: 0, // swatch index (not damped)
  screenHi: 0,
  screenSep: 0,
  screenOn: 0,
  visorVis: 0,
  visorSep: 1,
  visorHi: 0,
  tintVis: 0,
  tintSep: 1,
  tint: 0,
  suvX: 0, // metres along the studio floor (not damped)
  pickupX: -9,
  canopyVis: 0,
  canopySep: 1,
  canopyHi: 0,
  hatch: 0,
}

export type Params = typeof defaultParams
export type ParamKey = keyof Params

// Values that teleport or are discrete: never interpolated by frame damping.
export const undamped: ParamKey[] = ['suvX', 'pickupX', 'coverColor']

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** smoothstep from a to b */
export const ramp = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}
/** rises a→b, falls c→d */
export const pulse = (t: number, a: number, b: number, c: number, d: number) => ramp(t, a, b) * (1 - ramp(t, c, d))
