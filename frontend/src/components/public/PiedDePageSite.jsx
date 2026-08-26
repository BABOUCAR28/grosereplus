// Pied de page du site public (liens, coordonnées, réseaux sociaux).
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { IconeFacebook, IconeLinkedin } from './IconesReseaux.jsx';
import useCoordonneesSite from '../../hooks/useCoordonneesSite.js';
import NewsletterForm from './NewsletterForm.jsx';

const LIENS_NAV = [
  { href: '/', label: 'Accueil', cle: 'accueil' },
  { href: '/a-propos', label: 'À propos', cle: 'apropos' },
  { href: '/nos-services', label: 'Nos Services', cle: 'services' },
  { href: '/nos-secteurs', label: 'Secteurs', cle: 'secteurs' },
  { href: '/notre-equipe', label: 'Consultants', cle: 'equipe' },
  { href: '/realisations', label: 'Réalisations', cle: 'realisations' },
  { href: '/actualites', label: 'Actualités', cle: 'actualites' },
  { href: '/nous-contacter', label: 'Contact', cle: 'contact' },
];

export default function PiedDePageSite() {
  const { site: SITE, navigation } = useCoordonneesSite();
  const liensAffiches = LIENS_NAV.map((lien) => ({ ...lien, label: navigation[lien.cle] || lien.label }));
  // Colore le dernier mot du nom (ex. "GROSERE PLUS" → "GROSERE" + "PLUS" en
  // orange) sans dépendre d'un nom figé en dur — fonctionne avec un nom
  // d'un seul mot comme avec plusieurs.
  const motsNom = (SITE.nom || '').trim().split(/\s+/).filter(Boolean);
  const dernierMot = motsNom.pop();
  const debutNom = motsNom.join(' ');
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <span className="font-bold text-xl">
            {debutNom ? `${debutNom} ` : ''}
            <span className="text-accent-500">{dernierMot}</span>
          </span>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">{SITE.descriptionCourte}</p>
          {(SITE.facebookUrl || SITE.linkedinUrl) && (
            <div className="flex items-center gap-3 mt-5">
              {SITE.facebookUrl && (
                <a
                  href={SITE.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <IconeFacebook size={16} />
                </a>
              )}
              {SITE.linkedinUrl && (
                <a
                  href={SITE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <IconeLinkedin size={16} />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-white/80 mb-4">Navigation</h3>
          <ul className="space-y-2.5">
            {liensAffiches.map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="text-sm text-white/60 hover:text-orange-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-white/80 mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-accent-500" />
              <span>
                {SITE.adresseKaolack}
                <br />
                {SITE.adresseDakar}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-accent-500" />
              <a href={`tel:${SITE.telephone.replace(/\s/g, '')}`} className="hover:text-orange-400">
                {SITE.telephone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-accent-500" />
              <a href={`mailto:${SITE.emails[0]}`} className="hover:text-orange-400">
                {SITE.emails[0]}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-white/80 mb-4">Newsletter</h3>
          <p className="text-sm text-white/60 mb-4">Recevez nos actualités et publications par email.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {SITE.nom} — {SITE.nomComplet}. Tous droits réservés.</p>
          {SITE.bandeauFooter && <p>{SITE.bandeauFooter}</p>}
        </div>
      </div>
    </footer>
  );
}
