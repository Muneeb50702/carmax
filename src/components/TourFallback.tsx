import { setSimpleView } from '../env'
import { chapters } from '../tour/chapters'
import { ui, useUI } from '../tour/store'
import { Illustration, type IllustrationKind } from './Illustration'
import { scrollToId } from './scroll'

const art: Record<string, IllustrationKind> = { ppf: 'ppf', styling: 'styling', interior: 'seat', screen: 'screen', visor: 'visor', canopy: 'canopy' }

/** The tour as plain content: no WebGL, low-power devices, or when the visitor picks the simple view. */
export function TourFallback() {
  const webgl = useUI((s) => s.mode) // 'fallback' here; offer 3D again only when WebGL exists
  const canTry3d = typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl')
  return (
    <section id="tour" className="tour-simple" aria-labelledby="tour-simple-title">
      <div className="tour-simple-hero">
        <p className="intro-word intro-word--static" aria-hidden="true">
          CAR MAX RYK
        </p>
        <h1 id="tour-simple-title">Car accessories and PPF in Rahim Yar Khan</h1>
        <p>Explore protection, interior upgrades and styling for your vehicle at CAR MAX, then ask the team about yours.</p>
        <div className="row">
          <button className="btn btn--primary" onClick={() => scrollToId('enquiry')}>
            Request a quote
          </button>
          <button className="btn" onClick={() => scrollToId('services')}>
            Explore services
          </button>
          {canTry3d && webgl === 'fallback' && (
            <button className="link-btn" onClick={() => setSimpleView(false)}>
              Try the 3D tour
            </button>
          )}
        </div>
      </div>
      <ol className="tour-simple-list">
        {chapters
          .filter((c) => art[c.id])
          .map((c) => (
            <li key={c.id} className="tour-simple-item">
              <div className="tour-simple-art">
                <Illustration kind={art[c.id]} />
                <span className="tag">Illustration</span>
              </div>
              <div>
                <h2>{c.title}</h2>
                <p>{c.body}</p>
                {c.note && <p className="panel-note">{c.note}</p>}
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
              </div>
            </li>
          ))}
      </ol>
    </section>
  )
}
