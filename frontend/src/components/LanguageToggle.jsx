// Bouton de traduction FR ⇄ EN, réutilisé dans l'en-tête du site public
// (EnteteSite.jsx) et dans la barre du haut du back-office (Navbar.jsx).
//
// Comment ça marche : la quasi-totalité du texte du site (accueil, à
// propos, services, secteurs, menu...) est tapée par l'admin en français
// dans le back-office, pas figée dans le code — il n'existe donc pas de
// fichier de traduction figé qu'on pourrait simplement basculer. Ce bouton
// utilise à la place le widget gratuit "Google Traduction pour les sites
// web" : il traduit automatiquement tout le texte visible de la page,
// sans que l'admin ait besoin de ressaisir quoi que ce soit en anglais, et
// sans clé d'API ni compte à créer.
//
// Limites à connaître : la traduction est automatique (qualité proche de
// Google Traduction, pas une traduction humaine relue) et Google doit
// pouvoir joindre translate.google.com pour fonctionner.
import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

let scriptEnCoursDeChargement = false;

function chargerScriptGoogleTranslate() {
  if (scriptEnCoursDeChargement || document.getElementById('google-translate-script')) return;
  scriptEnCoursDeChargement = true;

  window.googleTranslateElementInit = function initialiserWidgetGoogle() {
    if (!window.google?.translate?.TranslateElement) return;
    // eslint-disable-next-line no-new
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'fr',
        includedLanguages: 'en',
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      'google_translate_element'
    );
  };

  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(script);
}

function lireLangueActuelle() {
  const correspondance = document.cookie.match(/googtrans=\/fr\/(\w+)/);
  return correspondance ? correspondance[1] : 'fr';
}

function definirLangue(langue) {
  // Cas normal : le widget Google a déjà injecté son sélecteur caché dans
  // la page — on le pilote directement, la traduction s'applique tout de
  // suite, sans recharger la page.
  const selecteur = document.querySelector('.goog-te-combo');
  if (selecteur) {
    selecteur.value = langue;
    selecteur.dispatchEvent(new Event('change'));
    return;
  }
  // Repli : le widget vient tout juste de se charger et son sélecteur
  // n'est pas encore prêt — on pose le cookie que Google Traduction lit au
  // chargement de la page, puis on recharge une fois.
  const domaine = window.location.hostname;
  document.cookie = `googtrans=/fr/${langue}; path=/`;
  if (domaine && domaine !== 'localhost') {
    document.cookie = `googtrans=/fr/${langue}; path=/; domain=.${domaine}`;
  }
  window.location.reload();
}

export default function LanguageToggle({ className = '' }) {
  const [langue, setLangue] = useState('fr');

  useEffect(() => {
    chargerScriptGoogleTranslate();
    setLangue(lireLangueActuelle());
  }, []);

  function basculerLangue() {
    const nouvelleLangue = langue === 'fr' ? 'en' : 'fr';
    setLangue(nouvelleLangue);
    definirLangue(nouvelleLangue);
  }

  return (
    <button
      type="button"
      onClick={basculerLangue}
      // notranslate : Google Traduction ne doit jamais traduire ce bouton
      // lui-même (il afficherait "FR"/"EN" traduits, ce qui n'a pas de sens).
      className={`notranslate flex items-center gap-1 text-xs font-semibold border border-current rounded-full px-2.5 py-1 hover:opacity-70 transition-opacity shrink-0 ${className}`}
      aria-label={langue === 'fr' ? 'Switch to English' : 'Passer en français'}
      title={langue === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <Globe size={13} />
      {langue === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
