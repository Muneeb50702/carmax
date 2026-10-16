import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ACESFilmicToneMapping } from 'three'
import { palette } from '../styles/palette'
import { ui, useUI } from '../tour/store'
import { makeMaterials } from './materials'
import { Annotations, CameraRig } from './rig'
import { Studio } from './Studio'
import { Pickup } from './vehicle/Pickup'
import { Suv } from './vehicle/Suv'

function ReadySignal() {
  const frames = useRef(0)
  useFrame(() => {
    if (++frames.current === 3 && ui.get().mode === 'loading') ui.set({ mode: 'ready' })
  })
  return null
}

export default function Stage() {
  const quality = useUI((s) => s.quality)
  const needPickup = useUI((s) => s.chapter >= 4)
  const host = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  const maxDpr = quality === 'high' ? 1.75 : quality === 'mobile' ? 1.5 : 1
  const [dpr, setDpr] = useState(Math.min(devicePixelRatio || 1, maxDpr))
  const M = useMemo(() => makeMaterials(quality), [quality])
  const detail = quality === 'high' ? 1 : quality === 'mobile' ? 0.7 : 0.5

  useEffect(() => {
    // Stop rendering entirely while the tour is off screen.
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting))
    if (host.current) io.observe(host.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={host} className="stage-canvas" aria-hidden="true">
      <Canvas
        dpr={dpr}
        frameloop={active ? 'always' : 'never'}
        camera={{ fov: 30, near: 0.1, far: 90, position: [6.6, 1.25, 7.6] }}
        gl={{ antialias: quality !== 'low', powerPreference: 'high-performance', stencil: false, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onCreated={({ gl }) => {
          const el = gl.domElement
          el.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            ui.set({ mode: 'lost' })
          })
          el.addEventListener('webglcontextrestored', () => ui.set({ mode: 'ready' }))
        }}
      >
        <color attach="background" args={[palette.graphite]} />
        <fog attach="fog" args={[palette.graphite, 15, 34]} />
        <PerformanceMonitor flipflops={3} onDecline={() => setDpr((d) => Math.max(1, d - 0.25))} onFallback={() => setDpr(1)} />
        <Studio M={M} quality={quality} />
        <Suv M={M} detail={detail} />
        {needPickup && <Pickup M={M} detail={detail} />}
        <CameraRig />
        <Annotations />
        <ReadySignal />
      </Canvas>
    </div>
  )
}
