# CAR MAX RYK — interactive 3D service tour (demo)

A demo website for CAR MAX RYK, a car accessories and modification shop in Rahim Yar Khan. A scroll-driven studio tour moves around and inside a vehicle and demonstrates each documented service. Normal HTML sections follow it: services, projects, about, enquiry, contact and FAQs.

This is a **demo concept**. The studio, vehicles and parts are illustrations. Nothing is sent from the enquiry form.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm test           # timeline self-checks (Node 22+, runs the .ts directly)
npm run test:e2e   # browser checks; start dev first (or preview + BASE_URL=http://localhost:4173/), optional CHROME_PATH
```

URL flags for testing:

| Flag | Effect |
| --- | --- |
| `?simple` | Simple tour without WebGL (the same view no-WebGL devices get) |
| `?quality=high\|mobile\|low` | Force a rendering tier instead of auto-detection |
| `?snap` | Turn off camera/animation damping so screenshots match the scroll position exactly |

## How it is built

React 19 + TypeScript + Vite, three.js through React Three Fiber and drei. There is one canvas and one scroll controller, with no scroll library.

```
src/content/      business facts, services, projects, FAQs (source IDs and evidence status live here)
src/tour/         chapters.ts (copy, camera keys, demos, controls, labels), timeline.ts (pure functions of scroll),
                  controller.ts (the only scroll reader), store.ts, params.ts, timeline.test.ts
src/three/        Stage (canvas, quality tiers, context loss), Studio (lighting, floor), rig (camera, labels)
src/three/vehicle surface.ts (parametric lofted body), layout.ts (panel maps), Suv, Pickup, Cabin, build
src/components/   page sections, tour overlay, simple tour fallback, illustrations
src/styles/       tokens.css + palette.ts (all colours, including the gradient), app.css
```

- **Vehicles are generated in code.** The project had no 3D assets. Both the SUV and the pickup are lofts of side-profile curves, a plan-view superellipse and wheel arches. Every panel is a rectangle in the same surface parameter space. Doors, hood, roof, glass, lamps, the film layer, visors, tint film and the canopy therefore share exact edges, separate cleanly and keep real shut-line gaps. Nothing is downloaded except the JS chunk.
- **The scroll timeline is a pure function of progress.** Scrolling back replays it in reverse, and a paused scroll always settles to the same state. `npm test` checks that no value jumps between chapters, that every demonstration ends reassembled, and that the camera path is continuous.
- **Progressive loading.** HTML content and navigation render first (about 87 KB gzipped). The 3D chunk (about 280 KB gzipped) loads lazily behind a poster image. Rendering stops while the tour is off screen.
- **Quality tiers.** *High* (desktop) adds a reflective floor and a moving light strip whose reflections travel over the paint. *Mobile* uses a lighter mesh, a static environment and a 1.5× pixel ratio cap. *Low* uses 1×, no antialiasing and no glass blur. An FPS monitor lowers resolution further if needed.

## What the visitor can do

- **Opening:** the "CAR MAX RYK" wordmark splits around a card showing the car. As you scroll, the card opens into the full studio and the wordmark stretches along the font's width axis and dissolves. The page offers "Explore the experience" and "Request a quote".
- **Paint protection film:** a clear sheet lifts above the hood, aligns, settles, and a squeegee light sweeps across it. An illustrative layer stack (film, clear coat, colour coat, primer and panel) separates and closes again. Controls: Lift film, Apply film, Layer view, Film layer on/off.
- **Lighting and exterior styling:** a roof spoiler separates and fits, the roof turns black, and the DRL and lamps come on. Controls: Separate or fit the spoiler, Black roof, Lamps.
- **Seat covers:** the driver's door swings open on its front hinge (right-hand drive). The camera enters the cabin, and the cover lifts off the existing seat and refits. The colour swatches are labelled as visual examples.
- **Infotainment screen:** the display, trim bezel and brackets come forward from the centre stack, then reassemble. The screen then shows a neutral illustrative display. Controls: Inspect installation, View screen.
- **Sun visors and solar tint (past project):** the camera leaves through the door and the door closes. Visors align to the door frames, and a tint film settles onto the side glass. An "Illustrative shade" slider is labelled as not being a tint rating.
- **Pickup canopy (past project):** the SUV drives out and a double-cab pickup drives in. The canopy lowers onto the bed rails, and its rear hatch swings up on top hinges with gas struts.
- **Final view:** the upgraded SUV returns, with actions to view projects or request a quote.

Throughout:
- Labels follow components with leader lines and avoid overlapping each other.
- Highlights use the gradient's colours.
- A chapter rail (desktop) or chapter bar and sheet (phones) lets you jump between chapters, and "Skip tour" is always available.
- Pressing a control pins that state; "Resume tour" hands control back to the scroll.
- The site is silent.

Below the tour:
- Services, with an evidence status for each.
- A project gallery with service filters and glass folder cards that tilt toward a mouse pointer.
- An accessible project dialog that links each card to the original public post.
- About, contact and FAQs.
- A three-step enquiry. It validates the input, then shows **"Demo: nothing has been sent"** with user-initiated handoffs: a prefilled email, a call link and "Copy message".

## Mobile, accessibility and fallbacks

- **Phone layout:** portrait phones get their own composition: a bottom panel with three-line text and "Read more", swipeable controls, a top chapter bar and a one-hand dock (Call / Services / Request a quote). Landscape phones get a compact side panel.
- **Framing:** the camera frames each subject into the screen area left free by the panel and bars, measured every frame. Portrait screens pull back or widen the view.
- **Touch and scrolling:** the canvas ignores pointer events, so page swipes always scroll. There are no orbit controls. Touch targets are at least 44 px. The layout handles safe areas and changing browser toolbar heights (`lvh`/`dvh`), and keeps the tour position across orientation changes.
- **Reduced motion:** `prefers-reduced-motion` gives a shorter tour of still, explained states with no camera travel.
- **Fallbacks:** without WebGL, on a render error, or when the visitor chooses "Simple view", the tour becomes plain content with line illustrations. If the WebGL context is lost, the page offers "Reload 3D view" or the simple tour.

## Testing done

All checks ran in headless Chrome 153 on Linux with **software WebGL (SwiftShader), using viewport emulation, not physical devices**:

- **Widths:** 320, 360, 390, 430, 768, 1024 and 1440, plus 844×390 landscape. No horizontal overflow at any of them, and no console errors (one deprecation warning comes from inside React Three Fiber).
- **Functional checks:**
  - enquiry validation and focus, the demo result wording, the mailto prefill, and no WhatsApp button
  - "Ask about this" preselecting the service
  - project filters and the dialog, including Escape to close
  - rail jumps, the state controls and "Resume tour", "Skip tour"
  - reverse scrolling through the chapters
  - the reduced-motion path, the no-WebGL path (it does not request the 3D chunk), and context-loss recovery

**Not done:** testing on real iOS or Android devices, frame-rate measurement on real GPUs, screen reader passes, and Safari or Firefox.

## Attribution and licences

- **3D:** no third-party models or textures. The vehicles, interior and studio are procedural, and the textures (grille mesh, quilting, brushed metal, screen) are drawn on canvas at runtime. `public/poster.jpg` is a render of this project's own scene.
- **Libraries:** three.js, @react-three/fiber and @react-three/drei (MIT). Archivo variable font via @fontsource (SIL Open Font License).
- **Gradient:** "Pipo" by Gustavo on 21st.dev (Apricot `#E6B093`, Sky blue `#A3CEFF`, Paper `#FAF9EF`). I read the values from the gradient's public recipe and use them as colours only; they are centralised in `src/styles/tokens.css` and `src/styles/palette.ts`.
- **Design references:** these 21st.dev pages were viewed for ideas only, and no source code was copied:
  - Scroll-Locked Video Hero (MIT), Hero Scrub (licence listed as unknown), Horizon Hero Section (MIT) and Desert Drift (licence unknown)
  - Timeline (MIT), Glass Folder Cards, Liquid Sculpture Hero and Contribution Skyline

  The listing pages showed descriptions and previews but not their source.

