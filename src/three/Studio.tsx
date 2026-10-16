import { Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BackSide, Color, CylinderGeometry, ShaderMaterial, type Mesh } from 'three'
import { palette } from '../styles/palette'
import type { Quality } from '../tour/store'
import { tour } from '../tour/store'
import type { Materials } from './materials'

/** Conceptual virtual studio — not the client's premises. */
export function Studio({ M, quality }: { M: Materials; quality: Quality }) {
  const sweep = useRef<Mesh>(null)
  const backdrop = useMemo(
    () => ({
      geo: new CylinderGeometry(26, 26, 20, 64, 1, true),
      mat: new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        uniforms: {
          uBase: { value: new Color(palette.graphite) },
          uDeep: { value: new Color(palette.graphiteDeep) },
          uA: { value: new Color(palette.apricot) },
          uB: { value: new Color(palette.sky) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vP;
          void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uBase; uniform vec3 uDeep; uniform vec3 uA; uniform vec3 uB;
          varying vec3 vP;
          float bloom(float ang, float c, float y, float yc) {
            float d = atan(sin(ang - c), cos(ang - c));
            return exp(-d * d / 1.4) * exp(-(y - yc) * (y - yc) / 30.0);
          }
          void main() {
            float h = clamp((vP.y + 2.0) / 14.0, 0.0, 1.0);
            vec3 col = mix(uBase, uDeep, smoothstep(0.0, 1.0, h));
            float ang = atan(vP.z, vP.x);
            col += uA * bloom(ang, -2.3, vP.y, 1.5) * 0.09;
            col += uB * bloom(ang, 0.9, vP.y, 2.5) * 0.08;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    }),
    [],
  )

  useFrame(() => {
    // a slow light strip that travels with the tour so reflections move across paint and glass
    if (sweep.current) sweep.current.position.x = Math.sin(tour.sweepPhase * Math.PI * 7) * 7
  })

  const high = quality === 'high'
  return (
    <>
      <Environment frames={high ? Infinity : 1} resolution={high ? 256 : 128} environmentIntensity={1}>
        <Lightformer form="rect" intensity={2.4} color={palette.paper} scale={[12, 6, 1]} position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={2.2} color={palette.apricot} scale={[14, 1.6, 1]} position={[-7, 2.6, 4]} rotation={[0, Math.PI / 2.4, 0]} />
        <Lightformer form="rect" intensity={2.6} color={palette.sky} scale={[14, 1.4, 1]} position={[7, 2.2, -4]} rotation={[0, -Math.PI / 1.8, 0]} />
        <Lightformer form="rect" intensity={1.5} color={palette.paper} scale={[10, 3, 1]} position={[0, 2.5, 10]} rotation={[0, Math.PI, 0]} />
        <Lightformer form="rect" intensity={1.8} color={palette.paper} scale={[6, 4, 1]} position={[8, 3, 7]} rotation={[0, Math.PI * 0.8, 0]} />
        <Lightformer form="rect" intensity={1.1} color={palette.paper} scale={[6, 3, 1]} position={[-8, 3, -6]} rotation={[0, -Math.PI * 0.2, 0]} />
        <Lightformer form="ring" intensity={1.2} color={palette.paper} scale={3} position={[0, 4, -9]} />
        {high && <Lightformer ref={sweep} form="rect" intensity={2.2} color={palette.paper} scale={[0.7, 9, 1]} position={[0, 3, 7]} rotation={[0, Math.PI, 0]} />}
      </Environment>

      <mesh geometry={backdrop.geo} material={backdrop.mat} position={[0, 7, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[26, 64]} />
        {high ? (
          <MeshReflectorMaterial
            blur={[260, 80]}
            resolution={1024}
            mixBlur={1}
            mixStrength={1.4}
            roughness={0.9}
            depthScale={0.9}
            minDepthThreshold={0.35}
            maxDepthThreshold={1.3}
            color="#16181b"
            metalness={0.45}
            mirror={0}
          />
        ) : (
          <meshStandardMaterial color="#17191c" roughness={0.7} metalness={0.15} />
        )}
      </mesh>
      <mesh material={M.turntable} position={[0, 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 96]} />
      </mesh>
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.4, 3.43, 128]} />
        <meshBasicMaterial color={palette.apricot} transparent opacity={0.35} />
      </mesh>
    </>
  )
}
