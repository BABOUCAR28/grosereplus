// Page publique /nos-services (et /nos-services/:categorie) — dynamique (API /public/services).
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import IconeDynamique from '../components/public/IconeDynamique.jsx';
import useDonneesPubliques from '../hooks/useDonneesPubliques.js';
import { getServicesPublics } from '../api/public.api.js';
import { CATEGORIES_MENU } from '../data/menuVitrine.js';

// Habillage (titre, accroche, méta SEO) propre à chaque colonne du mega
// menu — affiché uniquement quand la page est visitée via
// /nos-services/:categorie. Sans correspondance (route générique
// /nos-services), la page affiche l'ensemble des services publiés.
const HABILLAGE_PAR_CATEGORIE = {
  conseil: {
    accroche: 'Conseil',
    titre: 'Un accompagnement stratégique pour vos décisions institutionnelles',
    description:
      "Facilitation, accompagnement, développement local, environnement, santé et éducation, entreprenariat : nos consultants seniors éclairent vos choix les plus structurants.",
  },
  formation: {
    accroche: 'Formation',
    titre: 'Des parcours de formation pour un transfert de compétences durable',
    description:
      "Leadership, gestion organisationnelle, finances, gestion de projet, métiers d'entreprise : des sessions conçues sur mesure pour renforcer durablement vos équipes.",
  },
  etudes: {
    accroche: 'Études',
    titre: 'Des données fiables pour fonder vos décisions',
    description:
      "Prospection, études de base, suivi-évaluation, études filières : une expertise de terrain rigoureuse, alignée sur les standards internationaux.",
  },
  logistiques: {
    accroche: 'Logistiques',
    titre: 'Une organisation logistique fiable au service de vos missions',
    description:
      "Location de véhicules, logistique d'évènements, comptabilité, assistance administrative : une prise en charge complète, du terrain au reporting.",
  },
  rh: {
    accroche: 'R.H',
    titre: 'Des ressources humaines mobilisables selon vos besoins',
    description:
      "Intérim, consultance, contrats : un vivier d'experts qualifiés, mobilisables individuellement ou en équipe pluridisciplinaire.",
  },
};

export default function NosServices() {
  const { categorie } = useParams();
  const habillage = categorie ? HABILLAGE_PAR_CATEGORIE[categorie] : null;
  // Catégorie présente dans l'URL mais inconnue (lien cassé, faute de frappe) :
  // on retombe silencieusement sur la liste complète plutôt que sur une page
  // vide ou une 404 — le backend applique la même tolérance côté filtre.
  const categorieValide = habillage ? categorie : undefined;

  const { donnees: services, chargement, erreur } = useDonneesPubliques(
    () => getServicesPublics(categorieValide),
    [],
    undefined,
    [categorieValide]
  );

  return (
    <SiteLayout>
      <SEO
        titre={habillage ? `Nos Services — ${habillage.accroche}` : 'Nos Services'}
        description={
          habillage
            ? habillage.description
            : "Ingénierie de projets, conseil stratégique, études socio-économiques, EIES, formation, suivi-évaluation, logistique et mise à disposition de consultants."
        }
      />

      <section className="bg-primary-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          {habillage && (
            <Link
              to="/nos-services"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-orange-400 transition-colors mb-6"
            >
              <ArrowLeft size={15} /> Tous nos services
            </Link>
          )}
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            {habillage ? habillage.accroche : 'Nos métiers'}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 max-w-2xl">
            {habillage ? habillage.titre : 'Des services complets pour accompagner vos projets, de A à Z'}
          </h1>
          <p className="text-white/60 mt-6 max-w-2xl leading-relaxed">
            {habillage
              ? habillage.description
              : "De la conception à l'évaluation, GROSERE PLUS met à votre disposition une gamme complète de services conçus pour répondre aux exigences des institutions publiques, privées, ONG et bailleurs de fonds."}
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {chargement && (
            <div className="flex justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
          )}
          {!chargement && erreur && (
            <p className="text-center text-gray-500 text-sm">
              Impossible de charger nos services pour le moment. Merci de réessayer plus tard.
            </p>
          )}
          {!chargement && !erreur && services.length === 0 && (
            <p className="text-center text-gray-500 text-sm">
              {habillage
                ? `Le détail de nos services « ${habillage.accroche} » sera bientôt publié ici.`
                : 'Le détail de nos services sera bientôt publié ici.'}
            </p>
          )}
          {!chargement &&
            services.map((s, i) => (
              <Reveal key={s.id ?? s.slug} delai={i * 30}>
                <div
                  id={s.slug}
                  className="grid md:grid-cols-[auto_1fr_1fr] gap-6 md:gap-10 items-start rounded-2xl border border-gray-100 bg-white p-8 shadow-sm scroll-mt-28"
                >
                  <div className="w-14 h-14 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0">
                    <IconeDynamique nom={s.icone} size={26} className="text-accent-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary-900">{s.titre}</h2>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">{s.description}</p>
                  </div>
                  {s.livrables?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Livrables types</p>
                      <ul className="space-y-2">
                        {s.livrables.map((l) => (
                          <li key={l} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 size={16} className="text-orange-500 mt-0.5 shrink-0" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {s.categorieMenu && (
                  <Link
                    to={`/nos-services/${s.categorieMenu}/${s.slug}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-accent-600 hover:text-orange-600 transition-colors"
                  >
                    En savoir plus <ArrowRight size={15} />
                  </Link>
                )}
              </Reveal>
            ))}
        </div>
      </section>

      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Un besoin précis en tête ?</h2>
            <p className="text-white/60 mt-3">Décrivez-nous votre projet, nous vous proposons l'approche la plus adaptée.</p>
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
