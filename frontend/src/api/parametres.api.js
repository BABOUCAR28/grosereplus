// Appels API — paramètres système, dont l'identité du site public.
import api from './axios';

export const listerParametres = () => api.get('/parametres');
export const enregistrerParametre = (payload) => api.post('/parametres', payload);

// Upload du logo ou de la brochure du site public. `type` doit être envoyé
// AVANT `fichier` dans le FormData — le backend (multer) lit les champs dans
// l'ordre où ils arrivent et a besoin de connaître le type pour valider
// l'extension et choisir le nom de fichier (voir uploadSitePublic.middleware.js).
export function uploaderAssetSite(type, fichier) {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('fichier', fichier);
  return api.post('/parametres/site-asset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// Upload d'une image rattachée à un contenu précis (une réalisation, un
// article...) — voir son usage dans Projets.jsx / GestionActualites.jsx.
// Renvoie { data: { url } }, à enregistrer ensuite dans le champ image_url
// de l'enregistrement concerné (le fichier n'est pas rattaché tout seul).
export function uploaderImageContenu(fichier) {
  const formData = new FormData();
  formData.append('fichier', fichier);
  return api.post('/parametres/contenu-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
