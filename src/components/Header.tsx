import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { business } from '../content/business'
import { scrollToId } from './scroll'

export const navLinks = [
  ['tour', 'Tour'],
  ['services', 'Services'],
  ['projects', 'Projects'],
  ['about', 'About'],
  ['contact', 'Contact'],
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open) menu.current?.showModal()
    else menu.current?.close()
  }, [open])
  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }
  return (
    <header className="header glass">
      <a className="brand" href="#tour" onClick={go('tour')} aria-label={`${business.displayName}, back to the top`}>
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">CAR MAX</span>
        <span className="brand-city">RYK</span>
      </a>
      <span className="demo-badge" title="Demo website concept prepared for CAR MAX RYK">
        Demo
      </span>
      <nav className="header-nav" aria-label="Main">
        {navLinks.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={go(id)}>
            {label}
          </a>
        ))}
      </nav>
      <a className="btn btn--primary btn--small header-cta" href="#enquiry" onClick={go('enquiry')}>
        Request a quote
      </a>
      <button className="btn btn--icon header-menu" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <span className="burger" aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </button>
      <dialog ref={menu} className="sheet" onClose={() => setOpen(false)} aria-label="Menu">
        <div className="sheet-head">
          <h2>Menu</h2>
          <button className="btn btn--icon" onClick={() => setOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>
        <nav className="sheet-nav" aria-label="Main">
          {navLinks.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={go(id)}>
              {label}
            </a>
          ))}
          <a href="#faq" onClick={go('faq')}>
            Questions
          </a>
        </nav>
        <a className="btn btn--primary" href="#enquiry" onClick={go('enquiry')}>
          Request a quote
        </a>
        <a className="btn" href={business.phoneHref}>
          Call {business.phoneLocal}
        </a>
      </dialog>
    </header>
  )
}
