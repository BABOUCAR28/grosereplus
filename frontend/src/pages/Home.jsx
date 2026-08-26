// Page publique / (accueil) — dynamique (identité, services, secteurs, témoignages).
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import CarteService from '../components/public/CarteService.jsx';
import CarteSecteur from '../components/public/CarteSecteur.jsx';
import CarteRealisation from '../components/public/CarteRealisation.jsx';
import Temoignages from '../components/public/Temoignages.jsx';
import FAQAccordeon from '../components/public/FAQAccordeon.jsx';
import { getServicesPublics, getSecteursPublics, getIdentiteSitePublique } from '../api/public.api.js';
import useDonneesPubliques from '../hooks/useDonneesPubliques.js';
import { getRealisationsPubliques } from '../api/public.api.js';

// Repli statique le temps du premier chargement (voir identite.stats,
// modifiable depuis Administration → Paramètres → Identité du site public).
const STATS_PAR_DEFAUT = [
  { valeur: '12+', label: "Années d'expertise" },
  { valeur: '80+', label: 'Missions réalisées' },
  { valeur: '13', label: "Secteurs d'intervention" },
  { valeur: '20+', label: 'Consultants seniors' },
];

const ACCUEIL_PAR_DEFAUT = {
  heroBadge: 'Cabinet de conseil et d\'études',
  heroTitre: "L'expertise de proximité, au service de vos projets de développement",
  heroDescription:
    "GROSERE PLUS accompagne institutions publiques, ONG, bailleurs de fonds et entreprises privées dans leurs études, la gestion de leurs projets, la formation de leurs équipes et le suivi-évaluation de leurs interventions au Sénégal et en Afrique de l'Ouest.",
  heroTags: ['Institutions publiques', 'ONG', 'Bailleurs de fonds', 'Projets nationaux & internationaux'],
  heroImageCitation: 'Une équipe multidisciplinaire, une expertise de haut niveau.',
  heroBadgeChiffre: '13',
  heroBadgeTexte: "Secteurs d'intervention couverts à travers le Sénégal et l'Afrique de l'Ouest",
  missionTitre: 'Une expertise de proximité, conforme aux standards internationaux',
  missionTexte:
    "GROSERE PLUS (Groupe SENE Relais Plus) offre aux institutions publiques, privées, ONG, bailleurs de fonds et projets nationaux et internationaux une expertise de haut niveau, ancrée dans les réalités locales. Notre cabinet mobilise une équipe multidisciplinaire de consultants seniors pour répondre avec rigueur et créativité aux enjeux du développement au Sénégal et en Afrique de l'Ouest.",
};

