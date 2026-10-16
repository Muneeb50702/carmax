import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { setSimpleView } from '../env'
import { chapters, type Control } from '../tour/chapters'
import { labelEls } from '../tour/labels'
import { jumpToChapter, resumeTour, setManual, useTourController } from '../tour/controller'
import { tour, ui, useUI } from '../tour/store'
import { paramsAt, totalWeight } from '../tour/timeline'
import { scrollToId } from './scroll'
import { TourFallback } from './TourFallback'

const Stage = lazy(() => import('../three/Stage'))

class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    ui.set({ mode: 'fallback' })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Tour() {
  const mode = useUI((s) => s.mode)
  if (mode === 'fallback') return <TourFallback />
  return <PinnedTour />
}

function PinnedTour() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const mode = useUI((s) => s.mode)
  const reduced = useUI((s) => s.reduced)
  const [stageKey, setStageKey] = useState(0)
  useTourController(section, stage)
  const len = reduced ? chapters.length * 0.9 : totalWeight

  return (
    <section id="tour" ref={section} className="tour" style={{ ['--tour-len' as string]: len }} aria-label="Interactive service tour">
      <div ref={stage} className={`stage ${mode === 'ready' ? 'is-ready' : ''}`}>
        <div className="stage-frame">
          <div className="stage-poster" aria-hidden="true" />
          {mode !== 'lost' && (
            <StageBoundary key={stageKey}>
              <Suspense fallback={null}>
                <Stage />
              </Suspense>
            </StageBoundary>
          )}
        </div>
        <Intro />
        <Labels />
        <ChapterRail />
        <Panel />
        <p className="stage-credit">Virtual studio. Vehicles and parts are illustrations.</p>
        {mode === 'loading' && (
          <p className="stage-status" role="status">
            <span className="spinner" aria-hidden="true" /> Preparing the studio
          </p>
        )}
        {mode === 'lost' && (
          <div className="stage-lost glass" role="alert">
            <p>The 3D view stopped. Reload it, or continue with the simple tour.</p>
            <div className="row">
              <button
                className="btn btn--primary"
                onClick={() => {
                  ui.set({ mode: 'loading' })
                  setStageKey((k) => k + 1)
                }}
              >
                Reload 3D view
              </button>
              <button className="btn" onClick={() => setSimpleView(true)}>
                Use simple tour
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Intro() {
  const mode = useUI((s) => s.mode)
  return (
    <div className="intro">
      <p className="intro-word" aria-hidden="true">
        CAR MAX RYK
      </p>
      <div className="hero-copy">
        <h1>Car accessories and PPF in Rahim Yar Khan</h1>
        <p>
          Explore protection, interior upgrades and styling for your vehicle at CAR MAX.{' '}
          <span className="hide-narrow">Scroll through the studio to see where each upgrade goes, then ask the team about yours.</span>
        </p>
        <div className="row">
          <button className={`btn btn--primary ${mode === 'loading' ? 'is-loading' : ''}`} onClick={() => jumpToChapter(1)}>
            {mode === 'loading' && <span className="spinner" aria-hidden="true" />}
            Explore the experience
          </button>
          <button className="btn" onClick={() => scrollToId('enquiry')}>
            Request a quote
          </button>
        </div>
      </div>
      <p className="scroll-cue" aria-hidden="true">
        Scroll
      </p>
    </div>
  )
}

function Labels() {
  const chapter = useUI((s) => s.chapter)
  const labels = chapters[chapter].labels
  const slot = (i: number) => (labelEls[i] ??= {})
  return (
    <div className="annos" aria-hidden="true">
      <svg className="annos-lines">
        <defs>
          <linearGradient id="anno-grad" gradientUnits="userSpaceOnUse" x1="0" x2="1600" y1="0" y2="0">
            <stop offset="0" stopColor="var(--sky)" />
            <stop offset="1" stopColor="var(--apricot)" />
          </linearGradient>
        </defs>
        {labels.map((l, i) => (
          <g key={`${chapter}-${l.anchor}`}>
            <line ref={(el) => void (slot(i).line = el)} />
            <circle r="4" ref={(el) => void (slot(i).dot = el)} />
          </g>
        ))}
      </svg>
      {labels.map((l, i) => (
        <span key={`${chapter}-${l.anchor}`} className="anno" ref={(el) => void (slot(i).box = el)}>
          {l.text}
        </span>
      ))}
    </div>
  )
}

function ChapterRail() {
  const chapter = useUI((s) => s.chapter)
  const [open, setOpen] = useState(false)
  const sheet = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open) sheet.current?.showModal()
    else sheet.current?.close()
  }, [open])
  const list = (onPick?: () => void) => (
    <ol className="rail-list">
      {chapters.map((c, i) => (
        <li key={c.id}>
          <button
            className={`rail-item ${i === chapter ? 'is-active' : ''} ${i < chapter ? 'is-done' : ''}`}
            aria-current={i === chapter ? 'step' : undefined}
            onClick={() => {
              onPick?.()
              jumpToChapter(i)
            }}
          >
            <span className="rail-dot" aria-hidden="true" />
            <span className="rail-label">{c.nav}</span>
          </button>
        </li>
      ))}
    </ol>
  )
  return (
    <>
      <nav className="rail" aria-label="Tour chapters">
        <span className="rail-track" aria-hidden="true">
          <span className="rail-fill" />
        </span>
        {list()}
      </nav>
      {/* compact chapter bar for phones */}
      <div className="chapter-bar glass">
        <button className="chapter-bar-btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <span className="chapter-bar-count">
            {chapter + 1}/{chapters.length}
          </span>
          <span className="chapter-bar-name">{chapters[chapter].nav}</span>
          <span className="chapter-bar-more">Chapters</span>
        </button>
        <span className="chapter-bar-progress" aria-hidden="true" />
      </div>
      <dialog ref={sheet} className="sheet" onClose={() => setOpen(false)} aria-label="Tour chapters">
        <div className="sheet-head">
          <h2>Tour chapters</h2>
          <button className="btn btn--icon" onClick={() => setOpen(false)} aria-label="Close chapters">
            ✕
          </button>
        </div>
        {list(() => setOpen(false))}
        <div className="row">
          <button
            className="btn sheet-skip"
            onClick={() => {
              setOpen(false)
              scrollToId('services')
            }}
          >
            Skip the tour
          </button>
          <button className="link-btn" onClick={() => setSimpleView(true)}>
            Use the simple view
          </button>
        </div>
      </dialog>
    </>
  )
}

