import { useEffect, useState } from 'react';

/**
 * Charge des données publiques (site vitrine) via une fonction d'appel API.
 * Retourne { donnees, chargement, erreur }.
 *
 * Convention de l'API (voir backend/src/utils/apiResponse.js `success()`) :
 * les endpoints de LISTE renvoient `{ success, message, data: { data: [...] } }`
 * — un objet Axios `res.data` dont le champ `.data` est LUI-MÊME un objet
 * `{ data: [...] }`, pas directement le tableau. Il faut donc déballer DEUX
 * niveaux (`res.data.data.data`) pour arriver au tableau réel. C'est la même
 * convention que suit déjà tout le reste du back-office (voir par exemple
 * `Consultants.jsx` : `data.data?.data`). C'est le cas par défaut ici.
 *
 * Certains endpoints (ex. `/public/identite-site`) renvoient un objet direct
 * plutôt qu'une liste, sans ce double emballage — passer un `extraire`
 * personnalisé dans ce cas (voir son utilisation dans Home.jsx / APropos.jsx
 * / NotreEquipe.jsx).
 *
 * `deps` : liste de dépendances (façon `useEffect`) qui déclenchent un
 * nouvel appel API lorsqu'elles changent — utile quand `fonctionAppel`
 * dépend d'un paramètre de route (ex. `/nos-services/:categorie`) et que le
 * composant reste monté d'une catégorie à l'autre (React Router ne
 * démonte/remonte pas le composant entre deux URLs qui matchent la même
 * route). Par défaut `[]` : un seul appel au montage, comportement inchangé
 * pour tous les appels existants.
 */
export default function useDonneesPubliques(
  fonctionAppel,
  valeurParDefaut = [],
  extraire = (res) => res.data?.data?.data ?? valeurParDefaut,
  deps = []
) {
  const [donnees, setDonnees] = useState(valeurParDefaut);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setErreur(null);

    fonctionAppel()
      .then((res) => {
        if (!annule) setDonnees(extraire(res));
      })
      .catch((err) => {
        if (!annule) setErreur(err);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { donnees, chargement, erreur };
}
