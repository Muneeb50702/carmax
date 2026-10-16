import { business } from '../content/business'

export function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="section-head">
        <h2 id="contact-title">Contact the shop</h2>
        <p>Call before visiting to check timings.</p>
      </div>
      <div className="contact-grid">
        <a className="contact-phone" href={business.phoneHref}>
          <span className="contact-label">Telephone</span>
          <span className="contact-big">{business.phoneLocal}</span>
          <span className="contact-sub">International {business.phoneIntl}</span>
        </a>
        <div className="contact-block">
          <span className="contact-label">Email</span>
          <a href={business.emailHref}>{business.email}</a>
          <span className="contact-label">Social</span>
          <span>
            <a href={business.facebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            {' and '}
            <a href={business.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </span>
        </div>
        <address className="contact-block">
          <span className="contact-label">Shop address</span>
          {business.addressLines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </address>
      </div>
    </section>
  )
}
