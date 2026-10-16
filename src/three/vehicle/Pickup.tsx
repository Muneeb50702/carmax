import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BoxGeometry, CylinderGeometry, DoubleSide, PlaneGeometry, Quaternion, SpriteMaterial, Vector3, type Group, type Mesh } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { tour } from '../../tour/store'
import { makeHighlight, type Materials } from '../materials'
import { anchor } from '../rig'
import { buildVehicle } from './build'
import { canopyPanels, pickupDoors, pickupPanels } from './layout'
import { Highlight, PanelGroup, useHighlightTime, Wheel } from './parts'
import { canopyProfile, pickupProfile as P } from './profiles'

const WHEEL = { r: 0.385, width: 0.265, rimR: 0.225 }
const TRACK = 0.79
const HINGE: [number, number, number] = [-2.56, 1.83, 0]

const up = new Vector3(0, 1, 0)
const a = new Vector3()
const bv = new Vector3()
const q = new Quaternion()
const hingeV = new Vector3(...HINGE)

export function Pickup({ M, detail }: { M: Materials; detail: number }) {
  const d = useMemo(() => {
    const b = buildVehicle(P, pickupPanels(P.xF, P.xR), detail)
    const c = buildVehicle(canopyProfile, canopyPanels(), detail * 0.8)
    const pt = (x: number, s: number, side: number, off = 0): [number, number, number] => {
      const p = [0, 0, 0]
      b.body.point(x, s, side, p)
      return [p[0], p[1], p[2] + side * off]
    }
    const railZ = b.body.halfW(-1.8) * 0.93
    return {
      b,
      c,
      pt,
      railZ,
      mirror: new RoundedBoxGeometry(0.22, 0.13, 0.18, 3, 0.04),
      floor: new BoxGeometry(1.56, 0.03, railZ * 2 - 0.12),
      rail: new BoxGeometry(1.56, 0.03, 0.09),
      tub: new RoundedBoxGeometry(0.95, 0.24, 0.26, 3, 0.06),
      hingeBarrel: new CylinderGeometry(0.018, 0.018, 0.22, 12).rotateX(Math.PI / 2),
      strut: new CylinderGeometry(0.009, 0.009, 1, 8),
      liner: new CylinderGeometry(P.archR - 0.015, P.archR - 0.015, 0.4, 24, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2),
      underbody: new BoxGeometry(4.6, 0.16, 1.4),
      shadow: new PlaneGeometry(6.2, 2.8).rotateX(-Math.PI / 2),
    }
  }, [detail])

  const mats = useMemo(() => {
    const canopy = makeHighlight()
    const liner = M.under.clone()
    liner.side = DoubleSide
    const glowTail = new SpriteMaterial({ map: M.glow.map, color: '#ff2b2b', transparent: true, depthWrite: false, blending: M.glow.blending, opacity: 0 })
    return { canopy, liner, glowTail }
  }, [M])
  useHighlightTime([mats.canopy])

  const root = useRef<Group>(null)
  const canopy = useRef<Group>(null)
  const hatch = useRef<Group>(null)
  const struts = useRef<(Mesh | null)[]>([])
  const spin = useRef(0)

  useFrame(() => {
    const c = tour.cur
    if (root.current) {
      root.current.position.x = c.pickupX
      root.current.visible = Math.abs(c.pickupX) < 8.6
    }
    spin.current = -c.pickupX / WHEEL.r
    if (canopy.current) {
      canopy.current.visible = c.canopyVis > 0.01
      // drops in from above the frame, then lowers onto the rails
      canopy.current.position.set(-c.canopySep * 0.1, c.canopySep * 0.6 + (1 - c.canopyVis) * 2.2, 0)
    }
    if (hatch.current) hatch.current.rotation.z = -c.hatch * 1.15
    mats.canopy.uniforms.uI.value = c.canopyHi * 0.75
    mats.glowTail.opacity = c.lamps * 0.3
    // gas struts: canopy side → hatch frame, recomputed as the hatch swings
    if (hatch.current && canopy.current) {
      for (let i = 0; i < 2; i++) {
        const m = struts.current[i]
        if (!m) continue
        const z = i ? -0.78 : 0.78
        a.set(-2.42, 1.52, z) // canopy-local
        bv.set(-2.62 - HINGE[0], 1.52 - HINGE[1], z * 0.97).applyEuler(hatch.current.rotation).add(hingeV)
        m.position.copy(a).add(bv).multiplyScalar(0.5)
        m.scale.set(1, a.distanceTo(bv), 1)
        q.setFromUnitVectors(up, bv.sub(a).normalize())
        m.quaternion.copy(q)
      }
    }
  })

  const { b, c, pt, railZ } = d
  const f1 = pickupDoors.front[1]
  return (
    <group ref={root} position={[-9, 0, 0]}>
      <PanelGroup built={b} group="body" M={M} paint={M.pickupPaint} roof={M.pickupPaint} />
      <PanelGroup built={b} group="door" M={M} paint={M.pickupPaint} roof={M.pickupPaint} />
      <PanelGroup built={b} group="hood" M={M} paint={M.pickupPaint} roof={M.pickupPaint} />
      <PanelGroup built={b} group="roof" M={M} paint={M.pickupPaint} roof={M.pickupPaint} inner={M.headliner} />
      {[1, -1].map((side) => (
        <mesh key={side} geometry={d.mirror} material={M.black} position={pt(f1 - 0.1, 0.53, side, 0.1)} />
      ))}

      {/* bed */}
      <mesh geometry={d.floor} material={M.plastic} position={[-1.85, 0.86, 0]} />
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh geometry={d.rail} material={M.plastic} position={[-1.85, 1.09, side * (railZ - 0.03)]} />
          <mesh geometry={d.tub} material={M.plastic} position={[P.wheels[1], 0.95, side * (railZ - 0.16)]} />
        </group>
      ))}
      <group ref={anchor('rails')} position={[-1.5, 1.1, railZ]} />

      {/* canopy shell */}
      <group ref={canopy}>
        <PanelGroup built={c} group="canopy" M={M} paint={M.pickupPaint} roof={M.pickupPaint} />
        <Highlight geometry={c.parts.canopy?.paint} material={mats.canopy} />
        <group ref={anchor('canopy')} position={[-1.9, 1.86, 0.45]} />
        <group ref={hatch} position={HINGE}>
          <group position={[-HINGE[0], -HINGE[1], 0]}>
            <PanelGroup built={c} group="hatch" M={M} paint={M.pickupPaint} roof={M.pickupPaint} />
          </group>
        </group>
        {[0.42, -0.42].map((z) => (
          <mesh key={z} geometry={d.hingeBarrel} material={M.steel} position={[HINGE[0], HINGE[1] + 0.005, z]} />
        ))}
        <group ref={anchor('hinge')} position={[HINGE[0], HINGE[1] + 0.02, 0.42]} />
        {[0, 1].map((i) => (
          <mesh key={i} ref={(m) => (struts.current[i] = m)} geometry={d.strut} material={M.chrome} />
        ))}
      </group>

      {[1, -1].map((side) => (
        <sprite key={side} material={mats.glowTail} position={pt(-2.66, 0.4, side, 0.05)} scale={0.35} />
      ))}

      {P.wheels.map((x) =>
        [1, -1].map((side) => (
          <group key={`${x}${side}`}>
            <Wheel M={M} {...WHEEL} segs={detail > 0.8 ? 48 : 32} x={x} y={P.wheelY} z={side * TRACK} spin={spin} />
            <mesh geometry={d.liner} material={mats.liner} position={[x, P.wheelY, side * 0.7]} />
          </group>
        )),
      )}
      <mesh geometry={d.underbody} material={M.under} position={[0.1, 0.36, 0]} />
      <mesh geometry={d.shadow} material={M.shadow} position={[0, 0.004, 0]} />
    </group>
  )
}
