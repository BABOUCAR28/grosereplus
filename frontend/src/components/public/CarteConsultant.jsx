// Carte d'aperçu d'un consultant, utilisée sur /notre-equipe.
function getInitiales(nom) {
  return nom
    .split(' ')
    .filter(Boolean)
    .map((mot) => mot[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function CarteConsultant({ consultant }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary-900 to-accent-600 flex items-center justify-center">
        <span className="text-xl font-semibold text-white">{getInitiales(consultant.nom)}</span>
      </div>
      <h3 className="font-semibold text-primary-900 mt-4">{consultant.nom}</h3>
      <p className="text-sm text-orange-600 font-medium mt-0.5">{consultant.poste}</p>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{consultant.specialite}</p>
      <p className="text-sm text-gray-600 mt-3 leading-relaxed text-left">{consultant.bio}</p>
    </div>
  );
}
