// SUV cabin. Educational detail only: the seat "structure" and dash mount are generic illustrations.
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { ExtrudeGeometry, Path, PlaneGeometry, Shape, type Group, type PointLight } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { seatColours } from '../../tour/chapters'
import { tour } from '../../tour/store'
import { makeHighlight, type Materials } from '../materials'
import { anchor } from '../rig'
import { useHighlightTime } from './parts'

const rb = (w: number, h: number, d: number, r = 0.035) => new RoundedBoxGeometry(w, h, d, 3, r)

function dashGeometry() {
  const s = new Shape()
  const pts: [number, number][] = [
    [0.98, 0.62], [0.98, 1.0], [0.86, 1.07], [0.66, 1.085], [0.52, 1.055], [0.47, 1.015], [0.458, 0.97], [0.44, 0.79], [0.47, 0.66], [0.56, 0.62],
  ]
  s.moveTo(...pts[0])
  pts.slice(1).forEach((p) => s.lineTo(...p))
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 4 })
  g.translate(0, 0, -0.75)
  return g
}

function frameGeometry(w: number, h: number, border: number, depth: number) {
  const outer = new Shape()
  const r = 0.02
  outer.moveTo(-w / 2 + r, -h / 2)
  outer.lineTo(w / 2 - r, -h / 2)
  outer.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  outer.lineTo(w / 2, h / 2 - r)
  outer.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  outer.lineTo(-w / 2 + r, h / 2)
  outer.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  outer.lineTo(-w / 2, -h / 2 + r)
  outer.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  const hole = new Path()
  const iw = w / 2 - border
  const ih = h / 2 - border
  hole.moveTo(-iw, -ih)
  hole.lineTo(-iw, ih)
  hole.lineTo(iw, ih)
  hole.lineTo(iw, -ih)
  hole.closePath()
  outer.holes.push(hole)
  return new ExtrudeGeometry(outer, { depth, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 1 })
}

type SeatGeo = ReturnType<typeof seatGeometries>
function seatGeometries() {
  return {
    rail: rb(0.46, 0.025, 0.03, 0.008),
    frame: rb(0.44, 0.06, 0.4, 0.01),
    cushion: rb(0.5, 0.12, 0.44),
    bolster: rb(0.46, 0.08, 0.08, 0.03),
    back: rb(0.12, 0.62, 0.46),
    backBolster: rb(0.11, 0.52, 0.08, 0.03),
    head: rb(0.09, 0.17, 0.27, 0.04),
    // covers are a few millimetres larger than the seat they wrap
    cCushion: rb(0.516, 0.128, 0.456),
    cBolster: rb(0.47, 0.088, 0.09, 0.035),
    cBack: rb(0.128, 0.63, 0.472),
    cBackBolster: rb(0.118, 0.528, 0.09, 0.035),
    cHead: rb(0.098, 0.178, 0.278, 0.042),
  }
}

/** One front seat. `animated` seats separate their cover with the tour. */
function Seat({ g, M, z, animated }: { g: SeatGeo; M: Materials; z: number; animated?: boolean }) {
  const cushion = useRef<Group>(null)
  const back = useRef<Group>(null)
  const head = useRef<Group>(null)
  const hi = useMemo(() => (animated ? makeHighlight() : null), [animated])
  useHighlightTime(hi ? [hi] : [])
  useFrame(() => {
    if (!animated) return
    const s = tour.cur.coverSep
    if (cushion.current) cushion.current.position.set(0.08 * s, 0.17 * s, -0.04 * s)
    if (back.current) back.current.position.set(0.24 * s, 0.07 * s, 0)
    if (head.current) head.current.position.set(0.12 * s, 0.2 * s, 0)
    if (hi) hi.uniforms.uI.value = tour.cur.seatHi * 0.9
  })
  return (
    <group position={[-0.22, 0.36, z]}>
      {[-0.16, 0.16].map((rz) => (
        <mesh key={rz} geometry={g.rail} material={M.steel} position={[0, 0.02, rz]} />
      ))}
      <mesh geometry={g.frame} material={M.steel} position={[0, 0.07, 0]} />
      {/* existing seat */}
      <group ref={animated ? anchor('seat') : undefined} position={[0.2, 0.16, 0.12]} />
      <mesh geometry={g.cushion} material={M.foam} position={[0, 0.16, 0]} />
      {[-0.2, 0.2].map((bz) => (
        <mesh key={bz} geometry={g.bolster} material={M.foam} position={[0, 0.22, bz]} />
      ))}
      <group position={[-0.24, 0.2, 0]} rotation={[0, 0, 0.26]}>
        <mesh geometry={g.back} material={M.foam} position={[0, 0.33, 0]} />
        {[-0.21, 0.21].map((bz) => (
          <mesh key={bz} geometry={g.backBolster} material={M.foam} position={[0.035, 0.3, bz]} />
        ))}
        <mesh geometry={g.head} material={M.foam} position={[0, 0.76, 0]} />
        {/* cover: backrest + headrest */}
        <group ref={back}>
          <mesh geometry={g.cBack} material={M.fabric} position={[0, 0.33, 0]} />
          {[-0.21, 0.21].map((bz) => (
            <mesh key={bz} geometry={g.cBackBolster} material={M.fabric} position={[0.035, 0.3, bz]} />
          ))}
          {hi && <mesh geometry={g.cBack} material={hi} position={[0, 0.33, 0]} renderOrder={5} />}
          {animated && <group ref={anchor('cover')} position={[0.07, 0.5, 0.1]} />}
        </group>
        <group ref={head}>
          <mesh geometry={g.cHead} material={M.fabric} position={[0, 0.76, 0]} />
        </group>
      </group>
      {/* cover: cushion */}
      <group ref={cushion}>
        <mesh geometry={g.cCushion} material={M.fabric} position={[0, 0.16, 0]} />
        {[-0.2, 0.2].map((bz) => (
          <mesh key={bz} geometry={g.cBolster} material={M.fabric} position={[0, 0.22, bz]} />
        ))}
        {hi && <mesh geometry={g.cCushion} material={hi} position={[0, 0.16, 0]} renderOrder={5} />}
      </group>
    </group>
  )
}

