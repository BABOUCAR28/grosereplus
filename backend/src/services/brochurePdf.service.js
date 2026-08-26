// Génère la plaquette institutionnelle (brochure PDF) à la volée à partir du
// contenu déjà géré depuis Administration → Paramètres → Identité du site
// public (textes, valeurs, photos) et des services/secteurs publiés
// (ServiceVitrine / SecteurVitrine) — plutôt qu'un fichier PDF figé.
//
// Conséquence directe : un admin qui modifie le nom du cabinet, la mission,
// les valeurs, les métiers, les secteurs, les coordonnées ou une des photos
// du site voit la brochure se mettre à jour automatiquement au prochain
// téléchargement, sans avoir à regénérer ou re-téléverser un PDF à la main.
//
// Un admin qui préfère malgré tout fournir sa propre maquette (InDesign,
// Canva...) garde la main : tant qu'un fichier est téléversé via
// POST /parametres/site-asset (type=brochure), c'est CE fichier qui est
// servi (voir brochureUrl dans public.controller.js) — ce générateur n'est
// utilisé que tant qu'aucun remplacement n'a été fourni.
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { fetchImageBuffer } = require('../utils/fetchImageBuffer');

const PRIMARY = '#0d1e38';
const PRIMARY2 = '#12395f';
const ORANGE = '#ea6a1f';
const GREEN = '#2e8b57';
const WHITE = '#ffffff';
const GRAY = '#4a5568';
const LIGHTGRAY = '#eef2f6';
const BORDER = '#dde3ea';
const MUTED_LIGHT = '#c7d2e0';

const PAGE_W = 595.28; // A4 en points
const PAGE_H = 841.89;
const MARGIN = 51; // ~18mm


// Copie locale du logo par défaut (le seul asset dont la valeur par défaut
// pointe vers le frontend, inatteignable depuis ce conteneur — voir
// LOGO_URL_PAR_DEFAUT dans public.controller.js). Un logo téléversé par un
// admin est lui servi depuis /uploads/... et donc lu via fetchImageBuffer.
const DEFAULT_LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo-defaut.png');

function drawImageCover(doc, buffer, x, y, w, h, radius = 0) {
  if (!buffer) {
    doc.save();
    if (radius) doc.roundedRect(x, y, w, h, radius).clip();
    doc.rect(x, y, w, h).fill(PRIMARY2);
    doc.restore();
    return;
  }
  doc.save();
  if (radius) doc.roundedRect(x, y, w, h, radius).clip();
  else doc.rect(x, y, w, h).clip();
  try {
    doc.image(buffer, x, y, { cover: [w, h], align: 'center', valign: 'center' });
  } catch {
    doc.rect(x, y, w, h).fill(PRIMARY2);
  }
  doc.restore();
}

function darkenOverlay(doc, x, y, w, h, opacity = 0.6) {
  doc.save();
  doc.fillOpacity(opacity);
  doc.rect(x, y, w, h).fill(PRIMARY);
  doc.restore();
}

function card(doc, x, y, w, h, { bg = LIGHTGRAY, accent = null, radius = 6 } = {}) {
  doc.roundedRect(x, y, w, h, radius).fill(bg);
  if (accent) {
    doc.roundedRect(x, y, 3.5, h, 1.5).fill(accent);
  }
}

function numberedCard(doc, x, y, w, h, num, titre, corps, accent) {
  card(doc, x, y, w, h, { accent });
  doc.fillColor(accent).font('Helvetica-Bold').fontSize(10).text(num, x + 14, y + 14);
  doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(12).text(titre, x + 14, y + 28, { width: w - 28 });
  doc.fillColor(GRAY).font('Helvetica').fontSize(8.7)
    .text(corps, x + 14, y + 44, { width: w - 28, lineGap: 2 });
}

function pageHeader(doc, labelRight) {
  doc.rect(0, 0, PAGE_W, 26).fill(PRIMARY);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
    .text('PLAQUETTE INSTITUTIONNELLE', MARGIN, 9);
  doc.font('Helvetica').fontSize(8.5)
    .text(labelRight, PAGE_W - MARGIN - 200, 9, { width: 200, align: 'right' });
}

