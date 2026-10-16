import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
// Browser checks used for the handoff. Start the site first (npm run dev or npm run preview, then BASE_URL=http://localhost:4173/).
// Uses CHROME_PATH if set (e.g. /usr/bin/google-chrome), otherwise Playwright's bundled Chromium (npx playwright install chromium).
const exe = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
const out = new URL('../test-results/', import.meta.url).pathname
mkdirSync(out, { recursive: true })
const URL = process.env.BASE_URL || 'http://localhost:5173/'
const results = []
const ok = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`)
const launch = (args = []) => chromium.launch({ ...exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...args] })

// 1. enquiry, dialog, filters, chapter nav, controls (desktop)
{
  const b = await launch()
  const page = await b.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(URL + '?quality=low&snap', { waitUntil: 'networkidle' })
  await page.waitForSelector('.stage.is-ready', { timeout: 60000 })

  // enquiry: empty submit shows errors, no result
  await page.locator('#enquiry').scrollIntoViewIfNeeded()
  await page.click('text=Prepare my enquiry')
  ok('enquiry blocks empty submit', (await page.locator('.field-error').count()) >= 3 && (await page.locator('.enquiry-result').count()) === 0)
  ok('focus moves to first invalid field', await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid') === 'true'))
  await page.fill('input[placeholder^="For example"]', 'Suzuki Cultus 2021')
  await page.locator('label.chip', { hasText: 'Custom seat covers' }).click()
  await page.fill('input[autocomplete="name"]', 'Test Person')
  await page.fill('input[type="tel"]', '0300 1234567')
  await page.click('text=Prepare my enquiry')
  const result = page.locator('.enquiry-result')
  ok('demo result shown', await result.isVisible())
  ok('result says nothing was sent', (await result.textContent()).includes('Demo: nothing has been sent'))
  const href = await page.locator('a', { hasText: 'Email this to CAR MAX' }).getAttribute('href')
  ok('mailto handoff prefilled', href.startsWith('mailto:carmax.ryk@gmail.com?subject=') && decodeURIComponent(href).includes('custom seat covers for my Suzuki Cultus 2021'))
  ok('no WhatsApp button (unconfirmed)', (await page.locator('text=Send on WhatsApp').count()) === 0)
  ok('no false success wording', !/(sent successfully|booking confirmed|we will contact you)/i.test(await page.textContent('body')))

  // "Ask about this" preselects service
  await page.locator('#services .service', { hasText: 'Paint protection film' }).locator('text=Ask about this').click()
  await page.waitForTimeout(600)
  ok('Ask about this preselects PPF', await page.locator('label.chip.is-on', { hasText: 'Paint protection film' }).count() === 1)

  // projects filter + dialog
  await page.locator('#projects').scrollIntoViewIfNeeded()
  const all = await page.locator('.folder').count()
  await page.locator('.filters .chip', { hasText: 'Pickup canopy accessories' }).click()
  const filtered = await page.locator('.folder').count()
  ok('project filter narrows cards', all === 10 && filtered === 1, `${all} → ${filtered}`)
  await page.locator('.folder').first().click()
  ok('project dialog opens', await page.locator('dialog.dialog[open]').isVisible())
  ok('dialog links original post', (await page.locator('dialog.dialog a[href*="facebook.com/carmax.ryk"]').count()) === 1)
  await page.screenshot({ path: `${out}/f-dialog.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  ok('Escape closes dialog', (await page.locator('dialog.dialog[open]').count()) === 0)

  // chapter navigation from rail
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.evaluate(() => document.querySelector('.rail').style.visibility = 'visible')
  await page.locator('.rail .rail-item', { hasText: 'Pickup canopy' }).click({ force: true })
  await page.waitForTimeout(1500)
  ok('rail jumps to canopy chapter', (await page.locator('.panel h2').textContent()) === 'Pickup canopy')
  // controls: state chip sets manual, Resume tour clears
  await page.locator('.panel .chip', { hasText: 'Open hatch' }).click()
  await page.waitForTimeout(400)
  ok('state chip pressed', (await page.locator('.panel .chip[aria-pressed="true"]', { hasText: 'Open hatch' }).count()) === 1)
  ok('Resume tour appears', await page.locator('text=Resume tour').isVisible())
  await page.screenshot({ path: `${out}/f-hatch.png` })
  await page.click('text=Resume tour')
  ok('Resume clears manual state', (await page.locator('text=Resume tour').count()) === 0)
  // skip tour
  await page.locator('.panel .link-btn', { hasText: 'Skip tour' }).click()
  await page.waitForTimeout(1200)
  ok('Skip tour reaches services', await page.evaluate(() => Math.abs(document.getElementById('services').getBoundingClientRect().top) < 120))
  // backward scroll through the tour reverses chapters
  const seen = []
  for (const p of [0.95, 0.7, 0.45, 0.2, 0.02]) {
    await page.evaluate((p) => { const s = document.getElementById('tour'), st = document.querySelector('.stage'); scrollTo(0, s.offsetTop + p * (s.offsetHeight - st.offsetHeight)) }, p)
    await page.waitForTimeout(500)
    seen.push(await page.locator('.panel-count').textContent())
  }
  ok('reverse scroll steps back through chapters', seen.join() === '8 of 8,6 of 8,4 of 8,2 of 8,1 of 8', seen.join(' | '))
  ok('no runtime errors', errors.length === 0, errors.slice(0, 3).join(' | '))
  await b.close()
}

