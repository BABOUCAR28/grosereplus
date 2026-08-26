// Page publique /actualites/:slug — détail d'un article (API /public/actualites/:slug).
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import { getActualiteParSlug } from '../api/public.api.js';
import { IMAGES } from '../data/imagesStock.js';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DetailActualite() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setIntrouvable(false);
    getActualiteParSlug(slug)
      .then((res) => {
        if (!annule) setArticle(res.data?.data ?? null);
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

  if (introuvable || !article) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="text-2xl font-bold text-primary-900">Article introuvable</h1>
          <p className="text-gray-500 mt-3">Cet article n'existe pas ou n'est plus publié.</p>
          <Link to="/actualites" className="inline-flex items-center gap-2 mt-6 text-accent-600 font-semibold hover:text-orange-600">
            <ArrowLeft size={16} /> Retour aux actualités
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SEO titre={article.titre} description={article.extrait} />

      <section className="bg-primary-900 py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Link to="/actualites" className="inline-flex items-center gap-2 text-white/60 hover:text-orange-400 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Retour aux actualités
          </Link>
          {article.categorie && (
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">{article.categorie}</span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 leading-tight">{article.titre}</h1>
          <div className="flex flex-wrap items-center gap-5 text-white/50 text-sm mt-6">
            {article.date_publication && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {formatDate(article.date_publication)}
              </span>
            )}
            {article.temps_lecture && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {article.temps_lecture} de lecture
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="aspect-[21/9] relative">
        <img src={article.image_url || IMAGES.teamLaptops} alt={article.titre} className="w-full h-full object-cover" />
      </div>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="prose max-w-none">
              {article.contenu
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraphe, i) => (
                  <p key={i} className="mb-4 leading-relaxed text-gray-700">
                    {paragraphe}
                  </p>
                ))}
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
