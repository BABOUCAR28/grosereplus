// Balises <title>/meta dynamiques par page (via react-helmet-async) pour le référencement du site public.
import { Helmet } from 'react-helmet-async';

export default function SEO({ titre, description }) {
  const titreComplet = titre ? `${titre} | GROSERE PLUS` : 'GROSERE PLUS — Cabinet de conseil au Sénégal';
  return (
    <Helmet>
      <title>{titreComplet}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={titreComplet} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
