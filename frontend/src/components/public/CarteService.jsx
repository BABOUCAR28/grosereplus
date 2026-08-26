// Carte d'aperçu d'un service, utilisée sur /nos-services.
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import IconeDynamique from './IconeDynamique.jsx';

export default function CarteService({ service }) {
  return (
    <Link
      to={`/nos-services#${service.slug}`}
      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors">
        <IconeDynamique nom={service.icone} size={22} className="text-accent-600 group-hover:text-orange-600 transition-colors" />
      </div>
      <h3 className="font-semibold text-lg text-primary-900 mb-2 pr-6">{service.titre}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{service.resume}</p>
      <ArrowUpRight
        size={18}
        className="absolute top-7 right-7 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
      />
    </Link>
  );
}
