import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type Object3D, type PerspectiveCamera } from 'three'
import { chapters } from '../tour/chapters'
import { labelEls } from '../tour/labels'
import { pulse } from '../tour/params'
import { tour, ui } from '../tour/store'

// ---- anchors: named points on components that labels follow ----
export const anchors = new Map<string, Object3D>()
export const anchor = (name: string) => (o: Object3D | null) => {
  if (o) anchors.set(name, o)
  else anchors.delete(name)
}


/** Drives the camera from the controller's damped pose, then offsets the projection so the subject clears the text panel. */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  useFrame(() => {
    const c = tour.cam
    camera.position.set(c.pos[0], c.pos[1], c.pos[2])
    camera.lookAt(c.tgt[0], c.tgt[1], c.tgt[2])
    camera.fov = c.fov
    camera.near = c.inside > 0.01 ? 0.03 : 0.1
    camera.updateProjectionMatrix()
    camera.projectionMatrix.elements[8] = -tour.shift[0]
    camera.projectionMatrix.elements[9] = -tour.shift[1]
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
  }, -1)
  return null
}

const v = new Vector3()

/** Places each chapter label next to its anchor with a leader line, keeping it on screen. */
export function Annotations() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useFrame(() => {
    const ch = chapters[tour.index]
    const manual = ui.get().chapter === tour.index ? ui.get().manual : {}
    const narrow = size.width < 600
    const gap = narrow ? 44 : 70
    // keep labels below the header and the phone chapter bar
    const bar = document.querySelector('.chapter-bar')?.getBoundingClientRect()
    const minY = bar && bar.width > 0 ? bar.bottom + 8 : 72
    const placed: [number, number, number, number][] = []
    ch.labels.forEach((l, i) => {
      const { box, line, dot } = labelEls[i] ?? {}
      const o = anchors.get(l.anchor)
      if (!box || !line || !dot) return
      const el = { box, line, dot }
      let vis = pulse(tour.t, ...l.show)
      if (l.key && manual[l.key] !== undefined) vis = (manual[l.key] as number) > 0.05 ? 1 : 0
      if (narrow && !l.mobile) vis = 0
      if (!o || vis < 0.02) {
        el.box.style.opacity = '0'
        el.line.style.opacity = '0'
        el.dot.style.opacity = '0'
        return
      }
      o.getWorldPosition(v).project(camera)
      if (v.z > 1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2) vis = 0
      const ax = ((v.x + 1) / 2) * size.width
      const ay = ((1 - v.y) / 2) * size.height
      const len = Math.hypot(l.dir[0], l.dir[1]) || 1
      const bw = el.box.offsetWidth
      const bh = el.box.offsetHeight
      // keep labels above the bottom panel on narrow screens
      const maxY = narrow ? size.height * 0.56 : size.height - 16
      let lx = ax + (l.dir[0] / len) * gap
      let ly = ay + (l.dir[1] / len) * gap
      const bx = Math.min(Math.max(l.dir[0] < 0 ? lx - bw : lx, 12), size.width - bw - 12)
      let by = Math.min(Math.max(ly - bh / 2, minY), maxY - bh)
      // nudge away from labels already placed this frame so text never stacks
      const step = (l.dir[1] < 0 ? -1 : 1) * (bh + 8)
      for (let n = 0; n < 4 && placed.some(([x, y, w2, h2]) => bx < x + w2 + 6 && bx + bw + 6 > x && by < y + h2 + 6 && by + bh + 6 > y); n++) by += step
      if (vis > 0.02) placed.push([bx, by, bw, bh])
      lx = l.dir[0] < 0 ? bx + bw : bx
      ly = by + bh / 2
      el.box.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`
      el.box.style.opacity = vis.toFixed(3)
      el.line.setAttribute('x1', ax.toFixed(1))
      el.line.setAttribute('y1', ay.toFixed(1))
      el.line.setAttribute('x2', lx.toFixed(1))
      el.line.setAttribute('y2', ly.toFixed(1))
      el.line.style.opacity = vis.toFixed(3)
      el.dot.setAttribute('cx', ax.toFixed(1))
      el.dot.setAttribute('cy', ay.toFixed(1))
      el.dot.style.opacity = vis.toFixed(3)
    })
  })
  return null
}
