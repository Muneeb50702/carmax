import { pulse, ramp, type ParamKey, type Params } from './params.ts'

export type V3 = [number, number, number]
export type CamKey = { t: number; pos: V3; tgt: V3; fov?: number }

export type Control =
  | { kind: 'state'; label: string; set: Partial<Params> }
  | { kind: 'toggle'; label: string; key: ParamKey }
  | { kind: 'range'; label: string; key: ParamKey; max: number; hint: string }
  | { kind: 'swatch'; label: string; key: ParamKey; options: { name: string; color: string }[] }

export type Label = {
  anchor: string // name of an Object3D registered by the scene
  text: string
  show: [number, number, number, number] // pulse window in chapter time
  dir: [number, number] // screen-space offset direction for the label
  key?: ParamKey // when set, label also shows while this param is manually raised
  mobile?: boolean // keep on narrow screens
}

export type Chapter = {
  id: string
  nav: string
  title: string
  body: string
  note?: string
  service?: string // services.ts id for "Ask about this"
  weight: number // scroll length in viewport heights
  inside?: boolean // camera is in the cabin: widen FOV instead of pulling back on portrait screens
  still: number // chapter time shown when motion is reduced
  cam: CamKey[]
  apply: (t: number, P: Params) => void
  phases: [number, string][]
  controls: Control[]
  labels: Label[]
}

export const seatColours = [
  { name: 'Graphite', color: '#34363b' },
  { name: 'Tan', color: '#9a6a47' },
  { name: 'Oxblood', color: '#5a2328' },
  { name: 'Stone', color: '#b9b2a6' },
]

