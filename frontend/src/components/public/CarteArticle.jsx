// Carte d'aperçu d'un article, utilisée dans les listes d'actualités.
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { IMAGES } from '../../data/imagesStock.js';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CarteArticle({ article }) {
  return (
    <Link
      to={`/actualites/${article.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 h-full"
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img
          src={article.image_url || IMAGES.teamLaptops}
          alt={article.titre}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-900/5 to-transparent" />
        {article.categorie && (
          <span className="absolute bottom-4 left-4 text-xs font-semibold text-white bg-white/15 backdrop-blur px-3 py-1 rounded-full">
            {article.categorie}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {article.date_publication && (
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(article.date_publication)}
            </span>
          )}
          {article.temps_lecture && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {article.temps_lecture}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg text-primary-900 leading-snug group-hover:text-orange-600 transition-colors">
          {article.titre}
        </h3>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed flex-1">{article.extrait}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 mt-5">
          Lire l'article <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
