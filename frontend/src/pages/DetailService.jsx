// Page publique /nos-services/:categorie/:slug — détail d'un service (API /public/services/:slug).
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import IconeDynamique from '../components/public/IconeDynamique.jsx';
import { getServiceParSlug } from '../api/public.api.js';

// Étiquette lisible pour la colonne du mega menu (utilisée dans le fil
// d'Ariane) — reflète les clés de frontend/src/data/menuVitrine.js.
const LIBELLE_CATEGORIE = {
  conseil: 'Conseil',
  formation: 'Formation',
  etudes: 'Études',
  logistiques: 'Logistiques',
  rh: 'R.H',
};

export default function DetailService() {
  // Route déclarée dans App.jsx : /nos-services/:categorie/:slug
  const { categorie, slug } = useParams();
  const [service, setService] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setIntrouvable(false);
    getServiceParSlug(slug)
      .then((res) => {
        if (!annule) setService(res.data?.data ?? null);
      })
      .catch(() => {
        if (!annule) setIntrouvable(true);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [slug]);

  if (chargement) {
    return (
      <SiteLayout>
        <div className="flex justify-center py-32 text-gray-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      </SiteLayout>
    );
  }

  if (introuvable || !service) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="text-2xl font-bold text-primary-900">Service introuvable</h1>
          <p className="text-gray-500 mt-3">Ce service n'existe pas ou n'est plus publié.</p>
          <Link
            to="/nos-services"
            className="inline-flex items-center gap-2 mt-6 text-accent-600 font-semibold hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Retour à tous nos services
          </Link>
        </div>
      </SiteLayout>
    );
  }

  // La catégorie réelle du service (categorieMenu) prime sur celle de l'URL,
  // au cas où un lien externe/ancien pointerait vers la mauvaise colonne.
  const cle = service.categorieMenu || categorie;
  const libelleCategorie = LIBELLE_CATEGORIE[cle];

  return (
    <SiteLayout>
      <SEO titre={`${service.titre} — Nos Services`} description={service.resume} />

      <section className="bg-primary-900 py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-6">
            <Link to="/nos-services" className="hover:text-orange-400 transition-colors">
              Nos Services
            </Link>
            {libelleCategorie && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/nos-services/${cle}`} className="hover:text-orange-400 transition-colors">
                  {libelleCategorie}
                </Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-white/80">{service.titre}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
              <IconeDynamique nom={service.icone} size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{service.titre}</h1>
          </div>
          <p className="text-white/60 mt-6 max-w-2xl leading-relaxed">{service.resume}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <Reveal>
            <div className="prose max-w-none">
              {service.description
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraphe, i) => (
                  <p key={i} className="mb-4 leading-relaxed text-gray-700">
                    {paragraphe}
                  </p>
                ))}
            </div>
          </Reveal>

          {service.livrables?.length > 0 && (
            <Reveal>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 md:p-8">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Ce que nous livrons
                </h2>
                <ul className="space-y-3">
                  {service.livrables.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-8">
              <Link
                to={libelleCategorie ? `/nos-services/${cle}` : '/nos-services'}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-900 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft size={16} /> {libelleCategorie ? `Tous nos services — ${libelleCategorie}` : 'Tous nos services'}
              </Link>
              <Link
                to="/nous-contacter"
                className="ml-auto rounded-full bg-primary-900 text-white text-sm font-semibold px-6 py-3 hover:bg-orange-600 transition-colors"
              >
                Demander un devis
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
