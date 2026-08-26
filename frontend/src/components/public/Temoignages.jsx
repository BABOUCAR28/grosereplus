// Carrousel de témoignages clients, affiché sur la page d'accueil (site public).
import { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import useDonneesPubliques from '../../hooks/useDonneesPubliques.js';
import { getTemoignagesPublics } from '../../api/public.api.js';

export default function Temoignages() {
  const [index, setIndex] = useState(0);
  const { donnees: temoignages, chargement, erreur } = useDonneesPubliques(getTemoignagesPublics);

  if (chargement) {
    return <p className="text-center text-gray-400 text-sm">Chargement des témoignages…</p>;
  }
  if (erreur || temoignages.length === 0) {
    return null; // Pas de témoignage publié pour le moment : section masquée proprement.
  }

  const t = temoignages[index % temoignages.length];
  const suivant = () => setIndex((i) => (i + 1) % temoignages.length);
  const precedent = () => setIndex((i) => (i - 1 + temoignages.length) % temoignages.length);

  return (
    <div className="relative max-w-3xl mx-auto text-center">
      <Quote className="mx-auto text-orange-500 mb-6" size={40} strokeWidth={1.5} />
      <p className="text-xl md:text-2xl text-primary-900 leading-relaxed font-medium">« {t.message} »</p>
      <div className="mt-6">
        <p className="font-semibold text-primary-900">{t.fonction}</p>
        <p className="text-sm text-gray-500">{t.organisation}</p>
      </div>

      {temoignages.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={precedent}
            aria-label="Témoignage précédent"
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary-900 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {temoignages.map((temoin, i) => (
              <button
                key={temoin.id ?? i}
                aria-label={`Témoignage ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-orange-500' : 'w-2 bg-gray-200'}`}
              />
            ))}
          </div>
          <button
            onClick={suivant}
            aria-label="Témoignage suivant"
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary-900 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