## Business details and assets to confirm before going live

Sources: `CarMax_RYK_Website_Research_Brief.docx`. Source IDs (S01–S16) and evidence notes are kept in `src/content/`, not in the public interface.

1. Who manages **carmax.pk**, and whether it is the intended domain. The site does not claim the business has no website.
2. **Address** spelling (published as "Chanab commercial center… Rahimyar Khan"), the **phone and email**, the **map pin**, and **opening hours**. None of these are shown beyond the published text.
3. **WhatsApp** on +92 326 8070222. The button is hidden until `whatsappConfirmed` is set to true in `src/content/business.ts`.
4. Current availability, one by one, of PPF, seat covers, screens, lighting and styling, sun visors and tint, canopies, and small accessories. **Wrapping** and **ambient lighting** are hidden as unconfirmed candidates.
5. **PPF details:** film brands, finishes, coverage, care and warranty. None are stated, and the layer stack is generic.
6. Screen products, camera features and compatible models. No brand relationship is implied, including the Nakamichi mention.
7. Seat cover materials and colours (the current swatches are examples), and canopy types and compatible pickups.
8. **Assets:** logo (SVG or PNG), brand colours to replace the gradient, a shopfront photo, and approved photos with captions, dates and vehicles for 6–10 projects. These replace the line illustrations through the `image` field in `src/content/projects.ts`.
9. Testimonials, prices and the booking process. None are shown.
10. A real enquiry destination, if wanted. The form currently only prepares a message for the visitor to send.
