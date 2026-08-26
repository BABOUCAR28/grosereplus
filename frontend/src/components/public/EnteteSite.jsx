import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import useCoordonneesSite from '../../hooks/useCoordonneesSite.js';
import { fusionnerMenu } from '../../data/menuVitrine.js';
import { getMenuVitrinePublic } from '../../api/public.api.js';
import LanguageToggle from '../LanguageToggle.jsx';

const LIENS_SECONDAIRES = [
  { href: '/', label: 'Accueil', cle: 'accueil' },
  { href: '/a-propos', label: 'À propos', cle: 'apropos' },
  { href: '/nos-secteurs', label: 'Secteurs', cle: 'secteurs' },
  { href: '/notre-equipe', label: 'Consultants', cle: 'equipe' },
  { href: '/realisations', label: 'Réalisations', cle: 'realisations' },
  { href: '/actualites', label: 'Actualités', cle: 'actualites' },
  { href: '/nous-contacter', label: 'Contact', cle: 'contact' },
];

export default function EnteteSite() {
  const [scrolled, setScrolled] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const [colonneActive, setColonneActive] = useState(null);
  const [accordeonMobile, setAccordeonMobile] = useState(null);
  const [menu, setMenu] = useState(() => fusionnerMenu());
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const { site: SITE, navigation } = useCoordonneesSite();
  const liensAffiches = LIENS_SECONDAIRES.map((lien) => ({ ...lien, label: navigation[lien.cle] || lien.label }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOuvert(false);
    setColonneActive(null);
    setAccordeonMobile(null);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setColonneActive(null);
      setOuvert(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onClickDehors = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setColonneActive(null);
    };
    document.addEventListener('mousedown', onClickDehors);
    return () => document.removeEventListener('mousedown', onClickDehors);
  }, []);

  useEffect(() => {
    let annule = false;
    getMenuVitrinePublic()
      .then((res) => {
        const parCategorie = res.data?.data?.menu ?? res.data?.data ?? {};
        if (!annule) setMenu(fusionnerMenu(parCategorie));
      })
      .catch(() => {
        /* API indisponible */
      });
    return () => {
      annule = true;
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur shadow-lg' : 'bg-white shadow-sm'
      }`}
    >
      {/* ── Partie 1 & 2 : logo à gauche, nom + slogan au centre, contact à droite ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo à gauche - TRÈS GRAND */}
          <Link to="/" className="flex-shrink-0" aria-label={`${SITE.nom} — Accueil`}>
            <img
              src={SITE.logoUrl}
              alt={`${SITE.nom} — ${SITE.nomComplet}`}
              className="h-16 md:h-24 w-auto object-contain"
            />
          </Link>

          {/* Nom + slogan au centre - version desktop */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="hidden lg:block flex-1 text-center"
          >
            <h1 className="text-lg xl:text-2xl font-extrabold tracking-tight text-primary-900 uppercase leading-tight">
              {SITE.nomComplet}
            </h1>
            <p className="text-[10px] xl:text-xs italic text-orange-600 leading-tight">
              « {SITE.slogan} »
            </p>
          </motion.div>

          {/* Contact et bouton à droite */}
          <div className="hidden lg:flex items-end gap-3 flex-shrink-0">
            <div className="flex flex-col items-end gap-0.5">
              <a
                href={`tel:${SITE.telephone.replace(/\s/g, '')}`}
                className="flex items-center gap-1 text-[10px] font-medium text-primary-900 hover:text-orange-600 transition-colors"
              >
                <Phone size={11} className="shrink-0" />
                {SITE.telephone}
              </a>
              <Link
                to="/nous-contacter"
                className="rounded-full bg-primary-900 text-white text-[9px] font-semibold px-2.5 py-1 hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                Demander un devis
              </Link>
            </div>
            <LanguageToggle className="text-primary-900" />
          </div>

          {/* Bouton menu mobile */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <LanguageToggle className="text-primary-900" />
            <button
              type="button"
              aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={ouvert}
              className="text-primary-900 p-1"
              onClick={() => setOuvert((v) => !v)}
            >
              {ouvert ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Nom + slogan version mobile */}
        <div className="lg:hidden pb-1 text-center">
          <h1 className="text-sm font-extrabold uppercase tracking-tight text-primary-900 leading-tight">
            {SITE.nomComplet}
          </h1>
          <p className="text-[9px] italic text-orange-600">« {SITE.slogan} »</p>
        </div>
      </div>

      {/* ── Partie 3 : grand menu horizontal ── */}
      <nav
        ref={navRef}
        aria-label="Domaines d'expertise"
        className="hidden lg:block border-t border-gray-100"
        onMouseLeave={() => setColonneActive(null)}
      >
        <div className="max-w-7xl mx-auto px-6">
          <ul className="flex items-stretch justify-center gap-1">
            {/* ACCUEIL & À PROPOS EN PREMIER */}
            {liensAffiches.slice(0, 2).map((lien) => (
              <li key={lien.href}>
                <Link
                  to={lien.href}
                  className={`block px-3 py-3 text-sm font-bold transition-colors ${
                    pathname === lien.href
                      ? 'text-orange-600'
                      : 'text-primary-900 hover:text-orange-600'
                  }`}
                >
                  {lien.label}
                </Link>
              </li>
            ))}

            {/* Séparateur */}
            <li className="mx-2 my-2 w-px bg-gray-300" aria-hidden="true" />

            {/* MEGA MENU DES DOMAINES D'EXPERTISE */}
            {menu.map((colonne) => {
              const estActive = colonneActive === colonne.cle;
              return (
                <li
                  key={colonne.cle}
                  className="relative"
                  onMouseEnter={() => setColonneActive(colonne.cle)}
                >
                  <div
                    className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide transition-colors ${
                      estActive ? 'text-orange-600' : 'text-primary-900'
                    }`}
                  >
                    <Link
                      to={colonne.href}
                      className="py-3 pl-5 hover:text-orange-600 transition-colors"
                    >
                      {colonne.libelle}
                    </Link>
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={estActive}
                      aria-label={`Afficher le sous-menu ${colonne.libelle}`}
                      className="py-3 pr-5 hover:text-orange-600 transition-colors"
                      onClick={() => setColonneActive((v) => (v === colonne.cle ? null : colonne.cle))}
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${estActive ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {estActive && (
                    <motion.span
                      layoutId="soulignement-menu"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-orange-500"
                    />
                  )}

                  <AnimatePresence>
                    {estActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-2"
                        role="menu"
                      >
                        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                            Domaines d'expertise
                          </p>
                          <ul>
                            {colonne.items.map((item) => (
                              <li key={item.href + item.libelle} role="none">
                                <Link
                                  to={item.href}
                                  role="menuitem"
                                  className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-primary-900 transition-colors hover:bg-orange-50 hover:text-orange-600"
                                >
                                  <span>{item.libelle}</span>
                                  <span className="opacity-0 transition-opacity group-hover:opacity-100">
                                    →
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}

            {/* Séparateur */}
            <li className="mx-2 my-2 w-px bg-gray-300" aria-hidden="true" />

            {/* AUTRES LIENS SECONDAIRES */}
            {liensAffiches.slice(2).map((lien) => (
              <li key={lien.href}>
                <Link
                  to={lien.href}
                  className={`block px-3 py-3 text-sm font-medium transition-colors ${
                    pathname === lien.href
                      ? 'text-orange-600'
                      : 'text-primary-900 hover:text-orange-600'
                  }`}
                >
                  {lien.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Menu mobile (accordéon) ── */}
      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden border-t border-gray-100 bg-white shadow-md"
          >
            <nav className="max-w-7xl mx-auto flex flex-col px-6 py-3">
              {/* Accueil et À propos en premier */}
              {liensAffiches.slice(0, 2).map((lien) => (
                <Link
                  key={lien.href}
                  to={lien.href}
                  className={`border-b border-gray-100 py-2.5 text-sm font-bold ${
                    pathname === lien.href ? 'text-orange-600' : 'text-primary-900'
                  }`}
                >
                  {lien.label}
                </Link>
              ))}

              {/* Domaines d'expertise */}
              {menu.map((colonne) => (
                <div key={colonne.cle} className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <Link
                      to={colonne.href}
                      className="flex-1 py-2.5 text-left text-xs font-bold uppercase text-primary-900"
                    >
                      {colonne.libelle}
                    </Link>
                    <button
                      type="button"
                      aria-label={`Afficher le sous-menu ${colonne.libelle}`}
                      aria-expanded={accordeonMobile === colonne.cle}
                      className="p-2.5 text-primary-900"
                      onClick={() =>
                        setAccordeonMobile((v) => (v === colonne.cle ? null : colonne.cle))
                      }
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          accordeonMobile === colonne.cle ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <AnimatePresence>
                    {accordeonMobile === colonne.cle && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pb-2"
                      >
                        {colonne.items.map((item) => (
                          <li key={item.href + item.libelle}>
                            <Link
                              to={item.href}
                              className="block py-1.5 pl-3 text-xs text-gray-600 hover:text-orange-600"
                            >
                              {item.libelle}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Autres liens secondaires */}
              {liensAffiches.slice(2).map((lien) => (
                <Link
                  key={lien.href}
                  to={lien.href}
                  className={`border-b border-gray-100 py-2.5 text-sm font-medium ${
                    pathname === lien.href ? 'text-orange-600' : 'text-primary-900'
                  }`}
                >
                  {lien.label}
                </Link>
              ))}

              <Link
                to="/nous-contacter"
                className="mt-3 rounded-full bg-primary-900 px-4 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Demander un devis
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}