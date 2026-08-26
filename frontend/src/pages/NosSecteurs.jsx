// Page publique /nos-secteurs — dynamique (API /public/secteurs).
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import CarteSecteur from '../components/public/CarteSecteur.jsx';
import useDonneesPubliques from '../hooks/useDonneesPubliques.js';
import useCoordonneesSite from '../hooks/useCoordonneesSite.js';
import { getSecteursPublics } from '../api/public.api.js';

export default function NosSecteurs() {
  const { donnees: secteurs, chargement, erreur } = useDonneesPubliques(getSecteursPublics);
  const { pagesIntro } = useCoordonneesSite();
  const intro = pagesIntro.secteurs;

  return (
    <SiteLayout>
      <SEO
        titre="Nos Secteurs d'intervention"
        description="Éducation, santé, environnement, agriculture, élevage, pêche, gouvernance locale, décentralisation, plaidoyer, marketing social et suivi-évaluation."
      />

      <section className="bg-primary-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">{intro.badge}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 max-w-2xl">
            {intro.titre}
          </h1>
          <p className="text-white/60 mt-6 max-w-2xl leading-relaxed">
            {intro.description}
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          {chargement && (
            <div className="flex justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
          )}
          {!chargement && erreur && (
            <p className="text-center text-gray-500 text-sm">
              Impossible de charger nos secteurs pour le moment. Merci de réessayer plus tard.
            </p>
          )}
          {!chargement && !erreur && secteurs.length === 0 && (
            <p className="text-center text-gray-500 text-sm">La liste de nos secteurs sera bientôt publiée ici.</p>
          )}
          {!chargement && secteurs.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {secteurs.map((s, i) => (
                <Reveal key={s.id ?? s.slug} delai={i * 40}>
                  <CarteSecteur secteur={s} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Votre secteur ne figure pas dans la liste ?</h2>
            <p className="text-white/60 mt-3">Notre réseau de consultants couvre un large éventail de compétences. Parlons-en.</p>
          </div>
          <Link
            to="/nous-contacter"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-7 py-3.5 transition-colors shrink-0"
          >
            Contactez-nous <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