export const chapters: Chapter[] = [
  {
    id: 'intro',
    nav: 'Studio',
    title: 'Walk around the car',
    body: 'Each stop shows where an upgrade goes on a vehicle and how it fits. The studio, film layers and parts are illustrations, not the shop or its products.',
    weight: 1.5,
    still: 0,
    cam: [
      { t: 0, pos: [6.6, 1.25, 7.6], tgt: [0, 0.72, 0], fov: 28 },
      { t: 0.6, pos: [5.5, 1.1, 5.7], tgt: [0, 0.7, 0], fov: 29 },
      { t: 1, pos: [4.9, 1.2, 4.8], tgt: [0.15, 0.72, 0], fov: 30 },
    ],
    apply: (t, P) => {
      P.introCard = ramp(t, 0.04, 0.62)
      P.drl = ramp(t, 0.25, 0.5)
    },
    phases: [[0, 'Studio lights warming up'], [0.45, 'Exterior walk-around']],
    controls: [],
    labels: [],
  },
  {
    id: 'ppf',
    nav: 'Paint protection film',
    title: 'Paint protection film',
    body: 'A clear film is lifted into position, aligned with the hood and pressed onto the paint. CAR MAX announced its PPF service and regularly posts PPF installations.',
    note: 'Illustrative layers, not to scale. Ask the shop about film options, coverage, finish and care.',
    service: 'ppf',
    weight: 2.2,
    still: 0.74,
    cam: [
      { t: 0.24, pos: [3.7, 2.2, 2.3], tgt: [1.45, 0.92, 0.15], fov: 34 },
      { t: 0.62, pos: [3.45, 2.35, 1.75], tgt: [1.5, 0.95, 0.25], fov: 34 },
      { t: 0.92, pos: [3.35, 2.15, 2.35], tgt: [1.5, 0.92, 0.2], fov: 34 },
    ],
    apply: (t, P) => {
      P.hoodHi = pulse(t, 0.12, 0.25, 0.85, 0.97)
      P.filmVis = pulse(t, 0.16, 0.26, 0.9, 0.99)
      P.filmLift = 1 - ramp(t, 0.3, 0.56)
      P.filmTilt = 1 - ramp(t, 0.27, 0.46)
      P.sweep = ramp(t, 0.5, 0.64)
      P.sweepVis = pulse(t, 0.48, 0.52, 0.62, 0.67)
      P.ppfStack = pulse(t, 0.63, 0.71, 0.82, 0.9)
    },
    phases: [[0, 'Approaching the hood'], [0.22, 'Film lifted for alignment'], [0.36, 'Aligning with the panel'], [0.5, 'Settling onto the paint'], [0.64, 'Layer view'], [0.86, 'Panel reassembled']],
    controls: [
      { kind: 'state', label: 'Lift film', set: { filmVis: 1, filmLift: 1, filmTilt: 0.3, ppfStack: 0 } },
      { kind: 'state', label: 'Apply film', set: { filmVis: 1, filmLift: 0, filmTilt: 0, ppfStack: 0 } },
      { kind: 'state', label: 'Layer view', set: { filmVis: 1, filmLift: 0, filmTilt: 0, ppfStack: 1 } },
      { kind: 'toggle', label: 'Film layer', key: 'filmVis' },
    ],
    labels: [
      { anchor: 'film', text: 'Clear film (illustrative)', show: [0.2, 0.28, 0.6, 0.66], dir: [-1, -1], key: 'filmVis', mobile: true },
      { anchor: 'hood', text: 'Painted hood panel', show: [0.2, 0.3, 0.6, 0.66], dir: [1, 1] },
      { anchor: 'stack0', text: 'Film', show: [0.66, 0.72, 0.82, 0.86], dir: [1, -0.6], key: 'ppfStack', mobile: true },
      { anchor: 'stack1', text: 'Clear coat', show: [0.67, 0.73, 0.82, 0.86], dir: [1, -0.2], key: 'ppfStack' },
      { anchor: 'stack2', text: 'Colour coat', show: [0.68, 0.74, 0.82, 0.86], dir: [1, 0.2], key: 'ppfStack' },
      { anchor: 'stack3', text: 'Primer and panel', show: [0.69, 0.75, 0.82, 0.86], dir: [1, 0.6], key: 'ppfStack', mobile: true },
    ],
  },
  {
    id: 'styling',
    nav: 'Styling and lights',
    title: 'Lighting and exterior styling',
    body: 'A roof spoiler lines up and fits, the roof takes a black finish and the lamps come on. A CAR MAX styling post describes lights, a spoiler, a black roof and sun visors.',
    note: 'Exact products and installation options are confirmed for each vehicle.',
    service: 'styling',
    weight: 2.2,
    still: 0.58,
    cam: [
      { t: 0.09, pos: [0.6, 3.1, 6.2], tgt: [0, 1.0, 0], fov: 34 },
      { t: 0.25, pos: [-6.1, 3.3, 4.3], tgt: [-1.0, 1.2, 0], fov: 34 },
      { t: 0.52, pos: [-5.6, 3.55, 3.8], tgt: [-0.9, 1.25, 0], fov: 34 },
      { t: 0.78, pos: [4.7, 0.95, 2.65], tgt: [1.7, 0.82, 0.3], fov: 32 },
      { t: 1, pos: [4.45, 0.9, 2.95], tgt: [1.7, 0.82, 0.3], fov: 32 },
    ],
    apply: (t, P) => {
      P.spoilerVis = ramp(t, 0.08, 0.18)
      P.spoilerSep = 1 - ramp(t, 0.3, 0.48)
      P.spoilerHi = pulse(t, 0.1, 0.2, 0.5, 0.6)
      P.roofBlack = ramp(t, 0.38, 0.56)
      P.roofHi = pulse(t, 0.36, 0.42, 0.56, 0.62)
      P.lamps = ramp(t, 0.74, 0.86)
      P.lampHi = pulse(t, 0.72, 0.78, 0.92, 0.98)
    },
    phases: [[0, 'Moving to the roof line'], [0.18, 'Spoiler separated'], [0.32, 'Spoiler aligned and fitted'], [0.4, 'Black roof finish'], [0.56, 'Moving to the lamps'], [0.76, 'Lamps on']],
    controls: [
      { kind: 'state', label: 'Separate spoiler', set: { spoilerVis: 1, spoilerSep: 1 } },
      { kind: 'state', label: 'Fit spoiler', set: { spoilerVis: 1, spoilerSep: 0 } },
      { kind: 'toggle', label: 'Black roof', key: 'roofBlack' },
      { kind: 'toggle', label: 'Lamps', key: 'lamps' },
    ],
    labels: [
      { anchor: 'spoiler', text: 'Roof spoiler', show: [0.14, 0.22, 0.52, 0.58], dir: [-1, -1], key: 'spoilerSep', mobile: true },
      { anchor: 'roof', text: 'Black roof finish', show: [0.4, 0.46, 0.56, 0.6], dir: [1, -1], key: 'roofBlack', mobile: true },
      { anchor: 'lamp', text: 'Head lamp', show: [0.78, 0.84, 0.94, 0.98], dir: [-1, -1], key: 'lamps', mobile: true },
    ],
  },
  {
    id: 'interior',
    nav: 'Seat covers',
    title: 'Custom seat covers',
    body: 'Through the driver’s door to the seat. The cover lifts off the existing seat, then fits back over it. CAR MAX has shown seat covers fitted and customized for different cars.',
    note: 'Colours are visual examples only. Materials and fit options are confirmed per vehicle.',
    service: 'seat-covers',
    weight: 2.4,
    inside: true,
    still: 0.7,
    cam: [
      { t: 0.2, pos: [-0.3, 1.45, 3.4], tgt: [0.3, 0.95, 0.4], fov: 36 },
      { t: 0.36, pos: [0.15, 1.28, 1.55], tgt: [0.1, 0.95, 0.3], fov: 44 },
      { t: 0.47, pos: [0.3, 1.24, 0.5], tgt: [-0.15, 0.85, 0.2], fov: 50 },
      { t: 0.58, pos: [0.2, 1.3, -0.58], tgt: [-0.28, 0.82, 0.38], fov: 56 },
      { t: 1, pos: [0.17, 1.3, -0.6], tgt: [-0.28, 0.8, 0.38], fov: 56 },
    ],
    apply: (t, P) => {
      P.door = ramp(t, 0.06, 0.3)
      P.cabinLight = ramp(t, 0.25, 0.45)
      P.seatHi = pulse(t, 0.48, 0.56, 0.9, 0.98)
      P.coverSep = pulse(t, 0.58, 0.68, 0.8, 0.92)
    },
    phases: [[0, 'Door opening'], [0.34, 'Into the cabin'], [0.58, 'Cover separated from the seat'], [0.84, 'Cover fitted']],
    controls: [
      { kind: 'state', label: 'Separate cover', set: { coverSep: 1 } },
      { kind: 'state', label: 'Fit cover', set: { coverSep: 0 } },
      { kind: 'swatch', label: 'Example colours', key: 'coverColor', options: seatColours },
    ],
    labels: [
      { anchor: 'cover', text: 'Seat cover (illustrative)', show: [0.6, 0.68, 0.82, 0.88], dir: [-1, -1], key: 'coverSep', mobile: true },
      { anchor: 'seat', text: 'Existing seat stays in place', show: [0.62, 0.7, 0.82, 0.88], dir: [1, 1], key: 'coverSep', mobile: true },
    ],
  },
  {
    id: 'screen',
    nav: 'Infotainment screen',
    title: 'Infotainment screen',
    body: 'The display and its trim come forward from the dash so you can see how a screen upgrade sits in place. Posts show screen installations, including an Android screen in a Daihatsu Mira.',
    note: 'Fit depends on the vehicle. No compatibility, software feature or brand relationship is implied.',
    service: 'screens',
    weight: 1.9,
    inside: true,
    still: 0.55,
    cam: [
      { t: 0.3, pos: [-0.5, 1.2, 0.04], tgt: [0.45, 0.9, 0.0], fov: 40 },
      { t: 0.75, pos: [-0.32, 1.17, 0.06], tgt: [0.45, 0.9, 0.0], fov: 40 },
      { t: 1, pos: [-0.34, 1.17, 0.02], tgt: [0.45, 0.9, 0.0], fov: 40 },
    ],
    apply: (t, P) => {
      P.screenHi = pulse(t, 0.2, 0.3, 0.86, 0.96)
      P.screenSep = pulse(t, 0.32, 0.46, 0.66, 0.8)
      P.screenOn = ramp(t, 0.82, 0.92)
    },
    phases: [[0, 'Moving to the dashboard'], [0.32, 'Installation view'], [0.7, 'Reassembled'], [0.84, 'Screen on (illustrative)']],
    controls: [
      { kind: 'state', label: 'Inspect installation', set: { screenSep: 1, screenOn: 0 } },
      { kind: 'state', label: 'View screen', set: { screenSep: 0, screenOn: 1 } },
    ],
    labels: [
      { anchor: 'display', text: 'Display unit', show: [0.4, 0.48, 0.66, 0.72], dir: [-1, -1], key: 'screenSep', mobile: true },
      { anchor: 'bezel', text: 'Trim bezel', show: [0.42, 0.5, 0.66, 0.72], dir: [1, -1], key: 'screenSep' },
      { anchor: 'mount', text: 'Dash opening and mount, vehicle-specific', show: [0.44, 0.52, 0.66, 0.72], dir: [1, 1], key: 'screenSep', mobile: true },
    ],
  },
  {
    id: 'visor',
    nav: 'Visors and tint',
    title: 'Sun visors and solar tint',
    body: 'Window visors align along the door frames and a tint film settles onto the side glass. From a past project: an Oshan X7 fitted with a TXR sun visor and solar tint.',
    note: 'Past project. The shade preview is illustrative, not a tint rating. Ask about current availability.',
    service: 'visors-tint',
    weight: 2.0,
    still: 0.8,
    cam: [
      { t: 0.1, pos: [0.22, 1.28, 0.75], tgt: [0.2, 1.15, 1.6], fov: 46 },
      { t: 0.2, pos: [-0.2, 1.45, 2.4], tgt: [-0.2, 1.2, 0.6], fov: 38 },
      { t: 0.38, pos: [1.2, 2.15, 5.3], tgt: [-0.45, 1.22, 0.8], fov: 34 },
      { t: 1, pos: [1.6, 2.2, 5.0], tgt: [-0.4, 1.22, 0.8], fov: 34 },
    ],
    apply: (t, P) => {
      P.door = 1 - ramp(t, 0.16, 0.32)
      P.cabinLight = 1 - ramp(t, 0.12, 0.32)
      P.visorVis = ramp(t, 0.32, 0.4)
      P.visorSep = 1 - ramp(t, 0.42, 0.6)
      P.visorHi = pulse(t, 0.34, 0.42, 0.62, 0.7)
      P.tintVis = ramp(t, 0.6, 0.66)
      P.tintSep = 1 - ramp(t, 0.64, 0.8)
      P.tint = ramp(t, 0.72, 0.86) * 0.6
    },
    phases: [[0, 'Out of the cabin'], [0.32, 'Visors separated'], [0.46, 'Visors fitted to the door frames'], [0.62, 'Tint film aligning with the glass'], [0.8, 'Illustrative shade']],
    controls: [
      { kind: 'state', label: 'Separate visors', set: { visorVis: 1, visorSep: 1 } },
      { kind: 'state', label: 'Fit visors', set: { visorVis: 1, visorSep: 0 } },
      { kind: 'range', label: 'Illustrative shade', key: 'tint', max: 1, hint: 'Preview only, not a tint percentage' },
    ],
    labels: [
      { anchor: 'visor', text: 'Window visor', show: [0.36, 0.44, 0.64, 0.7], dir: [1, -1], key: 'visorSep', mobile: true },
      { anchor: 'tint', text: 'Tint film (illustrative shade)', show: [0.66, 0.74, 0.94, 0.99], dir: [-1, 1], key: 'tint', mobile: true },
    ],
  },
  {
    id: 'canopy',
    nav: 'Pickup canopy',
    title: 'Pickup canopy',
    body: 'On a pickup, a canopy shell lowers onto the bed rails and its rear hatch swings up on top hinges. From a past project: a Toyota Revo canopy.',
    note: 'Past project. Canopy types and compatible pickups are confirmed on request.',
    service: 'canopy',
    weight: 2.4,
    still: 0.8,
    cam: [
      { t: 0.2, pos: [0.8, 2.0, 9.6], tgt: [0, 0.8, 0], fov: 30 },
      { t: 0.48, pos: [-6.6, 3.1, 4.8], tgt: [-1.7, 1.5, 0], fov: 32 },
      { t: 0.7, pos: [-6.1, 2.4, 3.7], tgt: [-2.0, 1.25, 0], fov: 32 },
      { t: 1, pos: [-6.2, 2.5, 3.9], tgt: [-2.0, 1.25, 0], fov: 32 },
    ],
    apply: (t, P) => {
      P.suvX = ramp(t, 0.04, 0.3) * 9
      P.pickupX = -9 * (1 - ramp(t, 0.14, 0.42))
      P.canopyVis = ramp(t, 0.4, 0.47)
      P.canopySep = 1 - ramp(t, 0.47, 0.64)
      P.canopyHi = pulse(t, 0.42, 0.5, 0.9, 0.98)
      P.hatch = pulse(t, 0.68, 0.78, 0.86, 0.95)
    },
    phases: [[0, 'Pickup arriving'], [0.42, 'Canopy lifted above the bed'], [0.52, 'Canopy seated on the bed rails'], [0.7, 'Rear hatch open'], [0.88, 'Rear hatch closed']],
    controls: [
      { kind: 'state', label: 'Lift canopy', set: { canopyVis: 1, canopySep: 1, hatch: 0 } },
      { kind: 'state', label: 'Fit canopy', set: { canopyVis: 1, canopySep: 0, hatch: 0 } },
      { kind: 'state', label: 'Open hatch', set: { canopyVis: 1, canopySep: 0, hatch: 1 } },
    ],
    labels: [
      { anchor: 'canopy', text: 'Canopy shell', show: [0.44, 0.5, 0.88, 0.94], dir: [-1, -1], key: 'canopySep', mobile: true },
      { anchor: 'hinge', text: 'Top hinge', show: [0.7, 0.76, 0.86, 0.92], dir: [1, -1], key: 'hatch', mobile: true },
      { anchor: 'rails', text: 'Bed rails', show: [0.44, 0.5, 0.6, 0.66], dir: [1, 1], key: 'canopySep' },
    ],
  },
  {
    id: 'final',
    nav: 'Your car',
    title: 'Your car, next',
    body: 'That’s the walk-around. See the posts behind these upgrades, then ask CAR MAX about the work you want on your vehicle.',
    weight: 1.4,
    still: 0.9,
    cam: [
      { t: 0.3, pos: [1.5, 2.2, 10], tgt: [0, 0.8, 0], fov: 30 },
      { t: 0.65, pos: [5.6, 1.45, 6.4], tgt: [0.05, 0.72, 0], fov: 30 },
      { t: 1, pos: [5.0, 1.35, 6.9], tgt: [0.05, 0.72, 0], fov: 30 },
    ],
    apply: (t, P) => {
      P.pickupX = 9 * ramp(t, 0.04, 0.34)
      // SUV re-enters from the left once both vehicles are out of frame.
      P.suvX = t < 0.2 ? 9 : -9 * (1 - ramp(t, 0.2, 0.56))
    },
    phases: [[0, 'Clearing the studio'], [0.5, 'Final view']],
    controls: [],
    labels: [],
  },
]
