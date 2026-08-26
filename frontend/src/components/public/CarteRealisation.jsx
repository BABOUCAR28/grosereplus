// Carte d'aperçu d'une réalisation, utilisée sur /realisations.
import { Calendar, Building2 } from 'lucide-react';
import { IMAGES } from '../../data/imagesStock.js';

const POOL_IMAGES = Object.values(IMAGES);

export default function CarteRealisation({ realisation, index = 0 }) {
  const image = realisation.imageUrl || POOL_IMAGES[index % POOL_IMAGES.length];
  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={image}
          alt={realisation.titre}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-900/10 to-transparent" />
        {realisation.secteur && (
          <span className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-wide text-white bg-white/15 backdrop-blur px-3 py-1 rounded-full">
            {realisation.secteur}
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {realisation.annee && (
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {realisation.annee}
            </span>
          )}
          {realisation.client && (
            <span className="flex items-center gap-1">
              <Building2 size={13} /> {realisation.client}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-primary-900 leading-snug">{realisation.titre}</h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{realisation.resume}</p>
      </div>
    </div>
  );
}
