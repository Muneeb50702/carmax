import type { SourceId } from './business'

// status: how strong the public evidence is (brief table "Services supported by public evidence").
//  core       – profile category or dedicated launch post
//  documented – installations shown in posts; options and pricing still to confirm
//  reference  – historical project; current availability to confirm
//  candidate  – mentioned only in tags/URLs; NOT shown publicly until the client confirms
export type ServiceStatus = 'core' | 'documented' | 'reference' | 'candidate'

export type Service = {
  id: string
  name: string
  summary: string
  status: ServiceStatus
  publicNote?: string
  chapter?: string // tour chapter id that demonstrates it
  sources: SourceId[]
  toConfirm: string // handoff only
}

export const services: Service[] = [
  {
    id: 'ppf',
    name: 'Paint protection film',
    summary: 'A clear film applied over painted panels. CAR MAX announced its PPF service and regularly tags PPF installations.',
    status: 'core',
    publicNote: 'Ask the shop about film options, coverage, finish and care.',
    chapter: 'ppf',
    sources: ['S04', 'S16'],
    toConfirm: 'Film brands, grades, finishes, coverage choices, thickness, installation time, care, written warranty.',
  },
  {
    id: 'accessories',
    name: 'Car accessories and modification',
    summary: 'The shop lists automotive parts and accessories, plus car and Jeep decoration and modification.',
    status: 'core',
    publicNote: 'Stock and prices are given on request.',
    sources: ['S01', 'S03'],
    toConfirm: 'Maintained catalogue, stock rules, prices, accessory brands, supported models.',
  },
  {
    id: 'seat-covers',
    name: 'Custom seat covers',
    summary: 'Seat covers fitted and customized for different cars, including a Suzuki Cultus post.',
    status: 'documented',
    publicNote: 'Materials, fit options and colours are confirmed per vehicle.',
    chapter: 'interior',
    sources: ['S06', 'S10'],
    toConfirm: 'Materials, fit options, colours, pricing.',
  },
  {
    id: 'screens',
    name: 'Android infotainment screens',
    summary: 'Screen upgrades shown in posts, including an Android screen in a Daihatsu Mira.',
    status: 'documented',
    publicNote: 'Fit depends on the vehicle. Share make, model and year when you ask.',
    chapter: 'screen',
    sources: ['S08', 'S09'],
    toConfirm: 'Screen products, camera features, compatible models. No brand authorization established.',
  },
  {
    id: 'styling',
    name: 'Lighting and exterior styling',
    summary: 'Lights, a spoiler, a black roof and sun visors appear in an exterior styling post.',
    status: 'documented',
    publicNote: 'Exact products and installation options are confirmed per vehicle.',
    chapter: 'styling',
    sources: ['S07'],
    toConfirm: 'Exact products, vehicles, installation options.',
  },
  {
    id: 'visors-tint',
    name: 'Sun visors and solar tint',
    summary: 'A past project: an Oshan X7 fitted with a TXR sun visor and solar tint.',
    status: 'reference',
    publicNote: 'Past project. Ask whether this is currently available for your car.',
    chapter: 'visor',
    sources: ['S05'],
    toConfirm: 'Current availability, product specifications, tint shades permitted.',
  },
  {
    id: 'canopy',
    name: 'Pickup canopy accessories',
    summary: 'A past project: a canopy fitted to a Toyota Revo, shown in a two-part video.',
    status: 'reference',
    publicNote: 'Past project. Canopy types and compatible pickups are confirmed on request.',
    chapter: 'canopy',
    sources: ['S11'],
    toConfirm: 'Canopy types, compatible models, model year, availability.',
  },
  {
    id: 'small-accessories',
    name: 'Small interior accessories',
    summary: 'Interior extras such as a Sogo car ashtray advertised in a post.',
    status: 'reference',
    publicNote: 'Past post. Current stock is not listed here.',
    sources: ['S12'],
    toConfirm: 'Stock, SKU, price.',
  },
  {
    id: 'wrapping',
    name: 'Wrapping',
    summary: 'Appears in post tags only.',
    status: 'candidate',
    sources: ['S13'],
    toConfirm: 'Whether wrapping is offered at all.',
  },
  {
    id: 'ambient',
    name: 'Ambient lighting',
    summary: 'Appears in one video URL only.',
    status: 'candidate',
    sources: ['S14'],
    toConfirm: 'Whether ambient lighting is offered at all.',
  },
]

export const publicServices = services.filter((s) => s.status !== 'candidate')

export const statusLabel: Record<ServiceStatus, string> = {
  core: 'Core service',
  documented: 'Shown in posts',
  reference: 'Past project',
  candidate: 'To be confirmed',
}
