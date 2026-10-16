import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
} from 'three'
import { palette } from '../styles/palette'

function canvas(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  draw(el.getContext('2d')!)
  return el
}

const tex = (el: HTMLCanvasElement, srgb = true, repeat?: [number, number]): Texture => {
  const t = new CanvasTexture(el)
  if (srgb) t.colorSpace = SRGBColorSpace
  if (repeat) {
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(...repeat)
  }
  t.anisotropy = 4
  return t
}

// ---- textures ----
const grilleTex = () =>
  tex(
    canvas(256, 128, (c) => {
      c.fillStyle = '#050506'
      c.fillRect(0, 0, 256, 128)
      c.strokeStyle = '#2a2c30'
      c.lineWidth = 2.2
      const r = 9
      for (let y = 0, row = 0; y < 140; y += r * 1.5, row++) {
        for (let x = row % 2 ? r * 0.87 : 0; x < 270; x += r * 1.74) {
          c.beginPath()
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k + Math.PI / 6
            c.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9)
          }
          c.closePath()
          c.stroke()
        }
      }
    }),
    true,
    [5, 1.4],
  )

/** Diamond quilting as a normal map: illustrative stitching for the seat cover. */
const quiltNormal = () =>
  tex(
    canvas(128, 128, (c) => {
      const img = c.createImageData(128, 128)
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const u = ((x + y) % 64) / 64 - 0.5
          const v = ((x - y + 128) % 64) / 64 - 0.5
          // pillow per diamond: gradient of a soft bump
          const nx = -Math.sin(u * Math.PI * 2) * 0.55
          const ny = -Math.sin(v * Math.PI * 2) * 0.55
          const seam = Math.min(Math.abs(u), Math.abs(v)) < 0.03 ? 0.0 : 1
          const i = (y * 128 + x) * 4
          img.data[i] = 128 + (nx + ny) * 90 * seam
          img.data[i + 1] = 128 + (nx - ny) * 90 * seam
          img.data[i + 2] = 255
          img.data[i + 3] = 255
        }
      }
      c.putImageData(img, 0, 0)
    }),
    false,
    [6, 6],
  )

export const shadowTex = () =>
  tex(
    canvas(128, 128, (c) => {
      const gr = c.createRadialGradient(64, 64, 4, 64, 64, 64)
      gr.addColorStop(0, 'rgba(0,0,0,1)')
      gr.addColorStop(0.55, 'rgba(0,0,0,0.55)')
      gr.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = gr
      c.fillRect(0, 0, 128, 128)
    }),
  )

export const glowTex = () =>
  tex(
    canvas(64, 64, (c) => {
      const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32)
      gr.addColorStop(0, 'rgba(255,255,255,1)')
      gr.addColorStop(0.25, 'rgba(255,255,255,0.35)')
      gr.addColorStop(1, 'rgba(255,255,255,0)')
      c.fillStyle = gr
      c.fillRect(0, 0, 64, 64)
    }),
  )

const brushedTex = () =>
  tex(
    canvas(512, 512, (c) => {
      c.fillStyle = '#2b2e33'
      c.fillRect(0, 0, 512, 512)
      for (let r = 4; r < 256; r += 1.3) {
        const l = 38 + Math.random() * 16
        c.strokeStyle = `rgb(${l},${l + 2},${l + 5})`
        c.lineWidth = 0.8
        c.beginPath()
        c.arc(256, 256, r, 0, Math.PI * 2)
        c.stroke()
      }
    }),
  )

