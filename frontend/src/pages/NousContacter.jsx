// Page publique /nous-contacter — formulaire réel (POST /api/v1/contact).
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { IconeFacebook, IconeLinkedin } from '../components/public/IconesReseaux.jsx';
import SiteLayout from '../layouts/SiteLayout.jsx';
import SEO from '../components/public/SEO.jsx';
import Reveal from '../components/public/Reveal.jsx';
import FormulaireContact from '../components/FormulaireContact.jsx';
import FAQAccordeon from '../components/public/FAQAccordeon.jsx';
import useCoordonneesSite from '../hooks/useCoordonneesSite.js';

export default function NousContacter() {
  const { site: SITE } = useCoordonneesSite();
  return (
    <SiteLayout>
      <SEO
        titre="Contact"
        description={`Contactez ${SITE.nom} par téléphone, WhatsApp, email ou via notre formulaire en ligne.`}
      />

      <section className="bg-primary-900 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">Contact</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 max-w-2xl">Parlons de votre projet</h1>
          <p className="text-white/60 mt-6 max-w-2xl leading-relaxed">
            Notre équipe vous répond sous 48 heures ouvrées. Vous pouvez également nous joindre
            directement par téléphone ou WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-14">
          <Reveal className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex gap-4">
              <MapPin className="text-accent-600 shrink-0" size={22} />
              <div>
                <h3 className="font-semibold text-primary-900 text-sm">Nos bureaux</h3>
                <p className="text-sm text-gray-600 mt-1">{SITE.adresseKaolack}</p>
                <p className="text-sm text-gray-600">{SITE.adresseDakar}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex gap-4">
              <Phone className="text-accent-600 shrink-0" size={22} />
              <div>
                <h3 className="font-semibold text-primary-900 text-sm">Téléphone / WhatsApp</h3>
                <a href={`tel:${SITE.telephone.replace(/\s/g, '')}`} className="text-sm text-gray-600 hover:text-orange-600 block mt-1">
                  {SITE.telephone}
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex gap-4">
              <Mail className="text-accent-600 shrink-0" size={22} />
              <div>
                <h3 className="font-semibold text-primary-900 text-sm">Email</h3>
                {SITE.emails.map((email) => (
                  <a key={email} href={`mailto:${email}`} className="text-sm text-gray-600 hover:text-orange-600 block mt-1">
                    {email}
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex gap-4">
              <Clock className="text-accent-600 shrink-0" size={22} />
              <div>
                <h3 className="font-semibold text-primary-900 text-sm">Horaires</h3>
                <p className="text-sm text-gray-600 mt-1">Lundi – Vendredi : 8h30 – 17h30</p>
              </div>
            </div>

            {(SITE.facebookUrl || SITE.linkedinUrl) && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex gap-4 items-center">
                <div className="flex gap-3">
                  {SITE.facebookUrl && (
                    <a
                      href={SITE.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-11 h-11 rounded-full bg-gray-50 hover:bg-orange-500 hover:text-white text-accent-600 flex items-center justify-center transition-colors"
                    >
                      <IconeFacebook size={20} />
                    </a>
                  )}
                  {SITE.linkedinUrl && (
                    <a
                      href={SITE.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-11 h-11 rounded-full bg-gray-50 hover:bg-orange-500 hover:text-white text-accent-600 flex items-center justify-center transition-colors"
                    >
                      <IconeLinkedin size={20} />
                    </a>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 text-sm">Suivez-nous</h3>
                  <p className="text-sm text-gray-600 mt-1">Retrouvez nos actualités sur les réseaux sociaux.</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-64">
              <iframe
                src={SITE.mapEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation GROSERE PLUS"
              />
            </div>
          </Reveal>

          <Reveal delai={150} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Envoyez-nous un message</h2>
            <FormulaireContact />
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500 block">Questions fréquentes</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-4">Avant de nous écrire</h2>
          </Reveal>
          <Reveal>
            <FAQAccordeon />
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