export default function Home() {
  const { donnees: realisations, chargement: chargementRealisations } = useDonneesPubliques(getRealisationsPubliques);
  const { donnees: services, chargement: chargementServices } = useDonneesPubliques(getServicesPublics);
  const { donnees: secteurs, chargement: chargementSecteurs } = useDonneesPubliques(getSecteursPublics);
  const { donnees: identite } = useDonneesPubliques(
    getIdentiteSitePublique,
    {
      valeurs: [],
      managerGeneral: {},
      brochureUrl: '/brochure-grosere-plus.pdf',
      heroImageUrl: '/images/brochure/equipe-reunion.jpg',
      stats: STATS_PAR_DEFAUT,
      accueil: ACCUEIL_PAR_DEFAUT,
    },
    (res) =>
      res.data?.data ?? {
        valeurs: [],
        managerGeneral: {},
        brochureUrl: '/brochure-grosere-plus.pdf',
        heroImageUrl: '/images/brochure/equipe-reunion.jpg',
        stats: STATS_PAR_DEFAUT,
        accueil: ACCUEIL_PAR_DEFAUT,
      }
  );
  const accueil = identite.accueil || ACCUEIL_PAR_DEFAUT;
  const heroImageUrl = identite.heroImageUrl || '/images/brochure/equipe-reunion.jpg';

  return (
    <SiteLayout>
      <SEO titre="Accueil" description={accueil.heroDescription} />

      {/* HERO — photo de fond pleine largeur, modifiable depuis
          Administration → Paramètres → Identité du site public. */}
      <section className="relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0">
          <img
            src={heroImageUrl}
            alt="GROSERE PLUS — accompagnement de projets de développement"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/85 to-primary-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-transparent to-primary-900/30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
              <ShieldCheck size={14} /> {accueil.heroBadge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[3.3rem] font-bold text-white leading-tight mt-5">
              {accueil.heroTitre}
            </h1>
            <p className="text-white/70 text-lg mt-6 max-w-xl leading-relaxed">
              {accueil.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-9">
              <Link
                to="/nous-contacter"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-7 py-3.5 transition-colors"
              >
                Discuter de votre projet <ArrowRight size={18} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-12 text-white/60 text-xs uppercase tracking-widest">
              {(accueil.heroTags?.length ? accueil.heroTags : ACCUEIL_PAR_DEFAUT.heroTags).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="text-white/85 text-lg italic mt-10 border-l-2 border-orange-400 pl-4 max-w-md">
              « {accueil.heroImageCitation} »
            </p>
          </div>

          <div className="hidden md:block absolute right-6 top-20 bg-white rounded-2xl shadow-xl p-5 w-56">
            <p className="text-3xl font-bold text-primary-900">{accueil.heroBadgeChiffre}</p>
            <p className="text-xs text-gray-500 mt-1">{accueil.heroBadgeTexte}</p>
          </div>
          <div className="md:hidden mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 max-w-xs">
            <p className="text-3xl font-bold text-white">{accueil.heroBadgeChiffre}</p>
            <p className="text-xs text-white/70 mt-1">{accueil.heroBadgeTexte}</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary-900 py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {(identite.stats?.length ? identite.stats : STATS_PAR_DEFAUT).map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white">{s.valeur}</p>
              <p className="text-white/60 text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Notre mission</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">
              {accueil.missionTitre}
            </h2>
            <p className="text-gray-600 mt-8 leading-relaxed">
              {accueil.missionTexte}
            </p>
            <Link
              to="/a-propos"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-accent-600 hover:text-orange-600 transition-colors"
            >
              Découvrir le cabinet <ArrowRight size={16} />
            </Link>
          </Reveal>
          <Reveal delai={150}>
            <div className="grid sm:grid-cols-2 gap-4">
              {(identite.valeurs || []).slice(0, 6).map((v) => (
                <div key={v.titre} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <CheckCircle2 size={18} className="text-accent-600 mb-3" />
                  <h3 className="font-semibold text-primary-900 text-sm">{v.titre}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">Nos métiers</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">
              Des services conçus pour accompagner chaque étape de vos projets
            </h2>
          </Reveal>
          {chargementServices && (
            <div className="flex justify-center py-10 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}
          {!chargementServices && services.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
              {services.slice(0, 6).map((s, i) => (
                <Reveal key={s.id ?? s.slug} delai={i * 60}>
                  <CarteService service={s} />
                </Reveal>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/nos-services"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 hover:bg-primary-900 hover:text-white px-6 py-3 text-sm font-semibold transition-colors"
            >
              Voir tous nos services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTEURS */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">
              Secteurs d'intervention
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">
              Une expertise sectorielle large, au cœur des enjeux de développement
            </h2>
          </Reveal>
          {chargementSecteurs && (
            <div className="flex justify-center py-10 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}
          {!chargementSecteurs && secteurs.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
              {secteurs.slice(0, 8).map((s, i) => (
                <Reveal key={s.id ?? s.slug} delai={i * 50}>
                  <CarteSecteur secteur={s} />
                </Reveal>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/nos-secteurs"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 hover:bg-primary-900 hover:text-white px-6 py-3 text-sm font-semibold transition-colors"
            >
              Voir tous les secteurs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* REALISATIONS */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">Réalisations</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">
              Des missions menées auprès d'institutions exigeantes
            </h2>
          </Reveal>
          {chargementRealisations && (
            <div className="flex justify-center py-10 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}
          {!chargementRealisations && realisations.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
              {realisations.slice(0, 3).map((p, i) => (
                <Reveal key={p.id ?? i} delai={i * 80}>
                  <CarteRealisation realisation={p} index={i} />
                </Reveal>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/realisations"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 hover:bg-primary-900 hover:text-white px-6 py-3 text-sm font-semibold transition-colors"
            >
              Voir toutes nos réalisations <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">Témoignages</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">Ce que disent nos clients</h2>
          </Reveal>
          <Reveal>
            <Temoignages />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">
              Questions fréquentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">Vous avez des questions ?</h2>
          </Reveal>
          <Reveal>
            <FAQAccordeon />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white max-w-xl">Un projet à nous confier ?</h2>
            <p className="text-white/60 mt-3 max-w-lg">
              Parlons de vos besoins et construisons ensemble la meilleure approche.
            </p>
          </div>
          <Link
            to="/nous-contacter"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-7 py-3.5 transition-colors shrink-0"
          >
            Contactez-nous <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Accès plateforme interne */}
      <section className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>Vous êtes membre de l'équipe GROSERE PLUS ?</p>
          <div className="flex gap-4">
            <Link to="/connexion" className="font-medium text-primary-900 hover:text-orange-600">
              Se connecter à la plateforme
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