function Panel() {
  const chapter = useUI((s) => s.chapter)
  const c = chapters[chapter]
  return (
    <aside key={c.id} className={`panel glass ${chapter === 0 ? 'panel--intro' : ''}`} aria-labelledby={`panel-${c.id}`}>
      <PanelContent chapter={chapter} />
    </aside>
  )
}

function PanelContent({ chapter }: { chapter: number }) {
  const phase = useUI((s) => s.phase)
  const manual = useUI((s) => s.manual)
  const [more, setMore] = useState(false)
  const c = chapters[chapter]
  const hasManual = Object.keys(manual).length > 0
  const isLast = chapter === chapters.length - 1
  return (
    <>
      <p className="panel-count">
        {chapter + 1} of {chapters.length}
      </p>
      <h2 id={`panel-${c.id}`}>{c.title}</h2>
      <p className="panel-phase">{c.phases[phase]?.[1]}</p>
      <p className={`panel-body ${more ? 'is-open' : ''}`} id={`panel-body-${c.id}`}>
        {c.body}
      </p>
      <button className="link-btn panel-more" aria-expanded={more} aria-controls={`panel-body-${c.id}`} onClick={() => setMore((m) => !m)}>
        {more ? 'Show less' : 'Read more'}
      </button>
      {c.controls.length > 0 && (
        <div className="panel-ctl" role="group" aria-label={`${c.title} controls`}>
          <div className="panel-controls">
            {c.controls
              .filter((k) => k.kind !== 'range')
              .map((ctl) => (
                <ControlView key={ctl.label} ctl={ctl} chapter={chapter} />
              ))}
            {hasManual && (
              <button className="chip chip--resume" onClick={resumeTour}>
                Resume tour
              </button>
            )}
          </div>
          {c.controls
            .filter((k) => k.kind === 'range')
            .map((ctl) => (
              <ControlView key={ctl.label} ctl={ctl} chapter={chapter} />
            ))}
        </div>
      )}
      {c.note && <p className="panel-note">{c.note}</p>}
      <div className="panel-actions">
        {c.service && (
          <button
            className="btn btn--small"
            onClick={() => {
              ui.set({ enquiryService: c.service! })
              scrollToId('enquiry')
            }}
          >
            Ask about this
          </button>
        )}
        {isLast ? (
          <>
            <button className="btn btn--primary btn--small" onClick={() => scrollToId('enquiry')}>
              Request a quote
            </button>
            <button className="btn btn--small" onClick={() => scrollToId('projects')}>
              View projects
            </button>
          </>
        ) : (
          <button className="link-btn" onClick={() => scrollToId('services')}>
            Skip tour
          </button>
        )}
        <button className="link-btn hide-narrow" onClick={() => setSimpleView(true)}>
          Simple view
        </button>
      </div>
    </>
  )
}

