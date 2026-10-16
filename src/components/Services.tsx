import { publicServices, statusLabel } from '../content/services'
import { chapters } from '../tour/chapters'
import { jumpToChapter } from '../tour/controller'
import { ui, useUI } from '../tour/store'
import { scrollToId } from './scroll'

export function Services() {
  const mode = useUI((s) => s.mode)
  return (
    <section id="services" className="section services" aria-labelledby="services-title">
      <div className="section-head">
        <h2 id="services-title">Services</h2>
        <p>
          What CAR MAX offers, based on the shop’s public profile and posts. Prices are not listed. Send your vehicle details for options and a quote.
        </p>
      </div>
      <ul className="service-list">
        {publicServices.map((s) => {
          const ch = s.chapter ? chapters.findIndex((c) => c.id === s.chapter) : -1
          return (
            <li key={s.id} className="service">
              <div className="service-main">
                <h3>{s.name}</h3>
                <span className={`status status--${s.status}`}>{statusLabel[s.status]}</span>
              </div>
              <p className="service-summary">{s.summary}</p>
              {s.publicNote && <p className="service-note">{s.publicNote}</p>}
              <div className="row">
                <button
                  className="btn btn--small"
                  onClick={() => {
                    ui.set({ enquiryService: s.id })
                    scrollToId('enquiry')
                  }}
                >
                  Ask about this
                </button>
                {ch > 0 && mode !== 'fallback' && (
                  <button
                    className="link-btn"
                    onClick={() => jumpToChapter(ch, true)}
                  >
                    See it in the tour
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