function pageFooter(doc, pageNo, footerLine) {
  const y = PAGE_H - 44;
  doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).lineWidth(0.6).strokeColor(BORDER).stroke();
  doc.fillColor(GRAY).font('Helvetica').fontSize(8).text(footerLine, MARGIN, y + 8);
  doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(8)
    .text(String(pageNo).padStart(2, '0'), PAGE_W - MARGIN - 40, y + 8, { width: 40, align: 'right' });
}

function eyebrowTitle(doc, eyebrow, titre, yTop, color = GREEN) {
  doc.fillColor(color).font('Helvetica-Bold').fontSize(9.5).text(eyebrow.toUpperCase(), MARGIN, yTop);
  doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(24).text(titre, MARGIN, yTop + 16);
  const titleHeight = doc.heightOfString(titre, { width: PAGE_W - 2 * MARGIN, fontSize: 24 });
  const lineY = yTop + 16 + titleHeight + 8;
  doc.moveTo(MARGIN, lineY).lineTo(MARGIN + 42, lineY).lineWidth(3).strokeColor(ORANGE).stroke();
  return lineY + 20;
}

/**
 * Construit le PDF de la brochure et le renvoie sous forme de Buffer.
 * @param {object} donnees — tout le contenu déjà chargé (identite, apropos,
 *   valeurs, coordonnees, managerGeneral, services, secteurs, brochureContenu,
 *   et les buffers d'images déjà récupérés).
 */