/** Value the scroll timeline would give this param right now (used for toggle state). */
const timelineValue = (key: keyof typeof tour.target) => paramsAt(tour.index, tour.t)[key]

function ControlView({ ctl, chapter }: { ctl: Control; chapter: number }) {
  const manual = useUI((s) => s.manual)
  useUI((s) => s.phase) // re-evaluate toggle state as the demo advances
  if (ctl.kind === 'state') {
    const on = Object.keys(manual).length > 0 && Object.entries(ctl.set).every(([k, v]) => manual[k as keyof typeof manual] === v)
    return (
      <button className={`chip ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => setManual(ctl.set as Record<string, number>)}>
        {ctl.label}
      </button>
    )
  }
  if (ctl.kind === 'toggle') {
    const value = manual[ctl.key] ?? (chapter === tour.index ? timelineValue(ctl.key) : 0)
    const on = value > 0.5
    return (
      <button className={`chip chip--toggle ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => setManual({ [ctl.key]: on ? 0 : 1 })}>
        <span className="chip-switch" aria-hidden="true" />
        {ctl.label}
      </button>
    )
  }
  if (ctl.kind === 'range') {
    const value = manual[ctl.key] ?? timelineValue(ctl.key)
    return (
      <label className="range">
        <span className="range-label">{ctl.label}</span>
        <input
          type="range"
          min={0}
          max={ctl.max}
          step={0.01}
          value={value}
          aria-describedby={`hint-${ctl.key}`}
          onChange={(e) => setManual({ [ctl.key]: +e.target.value, tintVis: 1, tintSep: 0 })}
        />
        <span className="range-hint" id={`hint-${ctl.key}`}>
          {ctl.hint}
        </span>
      </label>
    )
  }
  return <Swatches ctl={ctl} />
}

function Swatches({ ctl }: { ctl: Extract<Control, { kind: 'swatch' }> }) {
  const current = useUI((s) => s.coverColor)
  return (
    <fieldset className="swatches">
      <legend>{ctl.label}</legend>
      {ctl.options.map((o, i) => (
        <button
          key={o.name}
          className={`swatch ${current === i ? 'is-on' : ''}`}
          style={{ ['--swatch' as string]: o.color }}
          aria-pressed={current === i}
          onClick={() => ui.set({ coverColor: i })}
        >
          <span className="swatch-chip" aria-hidden="true" />
          {o.name}
        </button>
      ))}
    </fieldset>
  )
}
