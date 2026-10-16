import test from 'node:test'
import assert from 'node:assert/strict'
import { chapters } from './chapters.ts'
import { defaultParams } from './params.ts'
import { cameraAt, chapterP, locate, paramsAt, starts, type CamPose } from './timeline.ts'

test('chapters tile the timeline', () => {
  assert.equal(starts[0], 0)
  assert.ok(Math.abs(starts[chapters.length] - 1) < 1e-9)
  assert.deepEqual(locate(0), { index: 0, t: 0 })
  assert.equal(locate(1).index, chapters.length - 1)
  const mid = chapterP(3, 0.5)
  assert.equal(locate(mid).index, 3)
  assert.ok(Math.abs(locate(mid).t - 0.5) < 1e-9)
})

test('scene params are continuous across chapter boundaries (reverse scroll has no jumps)', () => {
  for (let i = 1; i < chapters.length; i++) {
    const before = paramsAt(i - 1, 1)
    const after = paramsAt(i, 0)
    for (const k of Object.keys(defaultParams) as (keyof typeof defaultParams)[]) {
      assert.ok(Math.abs(before[k] - after[k]) < 1e-6, `${k} jumps entering ${chapters[i].id}: ${before[k]} → ${after[k]}`)
    }
  }
})

test('every demonstration ends reassembled', () => {
  const end = paramsAt(chapters.length - 1, 1)
  assert.ok(Math.abs(end.filmVis) < 1e-9, 'filmVis')
  assert.ok(Math.abs(end.ppfStack) < 1e-9, 'ppfStack')
  assert.ok(Math.abs(end.spoilerSep) < 1e-9, 'spoilerSep')
  assert.ok(Math.abs(end.door) < 1e-9, 'door')
  assert.ok(Math.abs(end.coverSep) < 1e-9, 'coverSep')
  assert.ok(Math.abs(end.screenSep) < 1e-9, 'screenSep')
  assert.ok(Math.abs(end.visorSep) < 1e-9, 'visorSep')
  assert.ok(Math.abs(end.canopySep) < 1e-9, 'canopySep')
  assert.ok(Math.abs(end.hatch) < 1e-9, 'hatch')
  assert.ok(Math.abs(end.suvX) < 1e-9, 'suvX')
})

test('camera path is continuous', () => {
  const a: CamPose = { pos: [0, 0, 0], tgt: [0, 0, 0], fov: 0, inside: 0 }
  const b: CamPose = { pos: [0, 0, 0], tgt: [0, 0, 0], fov: 0, inside: 0 }
  for (let p = 0; p < 1; p += 0.0005) {
    cameraAt(p, a)
    cameraAt(p + 0.0005, b)
    const d = Math.hypot(a.pos[0] - b.pos[0], a.pos[1] - b.pos[1], a.pos[2] - b.pos[2])
    assert.ok(d < 0.4, `camera jumps ${d.toFixed(3)}m at p=${p.toFixed(4)}`)
    assert.ok(a.pos.every(Number.isFinite))
  }
})
