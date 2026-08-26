// Carte d'aperçu d'un secteur d'intervention, utilisée sur /nos-secteurs.
import IconeDynamique from './IconeDynamique.jsx';

export default function CarteSecteur({ secteur }) {
  return (
    <div className="group flex flex-col items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 hover:border-accent-500/40 hover:shadow-lg transition-all duration-300">
      <div className="w-11 h-11 rounded-full bg-primary-900 flex items-center justify-center group-hover:bg-accent-600 transition-colors">
        <IconeDynamique nom={secteur.icone} size={20} className="text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-primary-900">{secteur.titre}</h3>
        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{secteur.description}</p>
      </div>
    </div>
  );
}
