// Génère une version Word (.docx) de la plaquette institutionnelle, à
// partir exactement du même contenu que la version PDF (voir
// brochurePdf.service.js) — mêmes textes, mêmes photos, même source de
// vérité (Administration → Paramètres → Identité du site public).
//
// Pourquoi une version Word en plus du PDF : contrairement au PDF, un
// fichier .docx reste modifiable après téléchargement — un admin peut
// l'ouvrir dans Word ou Google Docs et ajuster librement la mise en page,
// avant de le renvoyer à un partenaire ou de l'imprimer.
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  AlignmentType, BorderStyle,
} = require('docx');
const path = require('path');
const { fetchImageBuffer } = require('../utils/fetchImageBuffer');

const PRIMARY = '0D1E38';
const ORANGE = 'EA6A1F';
const GRAY = '4A5568';

// Types d'image gérés par la bibliothèque `docx` (ImageRun) — si l'image
// réelle est dans un autre format (ex. .webp, non supporté), elle est
// simplement omise du document plutôt que de faire échouer toute la
// génération (voir insererImage ci-dessous).
const TYPES_IMAGE_SUPPORTES = { '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png', '.gif': 'gif', '.bmp': 'bmp' };

function typeImage(urlOuChemin) {
  if (!urlOuChemin) return null;
  const ext = path.extname(urlOuChemin.split('?')[0]).toLowerCase();
  return TYPES_IMAGE_SUPPORTES[ext] || null;
}

async function insererImage(urlOuChemin, { width, height }) {
  const type = typeImage(urlOuChemin);
  if (!type) return null;
  const buffer = await fetchImageBuffer(urlOuChemin);
  if (!buffer) return null;
  try {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new ImageRun({ data: buffer, transformation: { width, height }, type })],
    });
  } catch {
    return null;
  }
}

function titre(texte, niveau = HeadingLevel.HEADING_1, couleur = PRIMARY) {
  return new Paragraph({
    heading: niveau,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text: texte, color: couleur, bold: true })],
  });
}

function paragraphe(texte, { italique = false, gras = false, couleur = GRAY, taille = 22 } = {}) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: texte || '', italics: italique, bold: gras, color: couleur, size: taille })],
  });
}

function puce(texteGras, texteNormal) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${texteGras} — `, bold: true, color: PRIMARY }),
      new TextRun({ text: texteNormal || '', color: GRAY }),
    ],
  });
}

function separateur() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE } },
    children: [],
  });
}

async function genererBrochureDocx({ identite, apropos, valeurs, coordonnees, managerGeneral, services, secteurs, brochureContenu, imageUrls }) {
  const children = [];

  // ── Couverture ──────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: identite.nom, bold: true, size: 56, color: PRIMARY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: identite.nomComplet.toUpperCase(), size: 26, color: GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: identite.slogan || '', italics: true, size: 22, color: ORANGE })],
    })
  );
  const imgCouverture = await insererImage(imageUrls.hero, { width: 500, height: 300 });
  if (imgCouverture) children.push(imgCouverture);
  children.push(separateur());

  // ── Qui sommes-nous ──────────────────────────────────────────────────
  children.push(titre(apropos.heroTitre || 'Qui sommes-nous ?'));
  const imgApropos = await insererImage(imageUrls.apropos, { width: 480, height: 260 });
  if (imgApropos) children.push(imgApropos);
  children.push(paragraphe(apropos.heroTexte));

  // ── Notre mission ─────────────────────────────────────────────────────
  children.push(titre(apropos.missionTitre || 'Notre mission'));
  children.push(paragraphe(`« ${apropos.missionTexte || ''} »`, { italique: true, gras: true, couleur: PRIMARY, taille: 24 }));
  const imgMission = await insererImage(imageUrls.mission, { width: 480, height: 260 });
  if (imgMission) children.push(imgMission);
  if (apropos.visionTexte) {
    children.push(titre(apropos.visionTitre || 'Notre vision', HeadingLevel.HEADING_2));
    children.push(paragraphe(apropos.visionTexte));
  }
  if (apropos.approcheTexte) {
    children.push(titre(apropos.approcheTitre || 'Notre approche', HeadingLevel.HEADING_2));
    children.push(paragraphe(apropos.approcheTexte));
  }

  // ── Nos valeurs ───────────────────────────────────────────────────────
  children.push(titre(apropos.valeursTitre || 'Nos valeurs'));
  (valeurs || []).forEach((v) => children.push(puce(v.titre, v.description)));

  // ── Nos métiers ───────────────────────────────────────────────────────
  children.push(titre('Nos métiers'));
  (services || []).forEach((s) => children.push(puce(s.titre, s.resume)));

  // ── Nos secteurs d'intervention ───────────────────────────────────────
  children.push(titre("Nos secteurs d'intervention"));
  const imgSecteurs = await insererImage(imageUrls.secteurs, { width: 480, height: 220 });
  if (imgSecteurs) children.push(imgSecteurs);
  children.push(
    paragraphe((secteurs || []).map((s) => s.titre).join(' · '), { couleur: PRIMARY, gras: true })
  );

  // ── Notre équipe ──────────────────────────────────────────────────────
  children.push(titre('Notre équipe'));
  const imgEquipe = await insererImage(imageUrls.equipe, { width: 480, height: 260 });
  if (imgEquipe) children.push(imgEquipe);
  children.push(
    paragraphe(`${managerGeneral.poste || 'Manager Général'} — ${managerGeneral.nom || ''}`, { gras: true, couleur: PRIMARY })
  );
  if (managerGeneral.bio) children.push(paragraphe(managerGeneral.bio));
  ((brochureContenu && brochureContenu.equipe) || []).forEach((e) => children.push(puce(e.titre, e.description)));

  // ── Nos réalisations ──────────────────────────────────────────────────
  children.push(titre('Nos réalisations'));
  ((brochureContenu && brochureContenu.realisations) || []).forEach((r) => children.push(puce(r.titre, r.description)));

  // ── Pourquoi nous choisir ─────────────────────────────────────────────
  children.push(titre(`Pourquoi choisir ${identite.nom} ?`));
  ((brochureContenu && brochureContenu.atouts) || []).forEach((a) => children.push(puce(a.titre, a.description)));

  // ── Contact ───────────────────────────────────────────────────────────
  children.push(titre('Contact'));
  children.push(paragraphe(`Bureau : ${coordonnees.adresseDakar || ''}`, { gras: true }));
  children.push(paragraphe(`Téléphone / WhatsApp : ${coordonnees.telephone || ''}`));
  (coordonnees.emails || []).forEach((email) => children.push(paragraphe(`Email : ${email}`)));
  if (coordonnees.siteWeb) children.push(paragraphe(`Site web : ${coordonnees.siteWeb}`));
  const reseaux = [
    coordonnees.facebookUrl ? `Facebook : ${coordonnees.facebookUrl}` : null,
    coordonnees.linkedinUrl ? `LinkedIn : ${coordonnees.linkedinUrl}` : null,
  ].filter(Boolean);
  reseaux.forEach((ligne) => children.push(paragraphe(ligne)));

  const document = new Document({
    sections: [{ properties: {}, children }],
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: GRAY } },
      },
    },
  });

  return Packer.toBuffer(document);
}

module.exports = { genererBrochureDocx };