export function Cabin({ M }: { M: Materials }) {
  const geo = useMemo(
    () => ({
      dash: dashGeometry(),
      seat: seatGeometries(),
      bench: rb(0.5, 0.13, 1.3),
      benchBack: rb(0.13, 0.56, 1.3),
      console: rb(0.9, 0.24, 0.22, 0.03),
      armrest: rb(0.3, 0.06, 0.2, 0.025),
      floor: rb(2.5, 0.02, 1.56, 0.005),
      binnacle: rb(0.12, 0.09, 0.34, 0.03),
      vent: rb(0.03, 0.04, 0.18, 0.012),
      mount: rb(0.05, 0.2, 0.3, 0.01),
      bracket: rb(0.03, 0.17, 0.012, 0.004),
      bezel: frameGeometry(0.3, 0.19, 0.022, 0.012),
      display: rb(0.02, 0.152, 0.262, 0.008),
      glass: new PlaneGeometry(0.252, 0.142),
    }),
    [],
  )
  const screenGroup = useRef<Group>(null)
  const display = useRef<Group>(null)
  const bezel = useRef<Group>(null)
  const brackets = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  const hi = useMemo(() => makeHighlight(), [])
  useHighlightTime([hi])

  useFrame(() => {
    const c = tour.cur
    const s = c.screenSep
    if (display.current) display.current.position.x = -0.26 * s
    if (bezel.current) bezel.current.position.x = -0.13 * s
    if (brackets.current) brackets.current.position.x = -0.05 * s
    hi.uniforms.uI.value = c.screenHi * 0.9
    M.screen.color.setScalar(c.screenOn)
    M.fabric.color.set(seatColours[Math.round(c.coverColor)]?.color ?? seatColours[0].color)
    if (light.current) light.current.intensity = c.cabinLight * 1.6
  })

  return (
    <group>
      <mesh geometry={geo.floor} material={M.trim} position={[-0.3, 0.36, 0]} />
      <mesh geometry={geo.dash} material={M.trimSoft} />
      <mesh geometry={geo.binnacle} material={M.trim} position={[0.6, 1.1, 0.38]} />
      {[-0.5, 0.5, -0.08, 0.08].map((z) => (
        <mesh key={z} geometry={geo.vent} material={M.under} position={[0.47, Math.abs(z) > 0.2 ? 1.0 : 0.995, z]} />
      ))}
      {/* steering wheel, right-hand drive */}
      <group position={[0.3, 0.97, 0.38]} rotation={[0, 0, -0.4]}>
        <mesh material={M.trim} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.18, 0.022, 12, 48]} />
        </mesh>
        <mesh material={M.trim} position={[0.01, -0.05, 0]}>
          <boxGeometry args={[0.03, 0.12, 0.08]} />
        </mesh>
        <mesh material={M.trim} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.025, 0.34, 0.035]} />
        </mesh>
        <mesh material={M.trim} position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.035, 0.24, 12]} />
        </mesh>
      </group>
      {/* centre console */}
      <mesh geometry={geo.console} material={M.trim} position={[0.0, 0.48, 0]} />
      <mesh geometry={geo.armrest} material={M.trimSoft} position={[-0.42, 0.64, 0]} />
      {/* screen installation on the centre stack, facing the cabin */}
      <group ref={screenGroup} position={[0.452, 0.88, 0]} rotation={[0, 0, -0.1]}>
        <group ref={anchor('mount')} position={[0.0, -0.09, 0.152]} />
        <mesh geometry={geo.mount} material={M.under} position={[0.015, 0, 0]} />
        <group ref={brackets}>
          {[-0.14, 0.14].map((z) => (
            <mesh key={z} geometry={geo.bracket} material={M.steel} position={[-0.01, 0, z]} />
          ))}
        </group>
        <group ref={bezel}>
          <mesh geometry={geo.bezel} material={M.black} rotation={[0, -Math.PI / 2, 0]} position={[-0.02, 0, 0]} />
          <group ref={anchor('bezel')} position={[-0.025, 0.085, -0.125]} />
        </group>
        <group ref={display}>
          <mesh geometry={geo.display} material={M.screenGlass} position={[-0.03, 0, 0]} />
          <mesh geometry={geo.glass} material={M.screen} position={[-0.041, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
          <mesh geometry={geo.display} material={hi} position={[-0.03, 0, 0]} renderOrder={5} />
          <group ref={anchor('display')} position={[-0.045, 0.07, 0.12]} />
        </group>
      </group>
      <Seat g={geo.seat} M={M} z={0.38} animated />
      <Seat g={geo.seat} M={M} z={-0.38} />
      <group position={[-1.05, 0.36, 0]}>
        <mesh geometry={geo.bench} material={M.fabric} position={[0, 0.17, 0]} />
        <mesh geometry={geo.benchBack} material={M.fabric} position={[-0.24, 0.48, 0]} rotation={[0, 0, 0.22]} />
      </group>
      <pointLight ref={light} position={[-0.1, 1.4, 0]} color="#fff3e6" intensity={0} distance={2.6} decay={2} />
    </group>
  )
}