// 2. reduced motion
{
  const b = await launch()
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.stage.is-ready', { timeout: 60000 })
  const h = await page.evaluate(() => document.getElementById('tour').offsetHeight / innerHeight)
  ok('reduced motion shortens tour', h < 10, `${h.toFixed(1)} screens`)
  await page.evaluate(() => { const s = document.getElementById('tour'), st = document.querySelector('.stage'); scrollTo(0, s.offsetTop + 0.2 * (s.offsetHeight - st.offsetHeight)) })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/f-reduced.png` })
  ok('reduced motion shows chapter still', (await page.locator('.panel h2').textContent()).length > 0)
  await b.close()
}

// 3. no WebGL → simple tour
{
  const b = await chromium.launch({ ...exe, args: ['--disable-webgl', '--disable-3d-apis'] })
  const page = await b.newPage({ viewport: { width: 390, height: 844 } })
  const reqs = []
  page.on('request', (r) => reqs.push(r.url()))
  await page.goto(URL, { waitUntil: 'networkidle' })
  ok('no-WebGL renders simple tour', await page.locator('.tour-simple').isVisible())
  ok('no-WebGL skips 3D chunk', !reqs.some((u) => /Stage|three/.test(u)))
  ok('no-WebGL keeps services/contact', (await page.locator('#services .service').count()) === 8 && (await page.locator('#contact a[href^="tel:"]').count()) >= 1)
  await page.screenshot({ path: `${out}/f-nogl.png` })
  ok('no horizontal overflow (no-WebGL)', (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) === 0)
  await b.close()
}

// 4. context loss
{
  const b = await launch()
  const page = await b.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(URL + '?quality=low', { waitUntil: 'networkidle' })
  await page.waitForSelector('.stage.is-ready', { timeout: 60000 })
  await page.evaluate(() => document.querySelector('.stage-canvas canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext())
  await page.waitForTimeout(500)
  ok('context loss shows recovery message', await page.locator('.stage-lost').isVisible())
  await page.screenshot({ path: `${out}/f-lost.png` })
  await page.click('text=Reload 3D view')
  await page.waitForSelector('.stage.is-ready', { timeout: 60000 }).catch(() => {})
  ok('reload restores 3D', await page.locator('.stage.is-ready .stage-canvas canvas').count() === 1)
  await b.close()
}
console.log(results.join("\n"))
if (results.some((r) => r.startsWith("FAIL"))) process.exitCode = 1
