import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  MeshPhysicalMaterial,
  PlaneGeometry,
  SpriteMaterial,
  type Group,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { palette } from '../../styles/palette'
import { tour } from '../../tour/store'
import { makeFilm, makeHighlight, type Materials } from '../materials'
import { anchor } from '../rig'
import { buildVehicle, extraPatches, spoilerGeometry } from './build'
import { Cabin } from './Cabin'
import { suvDoors, suvPanels } from './layout'
import { Highlight, PanelGroup, useHighlightTime, Wheel } from './parts'
import { suvProfile as P } from './profiles'

const WHEEL = { r: 0.36, width: 0.235, rimR: 0.235 }
const TRACK = 0.79
const black = new Color('#0a0b0d')
const pearl = new Color(palette.paintPearl)

export function Suv({ M, detail }: { M: Materials; detail: number }) {
  const d = useMemo(() => {
    const b = buildVehicle(P, suvPanels(P.xF, P.xR), detail)
    const pt = (x: number, s: number, side: number, off = 0): [number, number, number] => {
      const p = [0, 0, 0]
      b.body.point(x, s, side, p)
      // offset away from the centre plane: good enough for side-mounted parts
      return [p[0], p[1], p[2] + Math.sign(side) * off]
    }
    const [f0, f1] = suvDoors.front
    const [r0, r1] = suvDoors.rear
    const visor = (side: number) =>
      extraPatches(b, [
        { x: [f0 + 0.05, f1 - 0.16], s: [0.738, 0.8], sides: [side], offset: 0.03 },
        { x: [r0 + 0.03, r1 - 0.1], s: [0.738, 0.8], sides: [side], offset: 0.03 },
      ])
    return {
      b,
      pt,
      hinge: [f1, 0, b.body.halfW(f1) * 0.965] as [number, number, number],
      film: extraPatches(b, [{ x: [0.995, 2.095], s: [0.53, 1], offset: 0.006 }]),
      visorR: visor(1),
      visorL: visor(-1),
      tint: extraPatches(b, [
        { x: [f0 + 0.03, f1 - 0.005], s: [0.532, 0.772], sides: [1], offset: -0.008 },
        { x: [r0 + 0.025, r1 - 0.09], s: [0.532, 0.772], sides: [1], offset: -0.008 },
        { x: [-1.58, -1.08], s: [0.532, 0.772], sides: [1], offset: -0.008 },
      ]),
      spoiler: spoilerGeometry(1.36),
      mirror: new RoundedBoxGeometry(0.2, 0.11, 0.17, 3, 0.04),
      handle: new RoundedBoxGeometry(0.13, 0.024, 0.022, 2, 0.01),
      armrest: new RoundedBoxGeometry(0.42, 0.06, 0.07, 2, 0.02),
      slab: new RoundedBoxGeometry(0.34, 0.014, 0.22, 2, 0.005),
      liner: new CylinderGeometry(P.archR - 0.015, P.archR - 0.015, 0.36, 24, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2),
      underbody: new BoxGeometry(3.85, 0.12, 1.44),
      shadow: new PlaneGeometry(5.2, 2.7).rotateX(-Math.PI / 2),
      contact: new PlaneGeometry(0.75, 0.45).rotateX(-Math.PI / 2),
    }
  }, [detail])

  const mats = useMemo(() => {
    const hood = makeHighlight()
    const roof = makeHighlight()
    const spoiler = makeHighlight()
    const lamp = makeHighlight()
    const visor = makeHighlight()
    const tint = makeHighlight()
    const spoilerMat = M.paint.clone()
    spoilerMat.transparent = true
    const visorMat = M.visor.clone()
    const liner = M.under.clone()
    liner.side = DoubleSide
    const film = makeFilm()
    const glowHead = new SpriteMaterial({ map: M.glow.map, color: '#fff4e2', transparent: true, depthWrite: false, blending: M.glow.blending, opacity: 0 })
    const glowTail = new SpriteMaterial({ map: M.glow.map, color: '#ff2b2b', transparent: true, depthWrite: false, blending: M.glow.blending, opacity: 0 })
    const stack = [
      new MeshPhysicalMaterial({ color: palette.paper, transparent: true, opacity: 0.4, roughness: 0.05, clearcoat: 1, iridescence: 0.6 }),
      new MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, roughness: 0.02, clearcoat: 1 }),
      M.paint,
      new MeshPhysicalMaterial({ color: '#6c7076', roughness: 0.7 }),
    ]
    return { hood, roof, spoiler, lamp, visor, tint, spoilerMat, visorMat, liner, film, glowHead, glowTail, stack }
  }, [M])
  useHighlightTime([mats.hood, mats.roof, mats.spoiler, mats.lamp, mats.visor, mats.tint])

  const root = useRef<Group>(null)
  const door = useRef<Group>(null)
  const filmG = useRef<Group>(null)
  const stackG = useRef<Group>(null)
  const slabs = useRef<(Group | null)[]>([])
  const spoilerG = useRef<Group>(null)
  const visorR = useRef<Group>(null)
  const visorL = useRef<Group>(null)
  const tintG = useRef<Group>(null)
  const spin = useRef(0)

  useFrame(() => {
    const c = tour.cur
    if (root.current) {
      root.current.position.x = c.suvX
      root.current.visible = Math.abs(c.suvX) < 8.5
    }
    spin.current = -c.suvX / WHEEL.r
    if (door.current) door.current.rotation.y = c.door * 1.12
    // PPF film: lift, tilt, settle, sweep
    if (filmG.current) {
      filmG.current.position.set(1.55 + c.filmLift * 0.12, 1.0 + c.filmLift * 0.42, 0)
      filmG.current.rotation.set(c.filmTilt * 0.1, 0, c.filmTilt * 0.26)
      filmG.current.visible = c.filmVis > 0.01
    }
    const fu = mats.film.uniforms
    fu.uVis.value = c.filmVis
    fu.uSweep.value = c.sweep
    fu.uSweepVis.value = c.sweepVis
    if (stackG.current) {
      stackG.current.visible = c.ppfStack > 0.01
      stackG.current.scale.setScalar(0.75 + 0.25 * c.ppfStack)
      slabs.current.forEach((s, i) => s && (s.position.y = (3 - i) * (0.016 + 0.075 * c.ppfStack)))
      mats.stack[0].opacity = 0.4 * c.ppfStack
      mats.stack[1].opacity = 0.25 * c.ppfStack
    }
    mats.hood.uniforms.uI.value = c.hoodHi * 0.5
    // spoiler and roof
    if (spoilerG.current) {
      spoilerG.current.position.set(-1.56 - c.spoilerSep * 0.24, 1.645 + c.spoilerSep * 0.36, 0)
      spoilerG.current.rotation.z = -0.05 + c.spoilerSep * 0.16
      spoilerG.current.visible = c.spoilerVis > 0.01
    }
    mats.spoilerMat.opacity = c.spoilerVis
    mats.spoiler.uniforms.uI.value = c.spoilerHi * c.spoilerVis
    M.roof.color.lerpColors(pearl, black, c.roofBlack)
    mats.roof.uniforms.uI.value = c.roofHi * 0.8
    // lamps
    M.drl.emissiveIntensity = c.drl * 2.4
    M.mainLamp.emissiveIntensity = c.lamps * 2.2
    M.tail.emissiveIntensity = 0.05 + c.lamps * 0.9
    mats.glowHead.opacity = c.lamps * 0.5 + c.drl * 0.08
    mats.glowTail.opacity = c.lamps * 0.3
    mats.lamp.uniforms.uI.value = c.lampHi * 0.7
    // visors and tint
    for (const [g, side] of [[visorR.current, 1], [visorL.current, -1]] as const) {
      if (!g) continue
      g.position.set(0, c.visorSep * 0.1, side * c.visorSep * 0.32)
      g.visible = c.visorVis > 0.01
    }
    mats.visorMat.opacity = 0.72 * c.visorVis
    mats.visor.uniforms.uI.value = c.visorHi * c.visorVis
    if (tintG.current) {
      tintG.current.position.z = -c.tintSep * 0.3
      tintG.current.visible = c.tintVis > 0.01
    }
    M.tintFilm.opacity = c.tintVis * (0.12 + c.tint * 0.82)
    mats.tint.uniforms.uI.value = c.tintVis * c.tintSep * 0.9
  })

  const { b, pt, hinge } = d
  const [hx, , hz] = hinge
  const head = (side: number) => pt(2.12, 0.42, side, 0.05)
  const tailP = (side: number) => pt(-2.17, 0.47, side, 0.05)
  return (
    <group ref={root}>
      <PanelGroup built={b} group="body" M={M} paint={M.paint} roof={M.roof} />
      <Highlight geometry={b.parts.body?.lamp} material={mats.lamp} />
      <group ref={anchor('lamp')} position={pt(2.12, 0.43, 1, 0.01)} />

      <group>
        <PanelGroup built={b} group="hood" M={M} paint={M.paint} roof={M.roof} />
        <Highlight geometry={b.parts.hood?.paint} material={mats.hood} />
        <group ref={anchor('hood')} position={pt(1.35, 0.8, 1, 0.01)} />
      </group>

      <group>
        <PanelGroup built={b} group="roof" M={M} paint={M.paint} roof={M.roof} inner={M.headliner} />
        <Highlight geometry={b.parts.roof?.roof} material={mats.roof} />
        <group ref={anchor('roof')} position={[-0.75, 1.69, 0.35]} />
      </group>

      {/* driver's door swings on its front hinge */}
      <group ref={door} position={[hx, 0, hz]}>
        <group position={[-hx, 0, -hz]}>
          <PanelGroup built={b} group="door" M={M} paint={M.paint} roof={M.roof} />
          <mesh geometry={d.mirror} material={M.paint} position={pt(0.8, 0.53, 1, 0.1)} />
          <mesh geometry={d.handle} material={M.chrome} position={pt(0.12, 0.47, 1, 0.012)} />
          <mesh geometry={d.armrest} material={M.trimSoft} position={[0.45, 0.78, hz - 0.08]} />
        </group>
      </group>
      <mesh geometry={d.mirror} material={M.paint} position={pt(0.8, 0.53, -1, 0.1)} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh geometry={d.handle} material={M.chrome} position={pt(-0.8, 0.47, side, 0.012)} />
          {side < 0 && <mesh geometry={d.handle} material={M.chrome} position={pt(0.12, 0.47, side, 0.012)} />}
        </group>
      ))}

      {/* spoiler */}
      <group ref={spoilerG}>
        <mesh geometry={d.spoiler} material={mats.spoilerMat} />
        <mesh geometry={d.spoiler} material={mats.spoiler} renderOrder={5} />
        <group ref={anchor('spoiler')} position={[-0.16, 0.02, 0.5]} />
      </group>

      {/* PPF film and its layer stack */}
      <group ref={filmG}>
        <mesh geometry={d.film} material={mats.film} position={[-1.55, -1.0, 0]} renderOrder={6} />
        <group ref={anchor('film')} position={[2.0 - 1.55, pt(2.0, 0.62, 1)[1] - 1.0, pt(2.0, 0.62, 1)[2]]} />
      </group>
      <group ref={stackG} position={[2.3, 1.02, 1.45]} rotation={[0, 0.55, 0]}>
        {mats.stack.map((m, i) => (
          <group key={i} ref={(g) => (slabs.current[i] = g)}>
            <mesh geometry={d.slab} material={m} />
            <group ref={anchor(`stack${i}`)} position={[0.17, 0, -0.11]} />
          </group>
        ))}
      </group>

      {/* window visors (separate groups so each side moves outward) */}
      <group ref={visorR}>
        <mesh geometry={d.visorR} material={mats.visorMat} />
        <mesh geometry={d.visorR} material={mats.visor} renderOrder={5} />
        <group ref={anchor('visor')} position={pt(0.3, 0.78, 1, 0.04)} />
      </group>
      <group ref={visorL}>
        <mesh geometry={d.visorL} material={mats.visorMat} />
      </group>
      <group ref={tintG}>
        <mesh geometry={d.tint} material={M.tintFilm} renderOrder={1} />
        <mesh geometry={d.tint} material={mats.tint} renderOrder={5} />
        <group ref={anchor('tint')} position={pt(-0.55, 0.65, 1, -0.01)} />
      </group>

      {/* lamp glows */}
      {[1, -1].map((side) => (
        <group key={side}>
          <sprite material={mats.glowHead} position={head(side)} scale={0.42} />
          <sprite material={mats.glowTail} position={tailP(side)} scale={0.3} />
        </group>
      ))}

      {/* running gear */}
      {P.wheels.map((x) =>
        [1, -1].map((side) => (
          <group key={`${x}${side}`}>
            <Wheel M={M} {...WHEEL} segs={detail > 0.8 ? 48 : 32} x={x} y={P.wheelY} z={side * TRACK} spin={spin} />
            <mesh geometry={d.liner} material={mats.liner} position={[x, P.wheelY, side * 0.72]} />
            <mesh geometry={d.contact} material={M.shadow} position={[x, 0.006, side * TRACK]} />
          </group>
        )),
      )}
      <mesh geometry={d.underbody} material={M.under} position={[0.02, 0.26, 0]} />
      <mesh geometry={d.shadow} material={M.shadow} position={[0, 0.004, 0]} />

      <Cabin M={M} />
    </group>
  )
}
