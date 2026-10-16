import { business } from '../content/business'
import { scrollToId } from './scroll'

/** Thumb-reach actions on phones. */
export function MobileDock() {
  return (
    <nav className="dock glass" aria-label="Quick actions">
      <a className="dock-btn" href={business.phoneHref}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
        </svg>
        Call
      </a>
      <button className="dock-btn" onClick={() => scrollToId('services')}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
        Services
      </button>
      <button className="dock-btn dock-btn--primary" onClick={() => scrollToId('enquiry')}>
        Request a quote
      </button>
    </nav>
  )
}
