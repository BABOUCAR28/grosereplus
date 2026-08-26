// Boutons flottants du site public (WhatsApp, retour en haut de page).
import { Phone } from 'lucide-react';
import useCoordonneesSite from '../../hooks/useCoordonneesSite.js';

export default function BoutonsFlottants() {
  const { site: SITE } = useCoordonneesSite();
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
          'Bonjour GROSERE PLUS, je souhaite avoir des informations sur vos services.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactez-nous sur WhatsApp"
        className="group flex items-center h-14 w-14 hover:w-52 overflow-hidden rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 pl-[15px]"
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.032.917 2.72.917.73 0 2.076-.464 2.4-1.16.244-.516.244-1.116.13-1.318-.16-.287-.53-.301-.874-.301Zm-2.85 8.286h-.014c-1.446 0-2.878-.387-4.14-1.117l-.301-.172-3.084.803.832-3.017-.2-.315a8.634 8.634 0 0 1-1.318-4.582c0-4.756 3.87-8.626 8.64-8.626a8.6 8.6 0 0 1 8.612 8.64c-.015 4.756-3.885 8.386-8.026 8.386Zm7.34-15.968A10.633 10.633 0 0 0 16.245 6.5c-5.887 0-10.657 4.77-10.657 10.657 0 1.877.487 3.71 1.418 5.328L5.5 28.5l6.157-1.618a10.65 10.65 0 0 0 5.088 1.29h.014c5.887 0 10.657-4.77 10.657-10.657a10.6 10.6 0 0 0-3.116-7.542Z" />
        </svg>
        <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap ml-2 text-sm font-medium transition-opacity duration-200">
          Discuter sur WhatsApp
        </span>
      </a>

      <a
        href={`tel:${SITE.telephone.replace(/\s/g, '')}`}
        aria-label="Appelez-nous"
        className="flex items-center justify-center h-14 w-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors"
      >
        <Phone size={22} />
      </a>
    </div>
  );
}
