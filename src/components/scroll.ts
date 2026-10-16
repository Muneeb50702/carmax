export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  // Long jumps (skipping the tour) are instant so the camera doesn't race through every chapter.
  const far = Math.abs(el.getBoundingClientRect().top) > innerHeight * 3
  el.scrollIntoView({ behavior: reduced || far ? 'instant' : 'smooth', block: 'start' })
  // move focus for keyboard and screen reader users without a second scroll jump
  const target = el.querySelector<HTMLElement>('h2, h1') ?? el
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
