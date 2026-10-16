import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { sources } from '../content/business'
import { publicProjects } from '../content/projects'
import { services } from '../content/services'
import { ui, useUI } from '../tour/store'
import { Illustration } from './Illustration'
import { scrollToId } from './scroll'

const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? id

export function Projects() {
  const filters = useMemo(() => ['all', ...new Set(publicProjects.map((p) => p.service))], [])
  const [filter, setFilter] = useState('all')
  const shown = publicProjects.filter((p) => filter === 'all' || p.service === filter)
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="section-head">
        <h2 id="projects-title">Work from CAR MAX posts</h2>
        <p>Each card links to the original public post. Line illustrations stand in until the shop supplies approved photos.</p>
      </div>
      <div className="filters" role="radiogroup" aria-label="Filter projects by service">
        {filters.map((f) => (
          <button key={f} role="radio" aria-checked={filter === f} className={`chip ${filter === f ? 'is-on' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All work' : serviceName(f)}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} projects shown
      </p>
      <ul className="folders">
        {shown.map((p) => (
          <li key={p.id}>
            <FolderCard id={p.id} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function FolderCard({ id }: { id: string }) {
  const p = publicProjects.find((x) => x.id === id)!
  const ref = useRef<HTMLButtonElement>(null)
  // Tilt toward the pointer on devices that hover; touch gets a plain press state.
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -6}deg`)
    ref.current.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`)
  }
  const reset = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }
  return (
    <button ref={ref} className="folder" onPointerMove={onMove} onPointerLeave={reset} onClick={() => ui.set({ project: p.id })} aria-haspopup="dialog">
      <span className="folder-tab">{serviceName(p.service)}</span>
      <span className="folder-sheet folder-sheet--back" aria-hidden="true" />
      <span className="folder-sheet" aria-hidden="true">
        <Illustration kind={p.illustration} />
      </span>
      <span className="folder-front">
        <span className="folder-title">{p.title}</span>
        <span className="folder-meta">{p.vehicle ?? 'Vehicle not named in the post'}</span>
        <span className="tag">Illustration</span>
      </span>
    </button>
  )
}

export function ProjectDialog() {
  const id = useUI((s) => s.project)
  const ref = useRef<HTMLDialogElement>(null)
  const p = publicProjects.find((x) => x.id === id)
  useEffect(() => {
    if (p) ref.current?.showModal()
    else ref.current?.close()
  }, [p])
  const close = () => ui.set({ project: null })
  return (
    <dialog ref={ref} className="dialog" onClose={close} aria-labelledby="project-title">
      {p && (
        <div className="dialog-body">
          <div className="dialog-head">
            <p className="dialog-kicker">{serviceName(p.service)}</p>
            <button className="btn btn--icon" onClick={close} aria-label="Close project">
              ✕
            </button>
          </div>
          <h2 id="project-title">{p.title}</h2>
          <div className="dialog-art">
            <Illustration kind={p.illustration} title={`Illustration for ${p.title}`} />
            <span className="tag">Illustration. Original photos to be supplied by CAR MAX.</span>
          </div>
          <dl className="facts">
            <div>
              <dt>Vehicle</dt>
              <dd>{p.vehicle ?? 'Not named in the post'}</dd>
            </div>
            <div>
              <dt>What the post shows</dt>
              <dd>{p.evidence}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{p.status}</dd>
            </div>
            {p.date && (
              <div>
                <dt>Date</dt>
                <dd>{p.date}</dd>
              </div>
            )}
          </dl>
          <div className="row">
            <button
              className="btn btn--primary"
              onClick={() => {
                ui.set({ project: null, enquiryService: p.service })
                scrollToId('enquiry')
              }}
            >
              Ask about similar work
            </button>
            <a className="btn" href={sources[p.source].url} target="_blank" rel="noopener noreferrer">
              Open the original post
              <span className="sr-only"> on Facebook (opens in a new tab)</span>
            </a>
          </div>
        </div>
      )}
    </dialog>
  )
}
