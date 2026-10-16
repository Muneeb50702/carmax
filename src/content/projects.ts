import type { SourceId } from './business'

// Project leads from the brief's "Project and media research inventory".
// No original photos were available: every card uses a labelled concept illustration
// and links to the business's own public post. Replace `image` with client-approved originals.

export type Project = {
  id: string
  source: SourceId
  title: string
  vehicle?: string // only when named in the post title or tags
  service: string // matches a services.ts id
  evidence: string // what the public post actually shows/says — public wording
  status: string // short public caveat
  date?: string // only index dates stated in the brief
  illustration: 'ppf' | 'seat' | 'screen' | 'styling' | 'visor' | 'canopy' | 'accessory'
  image?: string // client-approved photo path, when supplied
  public: boolean
}

export const projects: Project[] = [
  {
    id: 'ppf-launch', source: 'S04', title: 'PPF service launch', service: 'ppf', illustration: 'ppf', public: true,
    evidence: 'Video announcing that CAR MAX has started paint protection film work.',
    status: 'Publication date not confirmed.',
  },
  {
    id: 'oshan-x7', source: 'S05', title: 'Oshan X7 sun visor and solar tint', vehicle: 'Oshan X7', service: 'visors-tint', illustration: 'visor', public: true,
    evidence: 'Video titled as a new Oshan X7 equipped with a TXR sun visor and solar tint.',
    status: 'Past project. Current availability to be confirmed.',
  },
  {
    id: 'seat-covers', source: 'S06', title: 'Customized seat covers', service: 'seat-covers', illustration: 'seat', public: true,
    evidence: 'Video in Urdu about fitting seat covers and customizing them for different cars.',
    status: 'Materials and terms to be confirmed.',
  },
  {
    id: 'styling', source: 'S07', title: 'Lights and exterior styling', service: 'styling', illustration: 'styling', public: true,
    evidence: 'Post describing installed lights, a spoiler, a black roof and sun visors.',
    status: 'Vehicle and full scope not named in the post.',
  },
  {
    id: 'mira-screen', source: 'S08', title: 'Android screen in a Daihatsu Mira', vehicle: 'Daihatsu Mira', service: 'screens', illustration: 'screen', public: true,
    evidence: 'Video of a Daihatsu Mira that refers to an Android screen.',
    status: 'Exact screen and model year to be confirmed.',
  },
  {
    id: 'sportage-screen', source: 'S09', title: 'Screen installation post', vehicle: 'Tagged: Sportage', service: 'screens', illustration: 'screen', public: true,
    evidence: 'Post tagged Sportage that discusses fitting a Nakamichi screen.',
    status: 'Model and product to be verified. No brand partnership implied.',
  },
  {
    id: 'cultus-seats', source: 'S10', title: 'Suzuki Cultus seat covers', vehicle: 'Suzuki Cultus', service: 'seat-covers', illustration: 'seat', public: true,
    evidence: 'Post tagged Suzuki Cultus and seat covers.',
    status: 'Fitted product details to be confirmed.',
  },
  {
    id: 'revo-canopy', source: 'S11', title: 'Toyota Revo canopy, part 2', vehicle: 'Toyota Revo', service: 'canopy', illustration: 'canopy', public: true,
    evidence: 'Video titled as part 2 of a Toyota Revo canopy project.',
    status: 'Past project. Canopy type and model year to be confirmed.',
  },
  {
    id: 'sogo-ashtray', source: 'S12', title: 'Sogo car ashtray', service: 'small-accessories', illustration: 'accessory', public: true,
    evidence: 'Post advertising a Sogo car ashtray at Car Max.',
    status: 'Past post. Stock and price not listed.',
  },
  {
    id: 'accessories-ppf', source: 'S16', title: 'Accessories and PPF post', service: 'ppf', illustration: 'ppf', public: true,
    evidence: 'Recent post tagged car accessories and PPF installation.',
    status: 'Specific work to be checked against the original post.',
    date: 'Indexed 30 Sep 2026',
  },
  // Candidates — kept out of the public gallery until the client confirms the work performed.
  {
    id: 'elantra-wrap', source: 'S13', title: 'Elantra Hybrid wrapping (candidate)', vehicle: 'Elantra Hybrid', service: 'wrapping', illustration: 'styling', public: false,
    evidence: 'Title tags mention Elantra Hybrid and wrapping.', status: 'Work and year unverified.',
  },
  {
    id: 'deepal-s05', source: 'S15', title: 'Deepal S05 post (candidate)', vehicle: 'Deepal S05', service: 'ppf', illustration: 'ppf', public: false,
    evidence: 'Post tagged Deepal S05, PPF installation and accessories.', status: 'Work performed unconfirmed.', date: 'Indexed 21 Sep 2026',
  },
]

export const publicProjects = projects.filter((p) => p.public)