/** Illustrative display: no apps, features or brands, only the studio mark and soft tiles. */
export const screenTex = () =>
  tex(
    canvas(512, 300, (c) => {
      const gr = c.createLinearGradient(0, 0, 512, 300)
      gr.addColorStop(0, '#11141a')
      gr.addColorStop(1, '#1b1f27')
      c.fillStyle = gr
      c.fillRect(0, 0, 512, 300)
      const bloom = c.createRadialGradient(400, 60, 10, 400, 60, 260)
      bloom.addColorStop(0, palette.apricot + 'aa')
      bloom.addColorStop(1, 'transparent')
      c.fillStyle = bloom
      c.fillRect(0, 0, 512, 300)
      const bloom2 = c.createRadialGradient(80, 280, 10, 80, 280, 240)
      bloom2.addColorStop(0, palette.sky + '99')
      bloom2.addColorStop(1, 'transparent')
      c.fillStyle = bloom2
      c.fillRect(0, 0, 512, 300)
      c.fillStyle = 'rgba(250,249,239,0.9)'
      c.font = '700 34px Archivo Variable, Archivo, sans-serif'
      c.fillText('CAR MAX', 36, 70)
      c.font = '400 18px Archivo Variable, Archivo, sans-serif'
      c.fillStyle = 'rgba(250,249,239,0.6)'
      c.fillText('Illustrative display', 36, 98)
      for (let i = 0; i < 4; i++) {
        c.fillStyle = 'rgba(250,249,239,0.08)'
        c.beginPath()
        c.roundRect(36 + i * 112, 170, 96, 90, 14)
        c.fill()
      }
    }),
  )

// ---- materials ----
export function makeMaterials(quality: 'high' | 'mobile' | 'low') {
  const env = quality === 'high' ? 1.15 : 1
  const paint = new MeshPhysicalMaterial({
    color: palette.paintPearl,
    metalness: 0.55,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: env * 1.25,
  })
  const pickupPaint = paint.clone()
  pickupPaint.color.set(palette.paintSteel)
  const black = new MeshPhysicalMaterial({ color: '#08090a', metalness: 0.2, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: env })
  const roof = paint.clone() // lerps toward gloss black for the black-roof finish
  const plastic = new MeshStandardMaterial({ color: '#141518', roughness: 0.78, metalness: 0.05 })
  const under = new MeshStandardMaterial({ color: '#0b0c0d', roughness: 0.95 })
  const chrome = new MeshStandardMaterial({ color: '#c9ced4', metalness: 1, roughness: 0.14 })
  const tint = new MeshPhysicalMaterial({ color: '#1a1f26', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.42, depthWrite: false })
  // Additive reflection layer so glass keeps strong reflections while staying see-through.
  const glassReflect = new MeshPhysicalMaterial({
    color: '#000000',
    metalness: 1,
    roughness: 0.04,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    envMapIntensity: 0.85,
  })
  const lamp = new MeshPhysicalMaterial({ color: '#30343a', metalness: 0.9, roughness: 0.12, clearcoat: 1, envMapIntensity: env * 1.3 })
  const drl = new MeshStandardMaterial({ color: '#1d2024', emissive: new Color(palette.paper), emissiveIntensity: 0 })
  const mainLamp = new MeshStandardMaterial({ color: '#c3c8ce', emissive: new Color('#f4f2ea'), emissiveIntensity: 0, metalness: 1, roughness: 0.18 })
  const tail = new MeshPhysicalMaterial({ color: '#3a0a0c', emissive: new Color('#ff2a2a'), emissiveIntensity: 0.05, roughness: 0.1, clearcoat: 1 })
  const grille = new MeshStandardMaterial({ map: grilleTex(), metalness: 0.4, roughness: 0.35 })
  const interior = new MeshStandardMaterial({ color: '#1b1c1f', roughness: 0.9, side: BackSide })
  const headliner = new MeshStandardMaterial({ color: '#4a4c51', roughness: 0.95, side: BackSide })
  const trim = new MeshStandardMaterial({ color: '#1e2023', roughness: 0.75 })
  const trimSoft = new MeshStandardMaterial({ color: '#2a2c30', roughness: 0.85 })
  const foam = new MeshStandardMaterial({ color: '#5d5f63', roughness: 1 })
  const fabric = new MeshStandardMaterial({ color: '#34363b', roughness: 0.82, normalMap: quiltNormal() })
  fabric.normalScale.set(0.55, 0.55)
  const steel = new MeshStandardMaterial({ color: '#7d8289', metalness: 0.9, roughness: 0.35 })
  const tire = new MeshStandardMaterial({ color: '#111113', roughness: 0.88 })
  const rim = new MeshStandardMaterial({ color: '#b7bcc3', metalness: 1, roughness: 0.27 })
  const rimDark = new MeshStandardMaterial({ color: '#2a2c30', metalness: 0.8, roughness: 0.45 })
  const disc = new MeshStandardMaterial({ color: '#5b5f66', metalness: 0.9, roughness: 0.45 })
  const caliper = new MeshStandardMaterial({ color: '#2f3136', metalness: 0.4, roughness: 0.5 })
  const screen = new MeshBasicMaterial({ map: screenTex(), color: '#000000' })
  const screenGlass = new MeshPhysicalMaterial({ color: '#06070a', metalness: 0.1, roughness: 0.06, clearcoat: 1 })
  const visor = new MeshPhysicalMaterial({ color: '#0b0c0f', metalness: 0.1, roughness: 0.08, transparent: true, opacity: 0.72, clearcoat: 1, side: DoubleSide })
  const tintFilm = new MeshBasicMaterial({ color: '#030405', transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })
  const turntable = new MeshStandardMaterial({ map: brushedTex(), metalness: 0.85, roughness: 0.42, color: '#9aa1a9' })
  const shadow = new MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, color: '#000000', opacity: 0.85 })
  const glow = new MeshBasicMaterial({ map: glowTex(), transparent: true, depthWrite: false, blending: AdditiveBlending, color: '#fff6e8', opacity: 0 })
  const glowRed = glow.clone()
  glowRed.color.set('#ff3030')
  return {
    paint, pickupPaint, black, roof, plastic, under, chrome, tint, glassReflect, lamp, drl, mainLamp, tail, grille,
    interior, headliner, trim, trimSoft, foam, fabric, steel, tire, rim, rimDark, disc, caliper, screen, screenGlass,
    visor, tintFilm, turntable, shadow, glow, glowRed,
  }
}
export type Materials = ReturnType<typeof makeMaterials>