function construirePdf(donnees) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const {
      identite, apropos, valeurs, coordonnees, managerGeneral, services, secteurs,
      brochureContenu, images, tags,
    } = donnees;

    const footerLine = `${identite.nom} — ${identite.nomComplet}  ·  ${(coordonnees.emails || [])[0] || ''}  ·  ${coordonnees.telephone || ''}`;
    const labelRight = `${(coordonnees.adresseDakar || 'Dakar, Sénégal').split(',')[0]} · Sénégal`;

    // ---------------------------------------------------------------
    // PAGE 1 — COUVERTURE
    drawImageCover(doc, images.cover, 0, 0, PAGE_W, PAGE_H);
    darkenOverlay(doc, 0, 0, PAGE_W, PAGE_H, 0.6);
    doc.rect(0, 0, PAGE_W, 8).fill(ORANGE);

    doc.roundedRect(MARGIN, 40, 120, 68, 4).fill(WHITE);
    if (images.logo) {
      try { doc.image(images.logo, MARGIN + 10, 50, { fit: [100, 48], align: 'center', valign: 'center' }); } catch { /* ignore */ }
    }

    let y = 150;
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(38).text(identite.nom, MARGIN, y, { width: PAGE_W - 2 * MARGIN });
    y += 46;
    doc.fillColor(MUTED_LIGHT).font('Helvetica').fontSize(13).text(identite.nomComplet.toUpperCase(), MARGIN, y);
    y += 22;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + 55, y).lineWidth(2.5).strokeColor(GREEN).stroke();
    y += 18;
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(15).text('Cabinet de conseil, d\u2019études et de management de projets', MARGIN, y, { width: PAGE_W - 2 * MARGIN });
    y += doc.heightOfString('Cabinet de conseil, d\u2019études et de management de projets', { width: PAGE_W - 2 * MARGIN, fontSize: 15 }) + 8;
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(12.5).text(identite.slogan || 'Une expertise de proximité aux standards internationaux', MARGIN, y, { width: PAGE_W - 2 * MARGIN });

    // Bandeau de tags (services)
    const tagY = PAGE_H - 260;
    doc.fillColor('#e7ecf3').font('Helvetica-Bold').fontSize(9);
    let tx = MARGIN;
    tags.forEach((t, i) => {
      doc.fillColor('#e7ecf3').text(t.toUpperCase(), tx, tagY, { continued: false });
      const tw = doc.widthOfString(t.toUpperCase(), { font: 'Helvetica-Bold', fontSize: 9 });
      tx += tw + 8;
      if (i < tags.length - 1) {
        doc.fillColor(ORANGE).circle(tx, tagY + 4, 1.3).fill();
        tx += 8;
      }
    });

    // Bandeau bas
    doc.rect(0, PAGE_H - 130, PAGE_W, 130).fill(PRIMARY);
    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(8).text('BUREAU', MARGIN, PAGE_H - 100);
    doc.fillColor(WHITE).font('Helvetica').fontSize(11).text(coordonnees.adresseDakar || 'Dakar, Sénégal', MARGIN, PAGE_H - 86);

    const midX = PAGE_W / 2;
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(8).text('TÉLÉPHONE', midX, PAGE_H - 100);
    doc.fillColor(WHITE).font('Helvetica').fontSize(11).text(coordonnees.telephone || '', midX, PAGE_H - 86);

    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(8).text('EMAIL', MARGIN, PAGE_H - 52);
    doc.fillColor(WHITE).font('Helvetica').fontSize(11).text((coordonnees.emails || [])[0] || '', MARGIN, PAGE_H - 38);

    doc.fillColor('#9fb1c9').font('Helvetica').fontSize(8.5)
      .text('Institutions publiques · Secteur privé · ONG · Bailleurs de fonds · Projets nationaux et internationaux',
        midX, PAGE_H - 52, { width: PAGE_W - MARGIN - midX });

    // ---------------------------------------------------------------
    // PAGE 2 — QUI SOMMES-NOUS
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, 'Présentation du cabinet', apropos.heroTitre || 'Qui sommes-nous ?', 46);

    const imgH2 = 175;
    drawImageCover(doc, images.apropos, MARGIN, y, PAGE_W - 2 * MARGIN, imgH2, 6);
    y += imgH2 + 20;

    doc.fillColor(GRAY).font('Helvetica').fontSize(10.5)
      .text(apropos.heroTexte || '', MARGIN, y, { width: PAGE_W - 2 * MARGIN, lineGap: 3 });
    y += doc.heightOfString(apropos.heroTexte || '', { width: PAGE_W - 2 * MARGIN, fontSize: 10.5, lineGap: 3 }) + 24;

    const stats2 = [
      [(coordonnees.adresseDakar || 'Dakar').split(',')[0], 'Bureau'],
      ['Sénégal / CEDEAO', "Zone d'intervention"],
      [`${services.length || 9} domaines`, "Champs d'expertise"],
    ];
    const statW = (PAGE_W - 2 * MARGIN - 2 * 10) / 3;
    let sx = MARGIN;
    stats2.forEach(([val, label]) => {
      card(doc, sx, y, statW, 68, { bg: PRIMARY, radius: 6 });
      doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(13).text(val, sx + 12, y + 20, { width: statW - 24 });
      doc.fillColor('#9fb1c9').font('Helvetica').fontSize(8).text(label, sx + 12, y + 40, { width: statW - 24 });
      sx += statW + 10;
    });

    pageFooter(doc, 1, footerLine);

    // ---------------------------------------------------------------
    // PAGE 3 — NOTRE MISSION
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, "Raison d'être", apropos.missionTitre || 'Notre mission', 46, ORANGE);

    const quoteH = 110;
    card(doc, MARGIN, y, PAGE_W - 2 * MARGIN, quoteH, { bg: PRIMARY, radius: 6 });
    doc.rect(MARGIN, y, 3, quoteH).fill(ORANGE);
    doc.fillColor(WHITE).font('Helvetica').fontSize(12)
      .text(`\u00AB ${apropos.missionTexte || ''} \u00BB`, MARGIN + 20, y + 16, { width: PAGE_W - 2 * MARGIN - 40, lineGap: 4 });
    y += quoteH + 20;

    const etapes = [
      ['01', 'Comprendre', 'Analyser rigoureusement le contexte, les besoins et les contraintes de chaque commanditaire avant toute recommandation.', GREEN],
      ['02', 'Accompagner', "Mettre à disposition des consultants et des méthodes éprouvées, du cadrage jusqu'à la clôture des interventions.", PRIMARY2],
      ['03', 'Mesurer', 'Documenter les résultats et les effets par un suivi-évaluation objectif, utile à la décision et à la redevabilité.', ORANGE],
    ];
    const stepH = 62;
    etapes.forEach(([num, titre, corps, accent]) => {
      card(doc, MARGIN, y, PAGE_W - 2 * MARGIN, stepH, { accent, radius: 6 });
      doc.fillColor(accent).font('Helvetica-Bold').fontSize(11).text(`${num}   ${titre}`, MARGIN + 16, y + 12);
      doc.fillColor(GRAY).font('Helvetica').fontSize(9.3).text(corps, MARGIN + 16, y + 28, { width: PAGE_W - 2 * MARGIN - 32, lineGap: 2 });
      y += stepH + 8;
    });

    const missionImgH = 90;
    if (y + missionImgH < PAGE_H - 60) {
      drawImageCover(doc, images.mission, MARGIN, y, PAGE_W - 2 * MARGIN, missionImgH, 6);
    }
    pageFooter(doc, 2, footerLine);

    // ---------------------------------------------------------------
    // PAGE 4 — NOS VALEURS
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, apropos.valeursBadge || 'Ce qui guide nos interventions', apropos.valeursTitre || 'Nos valeurs', 46);

    const colors = [GREEN, PRIMARY2, ORANGE];
    const colW = (PAGE_W - 2 * MARGIN - 12) / 2;
    const rowH = 62;
    const valeursListe = (valeurs && valeurs.length ? valeurs : []).slice(0, 8);
    valeursListe.forEach((v, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN + col * (colW + 12);
      const yy = y + row * (rowH + 8);
      numberedCard(doc, x, yy, colW, rowH, String(i + 1).padStart(2, '0'), v.titre, v.description, colors[i % 3]);
    });
    const lastRow = Math.floor((valeursListe.length - 1) / 2);
    let bannerY = y + (lastRow + 1) * (rowH + 8) + 6;

    const bannerH = 70;
    if (bannerY + bannerH < PAGE_H - 60) {
      drawImageCover(doc, images.equipe, MARGIN, bannerY, PAGE_W - 2 * MARGIN, bannerH, 6);
      darkenOverlay(doc, MARGIN, bannerY, PAGE_W - 2 * MARGIN, bannerH, 0.62);
      doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(12)
        .text('Des valeurs traduites en pratiques de travail', MARGIN + 16, bannerY + 14, { width: PAGE_W - 2 * MARGIN - 32 });
      doc.fillColor('#dbe3ee').font('Helvetica').fontSize(9)
        .text('Chartes de mission, contrôle qualité interne des livrables, confidentialité des données et reporting régulier auprès des commanditaires.',
          MARGIN + 16, bannerY + 34, { width: PAGE_W - 2 * MARGIN - 32, lineGap: 2 });
    }
    pageFooter(doc, 3, footerLine);

    // ---------------------------------------------------------------
    // PAGE 5 — NOS METIERS (ServiceVitrine)
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, "Domaines d'expertise", 'Nos métiers', 46, GREEN);
    doc.fillColor(GRAY).font('Helvetica').fontSize(10)
      .text("GROSERE PLUS intervient sur l'ensemble du cycle de projet, du diagnostic initial à l'évaluation finale, en mobilisant des experts sectoriels selon la nature de chaque mission.",
        MARGIN, y, { width: PAGE_W - 2 * MARGIN, lineGap: 2 });
    y += doc.heightOfString("GROSERE PLUS intervient sur l'ensemble du cycle de projet, du diagnostic initial à l'évaluation finale, en mobilisant des experts sectoriels selon la nature de chaque mission.",
      { width: PAGE_W - 2 * MARGIN, fontSize: 10, lineGap: 2 }) + 16;

    const metiersListe = services.slice(0, 8);
    const metierRowH = 58;
    metiersListe.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN + col * (colW + 12);
      const yy = y + row * (metierRowH + 7);
      numberedCard(doc, x, yy, colW, metierRowH, String(i + 1).padStart(2, '0'), s.titre, s.resume, colors[i % 3]);
    });
    const lastRowM = Math.floor((metiersListe.length - 1) / 2);
    let yy2 = y + (lastRowM + 1) * (metierRowH + 7) + 4;
    if (services.length > 8) {
      card(doc, MARGIN, yy2, PAGE_W - 2 * MARGIN, 48, { bg: PRIMARY, radius: 6 });
      const extra = services.slice(8, 9)[0];
      doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(10.5)
        .text(`09 · ${extra ? extra.titre : 'Mise à disposition de consultants'} — experts qualifiés mobilisables à court, moyen et long terme.`,
          MARGIN + 16, yy2 + 12, { width: PAGE_W - 2 * MARGIN - 32, align: 'center' });
      doc.fillColor('#9fb1c9').font('Helvetica').fontSize(8.5)
        .text('Diagnostic · Conception · Mise en œuvre · Suivi-évaluation · Capitalisation', MARGIN + 16, yy2 + 30, { width: PAGE_W - 2 * MARGIN - 32, align: 'center' });
    }
    pageFooter(doc, 4, footerLine);

    // ---------------------------------------------------------------
    // PAGE 6 — SECTEURS D'INTERVENTION (SecteurVitrine)
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, 'Champs thématiques', "Nos secteurs d'intervention", 46);

    const secteursBannerH = 95;
    drawImageCover(doc, images.secteurs, MARGIN, y, PAGE_W - 2 * MARGIN, secteursBannerH, 6);
    darkenOverlay(doc, MARGIN, y, PAGE_W - 2 * MARGIN, secteursBannerH, 0.62);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(13)
      .text('Une couverture thématique large, portée par des experts sectoriels.', MARGIN + 16, y + 16, { width: PAGE_W - 2 * MARGIN - 32 });
    y += secteursBannerH + 18;

    const secteursListe = secteurs.length ? secteurs : [];
    const secColW = (PAGE_W - 2 * MARGIN - 2 * 10) / 3;
    const secRowH = 40;
    secteursListe.forEach((s, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = MARGIN + col * (secColW + 10);
      const yy = y + row * (secRowH + 6);
      card(doc, x, yy, secColW, secRowH, { radius: 6 });
      doc.fillColor(colors[i % 3]).circle(x + 12, yy + secRowH / 2, 3).fill();
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(9.3).text(s.titre, x + 20, yy + secRowH / 2 - 5, { width: secColW - 28 });
    });
    const lastRowS = Math.floor((secteursListe.length - 1) / 3);
    let yy3 = y + (lastRowS + 1) * (secRowH + 6) + 6;

    card(doc, MARGIN, yy3, PAGE_W - 2 * MARGIN, 58, { bg: PRIMARY, radius: 6 });
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(12).text('Des experts mobilisés au plus près du terrain', MARGIN + 16, yy3 + 12);
    doc.fillColor('#dbe3ee').font('Helvetica').fontSize(9)
      .text(`Depuis ${(coordonnees.adresseDakar || 'Dakar').split(',')[0]}, nos équipes interviennent dans les régions du Sénégal et en Afrique de l'Ouest.`,
        MARGIN + 16, yy3 + 30, { width: PAGE_W - 2 * MARGIN - 32 });

    pageFooter(doc, 5, footerLine);

    // ---------------------------------------------------------------
    // PAGE 7 — NOTRE EQUIPE
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, 'Une expertise multidisciplinaire', 'Notre équipe', 46, ORANGE);

    const boxH = 120;
    card(doc, MARGIN, y, PAGE_W - 2 * MARGIN, boxH, { bg: PRIMARY, radius: 6 });
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(9).text('MANAGER GÉNÉRAL', MARGIN + 16, y + 14);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(13)
      .text(`${managerGeneral.poste || 'Direction'} — Pilotage stratégique et qualité des missions`, MARGIN + 16, y + 30, { width: PAGE_W - 2 * MARGIN - 32 });
    doc.fillColor(MUTED_LIGHT).font('Helvetica').fontSize(9)
      .text(managerGeneral.bio || '', MARGIN + 16, y + 52, { width: PAGE_W - 2 * MARGIN - 32, lineGap: 2 });
    y += boxH + 16;

    const equipeListe = (brochureContenu.equipe && brochureContenu.equipe.length ? brochureContenu.equipe : []).slice(0, 6);
    const eqRowH = 56;
    equipeListe.forEach((e, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN + col * (colW + 12);
      const yy = y + row * (eqRowH + 7);
      card(doc, x, yy, colW, eqRowH, { accent: colors[i % 3], radius: 6 });
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(10.5).text(e.titre, x + 14, yy + 12, { width: colW - 28 });
      doc.fillColor(GRAY).font('Helvetica').fontSize(8.7).text(e.description, x + 14, yy + 27, { width: colW - 28, lineGap: 2 });
    });
    const lastRowE = Math.floor((equipeListe.length - 1) / 2);
    let yy4 = y + (lastRowE + 1) * (eqRowH + 7) + 6;

    card(doc, MARGIN, yy4, PAGE_W - 2 * MARGIN, 48, { bg: LIGHTGRAY, radius: 6 });
    doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(10.5).text('Une équipe constituée mission par mission', MARGIN + 14, yy4 + 10);
    doc.fillColor(GRAY).font('Helvetica').fontSize(8.6)
      .text("Chaque intervention fait l'objet d'une équipe dédiée, d'un chef de mission identifié et d'un dispositif d'assurance qualité.",
        MARGIN + 14, yy4 + 26, { width: PAGE_W - 2 * MARGIN - 28 });

    pageFooter(doc, 6, footerLine);

    // ---------------------------------------------------------------
    // PAGE 8 — NOS REALISATIONS
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, 'Références & partenaires', 'Nos réalisations', 46);
    const introR = "Cette section présente les missions et projets réalisés par GROSERE PLUS. Elle est mise à jour en continu depuis le back-office GP-SUITE : chaque nouvelle réalisation, référence ou partenaire ajouté par l'administrateur alimente le site institutionnel et cette plaquette.";
    doc.fillColor(GRAY).font('Helvetica').fontSize(10).text(introR, MARGIN, y, { width: PAGE_W - 2 * MARGIN, lineGap: 2 });
    y += doc.heightOfString(introR, { width: PAGE_W - 2 * MARGIN, fontSize: 10, lineGap: 2 }) + 16;

    const realisationsListe = (brochureContenu.realisations && brochureContenu.realisations.length ? brochureContenu.realisations : []).slice(0, 4);
    const realRowH = 62;
    realisationsListe.forEach((r, i) => {
      const accent = colors[i % 3];
      const yy = y + i * (realRowH + 8);
      card(doc, MARGIN, yy, PAGE_W - 2 * MARGIN, realRowH, { accent, radius: 6 });
      doc.fillColor(accent).font('Helvetica-Bold').fontSize(10.5).text(`${String(i + 1).padStart(2, '0')}   ${r.titre}`, MARGIN + 16, yy + 12);
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(r.description, MARGIN + 16, yy + 28, { width: PAGE_W - 2 * MARGIN - 32, lineGap: 2 });
    });
    let yy5 = y + realisationsListe.length * (realRowH + 8) + 6;

    const refBoxH = 85;
    card(doc, MARGIN, yy5, PAGE_W - 2 * MARGIN, refBoxH, { bg: LIGHTGRAY, radius: 6 });
    doc.dash(2, { space: 2 }).rect(MARGIN + 10, yy5 + 10, PAGE_W - 2 * MARGIN - 20, refBoxH - 20).strokeColor(BORDER).stroke();
    doc.undash();
    doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(10.5)
      .text('ESPACE RÉSERVÉ AUX RÉFÉRENCES, CLIENTS ET PARTENAIRES', MARGIN, yy5 + 32, { width: PAGE_W - 2 * MARGIN, align: 'center' });
    doc.fillColor(GRAY).font('Helvetica').fontSize(8.5)
      .text("Logos, intitulés de missions, commanditaires et périodes d'exécution — à compléter au fil des nouvelles collaborations.",
        MARGIN + 40, yy5 + 50, { width: PAGE_W - 2 * MARGIN - 80, align: 'center' });

    pageFooter(doc, 7, footerLine);

    // ---------------------------------------------------------------
    // PAGE 9 — POURQUOI CHOISIR
    doc.addPage({ size: 'A4', margin: 0 });
    pageHeader(doc, labelRight);
    y = eyebrowTitle(doc, 'Nos atouts', `Pourquoi choisir ${identite.nom} ?`, 46, ORANGE);

    const atoutsListe = (brochureContenu.atouts && brochureContenu.atouts.length ? brochureContenu.atouts : []).slice(0, 6);
    const atoutRowH = 58;
    atoutsListe.forEach((a, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN + col * (colW + 12);
      const yy = y + row * (atoutRowH + 8);
      numberedCard(doc, x, yy, colW, atoutRowH, String(i + 1).padStart(2, '0'), a.titre, a.description, colors[i % 3]);
    });
    const lastRowA = Math.floor((atoutsListe.length - 1) / 2);
    let yy6 = y + (lastRowA + 1) * (atoutRowH + 8) + 6;

    card(doc, MARGIN, yy6, PAGE_W - 2 * MARGIN, 48, { bg: PRIMARY, radius: 6 });
    const septieme = (brochureContenu.atouts || [])[6];
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(9.5)
      .text(`07 · ${septieme ? septieme.titre : 'Approche orientée résultats'} — ${septieme ? septieme.description : 'des livrables actionnables et des effets mesurables.'}`,
        MARGIN + 14, yy6 + 10, { width: PAGE_W - 2 * MARGIN - 28 });
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(9.5)
      .text("Un partenaire unique, du diagnostic à l'évaluation.", MARGIN + 14, yy6 + 30);

    pageFooter(doc, 8, footerLine);

    // ---------------------------------------------------------------
    // PAGE 10 — CONTACT
    doc.addPage({ size: 'A4', margin: 0 });
    const contactBannerH = 175;
    drawImageCover(doc, images.contact, 0, 0, PAGE_W, contactBannerH);
    darkenOverlay(doc, 0, 0, PAGE_W, contactBannerH, 0.6);
    doc.rect(0, 0, PAGE_W, 6).fill(ORANGE);

    doc.roundedRect(MARGIN, 30, 74, 42, 3).fill(WHITE);
    if (images.logo) {
      try { doc.image(images.logo, MARGIN + 6, 36, { fit: [62, 30], align: 'center', valign: 'center' }); } catch { /* ignore */ }
    }
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(13).text(identite.nom, MARGIN + 84, 40);
    doc.fillColor(MUTED_LIGHT).font('Helvetica').fontSize(8.5).text(identite.nomComplet.toUpperCase(), MARGIN + 84, 56);

    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(26).text('Contactez-nous', MARGIN, 96);
    doc.moveTo(MARGIN, 130).lineTo(MARGIN + 45, 130).lineWidth(2.5).strokeColor(GREEN).stroke();
    doc.fillColor('#dbe3ee').font('Helvetica').fontSize(10.5)
      .text('Parlons de vos études, projets, formations et dispositifs de suivi-évaluation.', MARGIN, 140, { width: PAGE_W - 2 * MARGIN });

    y = contactBannerH + 20;
    const contactRowH = 62;
    const ccolW = (PAGE_W - 2 * MARGIN - 10) / 2;

    function contactCard(x, yTop, w, label, valueLines, accent) {
      card(doc, x, yTop, w, contactRowH, { accent, radius: 6 });
      doc.fillColor(accent).font('Helvetica-Bold').fontSize(8.5).text(label, x + 14, yTop + 12);
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(10.5);
      let ly = yTop + 28;
      (Array.isArray(valueLines) ? valueLines : [valueLines]).forEach((line) => {
        doc.text(line, x + 14, ly, { width: w - 28 });
        ly += 14;
      });
    }

    contactCard(MARGIN, y, ccolW, 'BUREAU', coordonnees.adresseDakar || 'Dakar, Sénégal', GREEN);
    contactCard(MARGIN + ccolW + 10, y, ccolW, 'TÉLÉPHONE / WHATSAPP', coordonnees.telephone || '', PRIMARY2);
    y += contactRowH + 10;
    contactCard(MARGIN, y, ccolW, 'EMAIL', coordonnees.emails || [], ORANGE);
    contactCard(MARGIN + ccolW + 10, y, ccolW, 'SITE WEB', coordonnees.siteWeb || 'www.grosereplus.sn', GREEN);
    y += contactRowH + 10;

    card(doc, MARGIN, y, PAGE_W - 2 * MARGIN, 48, { accent: PRIMARY2, radius: 6 });
    doc.fillColor(PRIMARY2).font('Helvetica-Bold').fontSize(8.5).text('RÉSEAUX SOCIAUX', MARGIN + 14, y + 12);
    const reseauxTexte = [
      coordonnees.facebookUrl ? 'Facebook' : null,
      coordonnees.linkedinUrl ? 'LinkedIn' : null,
      coordonnees.whatsapp ? 'WhatsApp' : null,
    ].filter(Boolean).join(' · ') || 'Facebook · LinkedIn · WhatsApp';
    doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(11)
      .text(reseauxTexte, MARGIN + 14, y + 28, {
        link: coordonnees.facebookUrl || coordonnees.linkedinUrl || undefined,
      });
    y += 48 + 20;

    card(doc, MARGIN, y, PAGE_W - 2 * MARGIN, 74, { bg: PRIMARY, radius: 6 });
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(13)
      .text(`${identite.nom} · ${identite.nomComplet.toUpperCase()}`, MARGIN, y + 26, { width: PAGE_W - 2 * MARGIN, align: 'center' });
    doc.fillColor(ORANGE).font('Helvetica-Oblique').fontSize(11)
      .text(identite.slogan || '', MARGIN, y + 46, { width: PAGE_W - 2 * MARGIN, align: 'center' });

    pageFooter(doc, 9, footerLine);

    doc.end();
  });
}

