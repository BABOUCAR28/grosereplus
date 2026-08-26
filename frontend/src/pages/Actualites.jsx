// Page publique /actualites — liste des articles (API /public/actualites).
import { Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import CarteArticle from '../components/public/CarteArticle.jsx';
import NewsletterForm from '../components/public/NewsletterForm.jsx';
import useDonneesPubliques from '../hooks/useDonneesPubliques.js';
import useCoordonneesSite from '../hooks/useCoordonneesSite.js';
import { getActualitesPubliques } from '../api/public.api.js';

export default function Actualites() {
  const { donnees: articles, chargement, erreur } = useDonneesPubliques(getActualitesPubliques);
  const { pagesIntro } = useCoordonneesSite();
  const intro = pagesIntro.actualites;

  return (
    <SiteLayout>
      <SEO
        titre="Blog & Actualités"
        description="Analyses, retours d'expérience et actualités de GROSERE PLUS sur les études, le suivi-évaluation, l'environnement et la gouvernance locale."
      />

      <section className="bg-primary-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">{intro.badge}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 max-w-2xl">{intro.titre}</h1>
          <p className="text-white/60 mt-6 max-w-2xl leading-relaxed">
            {intro.description}
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_320px] gap-14">
          <div className="content-start">
            {chargement && (
              <div className="flex justify-center py-16 text-gray-400">
                <Loader2 className="animate-spin" size={28} />
              </div>
            )}
            {!chargement && erreur && (
              <p className="text-center text-gray-500 text-sm">
                Impossible de charger les actualités pour le moment. Merci de réessayer plus tard.
              </p>
            )}
            {!chargement && !erreur && articles.length === 0 && (
              <p className="text-center text-gray-500 text-sm">Nos premières publications arrivent bientôt.</p>
            )}
            {!chargement && articles.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-8">
                {articles.map((a, i) => (
                  <Reveal key={a.id ?? a.slug} delai={i * 60}>
                    <CarteArticle article={a} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
          <aside>
            <div className="rounded-2xl bg-primary-900 p-7">
              <h3 className="text-lg font-bold text-white mb-2">Restez informé</h3>
              <p className="text-white/60 text-sm mb-5">
                Recevez nos dernières publications directement dans votre boîte mail.
              </p>
              <NewsletterForm />
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
