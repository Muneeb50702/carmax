// Business facts from CarMax_RYK_Website_Research_Brief.docx (researched 16 Oct 2026).
// Source IDs (S01…) refer to the brief's source register. Keep them here, not in the public UI.

export const business = {
  name: 'CAR MAX',
  displayName: 'CAR MAX RYK', // brief: use "CAR MAX RYK" to clarify location [S01]
  category: 'Automotive parts and accessories; car and Jeep decoration and modification', // [S01, S03]
  city: 'Rahim Yar Khan',
  region: 'Punjab, Pakistan',
  // Published spelling preserved until the client confirms it [S01].
  addressLines: ['Chanab commercial center, Shop no. 7–8', 'Near Unilever, Rahimyar Khan', 'Pakistan, 64200'],
  phoneLocal: '0326 8070222',
  phoneIntl: '+92 326 8070222',
  phoneHref: 'tel:+923268070222',
  email: 'carmax.ryk@gmail.com',
  emailHref: 'mailto:carmax.ryk@gmail.com',
  facebook: 'https://www.facebook.com/carmax.ryk/',
  instagram: 'https://www.instagram.com/carmax.ryk/',
  instagramHandle: '@carmax.ryk',
  // Listed on the Facebook profile; site content could not be inspected. Not shown publicly. [S01]
  domain: 'carmax.pk',
  // Not established for the published number. Flip only after the client confirms. [brief: Contact destinations]
  whatsappConfirmed: false,
  whatsappHref: 'https://wa.me/923268070222',
  // Unknown until supplied: opening hours, map pin, logo, brand colours, ratings, warranties.
} as const

export const enquiryTemplate = (service: string, vehicle: string) =>
  `Hi CAR MAX, I’m interested in ${service || '[service]'} for my ${vehicle || '[vehicle make, model, and year]'}. Please share the available options, estimated price, and installation time.`

export type SourceId = `S${string}`

export const sources: Record<SourceId, { title: string; url: string; note: string }> = {
  S01: { title: 'CAR MAX Facebook profile', url: 'https://www.facebook.com/carmax.ryk/', note: 'Identity, category, address, phone, email, linked domain. Full page access restricted.' },
  S02: { title: 'CAR MAX Instagram profile', url: 'https://www.instagram.com/carmax.ryk/', note: 'Supplied by the user; bio, counts and media not retrievable.' },
  S03: { title: 'Carmax ryk directory listing', url: 'https://yandex.com/maps/org/carmax_ryk/39450227711/', note: 'Matches city, category and phone. No reviews or hours.' },
  S04: { title: 'PPF service announcement', url: 'https://www.facebook.com/carmax.ryk/videos/now-started-paint-protection-filmppf/875163774422140/', note: 'Title announces PPF. No brand, warranty, price or spec.' },
  S05: { title: 'Oshan X7 sun visor and solar tint', url: 'https://www.facebook.com/carmax.ryk/videos/new-oshan-x7-equipped-with-txr-sun-visor-and-solar-tint/1219415592431825/', note: 'Historical project; current availability to confirm.' },
  S06: { title: 'Customized seat cover installation', url: 'https://www.facebook.com/carmax.ryk/videos/carmax-carlifestyle-carmodification/2233391674128399/', note: 'Urdu transcript: fitting and customizing seat covers for different cars.' },
  S07: { title: 'Exterior styling and lighting', url: 'https://www.facebook.com/carmax.ryk/posts/carmax-carmodification-ppfinstallation-carlifestyle-cars/1029382946549458/', note: 'Transcript: lights, spoiler, black roof, sun visors. Vehicle not established.' },
  S08: { title: 'Daihatsu Mira Android screen', url: 'https://www.facebook.com/carmax.ryk/videos/dihatsumira-cars/902292056230705/', note: 'Vehicle in title; transcript refers to an Android screen.' },
  S09: { title: 'Sportage tagged screen content', url: 'https://www.facebook.com/carmax.ryk/posts/ppfinstallation-carmodification-sportageclub-caraccesories/1062370453250707/', note: 'Sportage tag; transcript mentions a Nakamichi screen. No brand authorization.' },
  S10: { title: 'Suzuki Cultus seat cover content', url: 'https://www.facebook.com/carmax.ryk/posts/carmodification-carseatcovers-suzukicultus-ppfinstallation/1057248487096237/', note: 'Title tags: Cultus and seat covers.' },
  S11: { title: 'Toyota Revo canopy part two', url: 'https://www.facebook.com/carmax.ryk/videos/toyota-revo-canopy-part2carmax-toyota-toyotarevo/863803910119857/', note: 'Canopy spec, model year, availability and date unconfirmed.' },
  S12: { title: 'Sogo car ashtray post', url: 'https://www.facebook.com/carmax.ryk/posts/sogo-car-ashtray-compact-stylish-and-perfect-for-every-rideavailable-now-at-car-/870061972481557/', note: 'Historical product post; stock and price not established.' },
  S13: { title: 'Elantra Hybrid and wrapping tags', url: 'https://www.facebook.com/carmax.ryk/videos/carmodification-ppfinstallation-carmax-newelantrahybrid-carwrraping/1016763354682733/', note: 'Candidate project from tags only.' },
  S14: { title: 'Ambient lighting candidate', url: 'https://www.facebook.com/carmax.ryk/videos/carmax-ppfinstallation-carmodification-ppfinstallation-ambiantlight/1363648175845736/', note: 'Only the URL mentions ambient lighting. Follow-up lead.' },
  S15: { title: 'Deepal S05 tagged post', url: 'https://www.facebook.com/carmax.ryk/posts/deepalso5-ppfinstallation-carmodification-caraccesories/1068353882652364/', note: 'Indexed 21 Sep 2026; service performed unconfirmed.' },
  S16: { title: 'Accessories and PPF tagged post', url: 'https://www.facebook.com/carmax.ryk/posts/carmodification-ppfinstallation-carlifestyle-caraccesories/1076830921804660/', note: 'Indexed 30 Sep 2026; supports ongoing accessories/PPF theme.' },
}
