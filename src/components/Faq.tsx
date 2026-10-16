import { faq } from '../content/faq'

export function Faq() {
  return (
    <section id="faq" className="section faq" aria-labelledby="faq-title">
      <div className="section-head">
        <h2 id="faq-title">Questions</h2>
      </div>
      <div className="faq-list">
        {faq.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