async function genererBrochurePdf({ identite, apropos, valeurs, coordonnees, managerGeneral, services, secteurs, brochureContenu, imageUrls }) {
  const [cover, aproposImg, missionImg, equipeImg, secteursImg, contactImg, logo] = await Promise.all([
    fetchImageBuffer(imageUrls.hero),
    fetchImageBuffer(imageUrls.apropos),
    fetchImageBuffer(imageUrls.mission),
    fetchImageBuffer(imageUrls.equipe),
    fetchImageBuffer(imageUrls.secteurs),
    fetchImageBuffer(imageUrls.hero),
    imageUrls.logo && imageUrls.logo.startsWith('/uploads/')
      ? fetchImageBuffer(imageUrls.logo)
      : fs.promises.readFile(DEFAULT_LOGO_PATH).catch(() => null),
  ]);

  const tags = services.slice(0, 6).map((s) => s.titre);
  const tagsFinal = tags.length ? tags : ['Études', 'Conseil', 'Projets', 'Formation', 'Suivi-évaluation', 'Logistique'];

  return construirePdf({
    identite,
    apropos,
    valeurs,
    coordonnees,
    managerGeneral,
    services,
    secteurs,
    brochureContenu,
    tags: tagsFinal,
    images: {
      cover,
      apropos: aproposImg,
      mission: missionImg,
      equipe: equipeImg,
      secteurs: secteursImg,
      contact: contactImg,
      logo,
    },
  });
}

module.exports = { genererBrochurePdf };
