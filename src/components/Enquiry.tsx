import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { business, enquiryTemplate } from '../content/business'
import { publicServices } from '../content/services'
import { useUI } from '../tour/store'

const vehicleTypes = ['Car', 'SUV', 'Pickup', 'Jeep', 'Other']
type Method = 'phone' | 'email'
type Errors = Partial<Record<'vehicle' | 'services' | 'name' | 'contact', string>>

const digits = (s: string) => s.replace(/\D/g, '')

export function Enquiry() {
  const preset = useUI((s) => s.enquiryService)
  const [vehicleType, setVehicleType] = useState('Car')
  const [vehicle, setVehicle] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [method, setMethod] = useState<Method>('phone')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [result, setResult] = useState<string | null>(null)
  const [copy, setCopy] = useState<'idle' | 'busy' | 'done' | 'failed'>('idle')
  const resultRef = useRef<HTMLDivElement>(null)
  const id = useId()

  // "Ask about this" anywhere on the page preselects the service.
  useEffect(() => {
    if (preset) setPicked((p) => (p.includes(preset) ? p : [...p, preset]))
  }, [preset])

  const serviceText = picked.map((s) => publicServices.find((x) => x.id === s)?.name.toLowerCase()).join(' and ')
  const vehicleText = vehicle.trim() ? `${vehicle.trim()} (${vehicleType.toLowerCase()})` : ''
  const body = [
    enquiryTemplate(serviceText, vehicleText),
    message.trim() && `\n${message.trim()}`,
    `\nName: ${name.trim()}`,
    method === 'phone' ? `Please call me on ${contact.trim()}.` : `Please reply to ${contact.trim()}.`,
  ]
    .filter(Boolean)
    .join('\n')
  const mailto = `${business.emailHref}?subject=${encodeURIComponent(`Enquiry: ${serviceText || 'vehicle upgrade'}${vehicle.trim() ? ` for ${vehicle.trim()}` : ''}`)}&body=${encodeURIComponent(body)}`

  function submit(e: FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (vehicle.trim().length < 2) next.vehicle = 'Add the make, model and year, for example Suzuki Cultus 2021.'
    if (!picked.length) next.services = 'Choose at least one service.'
    if (!name.trim()) next.name = 'Add your name so the shop knows who is asking.'
    if (method === 'phone' && digits(contact).length < 10) next.contact = 'Add a phone number with at least 10 digits.'
    if (method === 'email' && !/^\S+@\S+\.\S+$/.test(contact.trim())) next.contact = 'Add an email address like name@example.com.'
    setErrors(next)
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0]
      document.getElementById(`${id}-${first}`)?.focus()
      setResult(null)
      return
    }
    setResult(body)
    setCopy('idle')
    requestAnimationFrame(() => resultRef.current?.focus())
  }

  async function copyMessage() {
    if (!result) return
    setCopy('busy')
    try {
      await navigator.clipboard.writeText(result)
      setCopy('done')
    } catch {
      setCopy('failed')
    }
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p className="field-error" id={`${id}-${k}-err`}>
        {errors[k]}
      </p>
    ) : null
  const described = (k: keyof Errors) => (errors[k] ? `${id}-${k}-err` : undefined)

  return (
    <section id="enquiry" className="section enquiry" aria-labelledby="enquiry-title">
      <div className="section-head">
        <h2 id="enquiry-title">Request a quote</h2>
        <p>Tell CAR MAX about your vehicle and the work you want. This demo prepares your message; you send it yourself by email or phone.</p>
      </div>
      <form className="enquiry-form glass-solid" onSubmit={submit} noValidate>
        <fieldset className="step">
          <legend>
            <span className="step-num">1</span> Your vehicle
          </legend>
          <div className="chips" role="radiogroup" aria-label="Vehicle type">
            {vehicleTypes.map((t) => (
              <label key={t} className={`chip ${vehicleType === t ? 'is-on' : ''}`}>
                <input type="radio" name="vehicleType" value={t} checked={vehicleType === t} onChange={() => setVehicleType(t)} />
                {t}
              </label>
            ))}
          </div>
          <label className="field">
            <span>Make, model and year</span>
            <input
              id={`${id}-vehicle`}
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="For example Suzuki Cultus 2021"
              autoComplete="off"
              aria-invalid={!!errors.vehicle}
              aria-describedby={described('vehicle')}
            />
          </label>
          {err('vehicle')}
        </fieldset>

        <fieldset className="step" aria-describedby={described('services')}>
          <legend>
            <span className="step-num">2</span> The work
          </legend>
          <div className="chips" id={`${id}-services`} tabIndex={-1}>
            {publicServices.map((s) => {
              const on = picked.includes(s.id)
              return (
                <label key={s.id} className={`chip ${on ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))} />
                  {s.name}
                </label>
              )
            })}
          </div>
          {err('services')}
          <label className="field">
            <span>Anything else (optional)</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Colour preferences, timing, questions" />
          </label>
        </fieldset>

        <fieldset className="step">
          <legend>
            <span className="step-num">3</span> How the shop can reach you
          </legend>
          <label className="field">
            <span>Your name</span>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={described('name')}
            />
          </label>
          {err('name')}
          <div className="chips" role="radiogroup" aria-label="Preferred contact">
            {(['phone', 'email'] as const).map((m) => (
              <label key={m} className={`chip ${method === m ? 'is-on' : ''}`}>
                <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} />
                {m === 'phone' ? 'Phone call' : 'Email'}
              </label>
            ))}
          </div>
          <label className="field">
            <span>{method === 'phone' ? 'Phone number' : 'Email address'}</span>
            <input
              id={`${id}-contact`}
              type={method === 'phone' ? 'tel' : 'email'}
              inputMode={method === 'phone' ? 'tel' : 'email'}
              autoComplete={method === 'phone' ? 'tel' : 'email'}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              aria-invalid={!!errors.contact}
              aria-describedby={described('contact')}
            />
          </label>
          {err('contact')}
        </fieldset>

        <button className="btn btn--primary btn--wide" type="submit">
          Prepare my enquiry
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="enquiry-result glass-solid" role="status" tabIndex={-1}>
          <p className="demo-flag">Demo: nothing has been sent</p>
          <p>This demo has no connected inbox. Your message is ready below. Send it to CAR MAX yourself:</p>
          <pre className="message">{result}</pre>
          <div className="row">
            <a className="btn btn--primary" href={mailto}>
              Email this to CAR MAX
            </a>
            <a className="btn" href={business.phoneHref}>
              Call {business.phoneLocal}
            </a>
            {business.whatsappConfirmed && (
              <a className="btn" href={`${business.whatsappHref}?text=${encodeURIComponent(result)}`} target="_blank" rel="noopener noreferrer">
                Send on WhatsApp
              </a>
            )}
            <button className={`btn ${copy === 'busy' ? 'is-loading' : ''}`} onClick={copyMessage} disabled={copy === 'busy'}>
              {copy === 'busy' && <span className="spinner" aria-hidden="true" />}
              {copy === 'done' ? 'Message copied' : copy === 'failed' ? 'Copy blocked: select the text instead' : 'Copy message'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
