import { business } from '../content/business'

export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="section-head">
        <h2 id="about-title">About CAR MAX</h2>
        <p>
          CAR MAX provides car accessories and customization in Rahim Yar Khan. Explore selected projects, compare upgrade options, and contact the shop about work suited to your
          vehicle.
        </p>
      </div>
      <dl className="facts facts--wide">
        <div>
          <dt>What the shop lists</dt>
          <dd>{business.category}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>
            {business.city}, {business.region}
          </dd>
        </div>
        <div>
          <dt>Where to see recent work</dt>
          <dd>
            <a href={business.facebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>{' '}
            and{' '}
            <a href={business.instagram} target="_blank" rel="noopener noreferrer">
              Instagram {business.instagramHandle}
            </a>
          </dd>
        </div>
        <div>
          <dt>About this page</dt>
          <dd>The 3D studio is a virtual concept for explaining services. It is not the shop, and its parts are not product specifications.</dd>
        </div>
      </dl>
    </section>
  )
}
