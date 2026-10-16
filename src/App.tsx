import { About } from './components/About'
import { Contact } from './components/Contact'
import { Enquiry } from './components/Enquiry'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { MobileDock } from './components/MobileDock'
import { ProjectDialog, Projects } from './components/Projects'
import { Services } from './components/Services'
import { Tour } from './components/Tour'
import { useUI } from './tour/store'

export default function App() {
  const quality = useUI((s) => s.quality)

  return (
    <div className={`app q-${quality}`}>
      <a className="skip-link" href="#services">Skip to services</a>
      <Header />
      <main id="main">
        <Tour />
        <Services />
        <Projects />
        <About />
        <Enquiry />
        <Contact />
        <Faq />
      </main>
      <Footer />
      <MobileDock />
      <ProjectDialog />
    </div>
  )
}
