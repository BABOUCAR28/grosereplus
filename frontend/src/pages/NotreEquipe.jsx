// Page publique /notre-equipe — dynamique (API /public/consultants).
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import CarteConsultant from '../components/public/CarteConsultant.jsx';
import useDonneesPubliques from '../hooks/useDonneesPubliques.js';
import { getConsultantsPublics, getIdentiteSitePublique } from '../api/public.api.js';

const PAGES_INTRO_EQUIPE_PAR_DEFAUT = {
  badge: 'Notre équipe',
  titre: 'Une équipe multidisciplinaire de consultants seniors',
  description:
    "GROSERE PLUS s'appuie sur un vivier de consultants expérimentés, spécialisés dans les différents secteurs du développement, mobilisables individuellement ou en équipe selon vos besoins.",
};

export default function NotreEquipe() {
  const { donnees: consultants, chargement, erreur } = useDonneesPubliques(getConsultantsPublics);
  const { donnees: identite } = useDonneesPubliques(
    getIdentiteSitePublique,
    { valeurs: [], managerGeneral: {}, equipeImageUrl: '/images/brochure/atelier-travail.jpg', pagesIntro: { equipe: PAGES_INTRO_EQUIPE_PAR_DEFAUT } },
    (res) => res.data?.data ?? { valeurs: [], managerGeneral: {}, equipeImageUrl: '/images/brochure/atelier-travail.jpg', pagesIntro: { equipe: PAGES_INTRO_EQUIPE_PAR_DEFAUT } }
  );
  const managerGeneral = identite.managerGeneral || {};
  const equipeImageUrl = identite.equipeImageUrl || '/images/brochure/atelier-travail.jpg';
  const intro = identite.pagesIntro?.equipe || PAGES_INTRO_EQUIPE_PAR_DEFAUT;

  return (
    <SiteLayout>
      <SEO
        titre="Nos Consultants"
        description="Découvrez l'équipe multidisciplinaire de consultants seniors de GROSERE PLUS, dirigée par son Manager Général."
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

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="rounded-2xl bg-primary-900 relative overflow-hidden grid md:grid-cols-[0.6fr_1fr]">
              <div className="relative aspect-square md:aspect-auto">
                <img src={equipeImageUrl} alt="Équipe GROSERE PLUS en réunion" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary-900/40" />
                <div className="absolute bottom-5 left-5 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <span className="text-lg font-semibold text-white">MS</span>
                </div>
              </div>
              <div className="relative p-8 md:p-12">
                <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">Manager Général</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-3">{managerGeneral.nom}</h2>
                <p className="text-orange-400 font-medium text-sm mt-1">{managerGeneral.specialite}</p>
                <p className="text-white/65 mt-5 leading-relaxed max-w-xl">{managerGeneral.bio}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-10 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">Consultants seniors</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">
              Une expertise pluridisciplinaire mobilisable rapidement
            </h2>
          </Reveal>

          {chargement && (
            <div className="flex justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
          )}

          {!chargement && erreur && (
            <p className="text-center text-gray-500 text-sm">
              Impossible de charger l'équipe pour le moment. Merci de réessayer plus tard.
            </p>
          )}

          {!chargement && !erreur && consultants.length === 0 && (
            <p className="text-center text-gray-500 text-sm">
              La présentation détaillée de nos consultants sera bientôt disponible ici.
            </p>
          )}

          {!chargement && consultants.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {consultants.map((c, i) => (
                <Reveal key={c.id ?? i} delai={i * 60}>
                  <CarteConsultant consultant={c} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Besoin d'un profil spécifique ?</h2>
            <p className="text-white/60 mt-3">
              Décrivez-nous votre mission, nous mobilisons le ou les consultants les mieux adaptés.
            </p>
          </div>
          <Link
            to="/nous-contacter"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-7 py-3.5 transition-colors shrink-0"
          >
            Nous écrire <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
