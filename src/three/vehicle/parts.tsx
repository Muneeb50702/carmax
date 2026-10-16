// Shared pieces for both vehicles: panel meshes, wheels, highlight twins.
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { type BufferGeometry, type Group, type Material, type ShaderMaterial } from 'three'
import type { Materials } from '../materials'
import type { Built } from './build'
import type { Mat } from './layout'
import { wheelGeometries } from './build'

export function matFor(M: Materials, mat: Mat, paint: Material, roof: Material): Material {
  switch (mat) {
    case 'paint': return paint
    case 'roof': return roof
    case 'glass': return M.tint
    case 'mainLamp': return M.mainLamp
    default: return M[mat]
  }
}

/** All meshes of one panel group, plus the dark inner shell and the extra reflection pass on glass. */
export function PanelGroup({ built, group, M, paint, roof, inner }: { built: Built; group: string; M: Materials; paint: Material; roof: Material; inner?: Material }) {
  const parts = built.parts[group] ?? {}
  return (
    <>
      {Object.entries(parts).map(([mat, geo]) => (
        <mesh key={mat} geometry={geo} material={matFor(M, mat as Mat, paint, roof)} renderOrder={mat === 'glass' ? 2 : 0} />
      ))}
      {parts.glass && <mesh geometry={parts.glass} material={M.glassReflect} renderOrder={3} />}
      {built.inner[group] && <mesh geometry={built.inner[group]} material={inner ?? M.interior} />}
    </>
  )
}

export function Highlight({ geometry, material }: { geometry?: BufferGeometry; material: ShaderMaterial }) {
  return geometry ? <mesh geometry={geometry} material={material} renderOrder={5} /> : null
}

export function useHighlightTime(mats: ShaderMaterial[]) {
  useFrame((s) => mats.forEach((m) => (m.uniforms.uT.value = s.clock.elapsedTime)))
}

type WheelProps = { M: Materials; r: number; width: number; rimR: number; segs: number; x: number; y: number; z: number; spin: { current: number } }

export function Wheel({ M, r, width, rimR, segs, x, y, z, spin }: WheelProps) {
  const geo = useMemo(() => wheelGeometries(r, width, rimR, segs), [r, width, rimR, segs])
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = spin.current
  })
  const outward = z > 0 ? 1 : -1
  return (
    <group position={[x, y, z]} scale={[1, 1, outward]}>
      <group ref={ref}>
        <mesh geometry={geo.tire} material={M.tire} />
        <mesh geometry={geo.rim} material={M.rim} />
        <mesh geometry={geo.barrel} material={M.rimDark} />
        <mesh geometry={geo.hub} material={M.rimDark} />
      </group>
      <mesh geometry={geo.disc} material={M.disc} />
      <mesh geometry={geo.caliper} material={M.caliper} />
    </group>
  )
}
