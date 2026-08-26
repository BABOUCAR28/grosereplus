// Accordéon de questions fréquentes (site public) — dynamique, modifiable
// par l'admin (voir hooks/useCoordonneesSite.js).
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useCoordonneesSite from '../../hooks/useCoordonneesSite.js';

export default function FAQAccordeon() {
  const [ouvert, setOuvert] = useState(0);
  const { faq } = useCoordonneesSite();

  return (
    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
      {faq.map((item, i) => {
        const actif = ouvert === i;
        return (
          <div key={item.question}>
            <button
              onClick={() => setOuvert(actif ? null : i)}
              aria-expanded={actif}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-medium text-primary-900">{item.question}</span>
              <ChevronDown
                size={20}
                className={`shrink-0 text-orange-500 transition-transform duration-300 ${actif ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                actif ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-gray-600 text-sm leading-relaxed pr-8">{item.reponse}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
