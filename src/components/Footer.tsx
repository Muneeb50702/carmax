import { business } from '../content/business'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <p className="footer-brand">CAR MAX RYK</p>
          <p>Car accessories and PPF in Rahim Yar Khan.</p>
        </div>
        <div>
          <a href={business.phoneHref}>{business.phoneLocal}</a>
          <a href={business.emailHref}>{business.email}</a>
        </div>
        <div>
          <a href={business.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href={business.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
      </div>
      <p className="footer-note">
        Demo website concept prepared for CAR MAX RYK. The studio, vehicles and illustrations are not photographs of CAR MAX work or premises. Accent gradient: “Pipo” by Gustavo
        (21st.dev).
      </p>
    </footer>
  )
}
