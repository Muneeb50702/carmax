// DOM nodes for the current chapter's labels. Written by the overlay, positioned by the 3D scene.
export type LabelEl = { box?: HTMLElement | null; line?: SVGLineElement | null; dot?: SVGCircleElement | null }
export const labelEls: LabelEl[] = []
