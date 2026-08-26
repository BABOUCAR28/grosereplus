// Page publique /a-propos — dynamique (API /public/identite-site).
import { Target, Eye, ShieldCheck, Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import useDonneesPubliques from '../hooks/useDonneesPubliques.js';
import { getIdentiteSitePublique } from '../api/public.api.js';

// Repli statique le temps du premier chargement — voir identite.apropos,
// modifiable depuis Administration → Paramètres → Identité du site public.
const APROPOS_PAR_DEFAUT = {
  heroBadge: 'À propos de nous',
  heroTitre: 'Un cabinet de conseil ancré dans les réalités du terrain',
  heroTexte:
    "GROSERE PLUS — Groupe SENE Relais Plus — est un cabinet de conseil, d'études et de gestion de projets. Nous intervenons dans les études, le conseil, la gestion de projets, la formation, le suivi-évaluation, la logistique, la facilitation, le plaidoyer et le marketing social.",
  missionTitre: 'Notre mission',
  missionTexte:
    'Offrir aux institutions publiques, privées, ONG, bailleurs de fonds et projets nationaux et internationaux une expertise de proximité de haut niveau, conforme aux standards internationaux.',
  visionTitre: 'Notre vision',
  visionTexte:
    "Devenir une référence en matière de conseil, d'études et de gestion de projets, reconnue pour la qualité et la fiabilité de ses interventions.",
  approcheTitre: 'Notre approche',
  approcheTexte:
    "Une équipe multidisciplinaire de consultants seniors, une écoute fine des besoins de nos clients et des méthodologies rigoureuses adaptées au contexte local.",
  valeursBadge: 'Nos valeurs',
  valeursTitre: 'Les principes qui guident chacune de nos missions',
  directionBadge: 'Direction',
};

export default function APropos() {
  const donneesParDefaut = {
    valeurs: [],
    managerGeneral: {},
    brochureUrl: '/brochure-grosere-plus.pdf',
    aproposImageUrl: '/images/brochure/equipe-reunion.jpg',
    apropos: APROPOS_PAR_DEFAUT,
  };
  const { donnees: identite, chargement } = useDonneesPubliques(
    getIdentiteSitePublique,
    donneesParDefaut,
    (res) => res.data?.data ?? donneesParDefaut
  );
  const { valeurs, managerGeneral, aproposImageUrl } = identite;
  const apropos = { ...APROPOS_PAR_DEFAUT, ...(identite.apropos || {}) };

  return (
    <SiteLayout>
      <SEO titre="À propos" description={apropos.heroTexte || apropos.heroTitre} />

      <section className="bg-primary-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">{apropos.heroBadge}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 max-w-2xl">
            {apropos.heroTitre}
          </h1>
          <p className="text-white/60 mt-6 max-w-2xl leading-relaxed">
            {apropos.heroTexte}
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">
          <Reveal className="rounded-2xl border border-gray-100 p-8 bg-white shadow-sm">
            <Target className="text-orange-500 mb-4" size={28} />
            <h2 className="text-xl font-bold text-primary-900 mb-3">{apropos.missionTitre}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{apropos.missionTexte}</p>
          </Reveal>
          <Reveal delai={100} className="rounded-2xl border border-gray-100 p-8 bg-white shadow-sm">
            <Eye className="text-accent-600 mb-4" size={28} />
            <h2 className="text-xl font-bold text-primary-900 mb-3">{apropos.visionTitre}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{apropos.visionTexte}</p>
          </Reveal>
          <Reveal delai={200} className="rounded-2xl border border-gray-100 p-8 bg-white shadow-sm">
            <ShieldCheck className="text-primary-700 mb-4" size={28} />
            <h2 className="text-xl font-bold text-primary-900 mb-3">{apropos.approcheTitre}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{apropos.approcheTexte}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">{apropos.valeursBadge}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">
              {apropos.valeursTitre}
            </h2>
          </Reveal>
          {chargement && (
            <div className="flex justify-center py-10 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}
          {!chargement && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
              {(valeurs || []).map((v, i) => (
                <Reveal key={v.titre} delai={i * 50}>
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 h-full shadow-sm">
                    <span className="text-2xl font-bold text-orange-500">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="font-semibold text-primary-900 mt-3">{v.titre}</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{v.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">
          <Reveal>
            <div className="aspect-[4/5] rounded-2xl relative overflow-hidden shadow-xl">
              <img src={aproposImageUrl || '/images/brochure/equipe-reunion.jpg'} alt="Rencontre professionnelle" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-transparent to-transparent" />
            </div>
          </Reveal>
          <Reveal delai={150}>
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">{apropos.directionBadge}</span>
            <h2 className="text-3xl font-bold text-primary-900 mt-4">
              {managerGeneral?.nom} — {managerGeneral?.poste}
            </h2>
            <p className="text-orange-600 font-medium text-sm mt-2">{managerGeneral?.specialite}</p>
            <p className="text-gray-600 mt-6 leading-relaxed">{managerGeneral?.bio}</p>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