/** Fresnel rim in the Pipo apricot → sky gradient, drawn over a component to highlight it. */
export function makeHighlight() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    side: DoubleSide,
    uniforms: {
      uA: { value: new Color(palette.apricot) },
      uB: { value: new Color(palette.sky) },
      uI: { value: 0 },
      uT: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uA; uniform vec3 uB; uniform float uI; uniform float uT;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
        float band = 0.5 + 0.5 * sin(vW.x * 3.0 + vW.y * 2.0 - uT * 1.6);
        vec3 col = mix(uA, uB, band);
        float a = (f * 0.9 + 0.07) * uI;
        gl_FragColor = vec4(col * a, 1.0);
      }`,
  })
}

/** The illustrative PPF sheet: faint fill, glowing outline and a squeegee sweep line. */
export function makeFilm() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    uniforms: {
      uA: { value: new Color(palette.apricot) },
      uB: { value: new Color(palette.sky) },
      uVis: { value: 0 },
      uSweep: { value: 0 },
      uSweepVis: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uA; uniform vec3 uB; uniform float uVis; uniform float uSweep; uniform float uSweepVis;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float ex = min(vUv.x, 1.0 - vUv.x);
        float ey = vUv.y; // s runs from the hood edge (0) to the centre line (1) on each half
        float edge = (1.0 - smoothstep(0.0, 0.035, ex)) + (1.0 - smoothstep(0.0, 0.05, ey));
        float spec = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
        float sweep = (1.0 - smoothstep(0.0, 0.06, abs(vUv.x - (1.0 - uSweep)))) * uSweepVis;
        vec3 col = mix(uB, uA, vUv.x);
        float a = clamp((0.1 + edge * 0.9 + spec * 0.35) * uVis + sweep * 0.9, 0.0, 1.0);
        gl_FragColor = vec4(mix(col, vec3(1.0), sweep) * a, 1.0);
      }`,
  })
}
