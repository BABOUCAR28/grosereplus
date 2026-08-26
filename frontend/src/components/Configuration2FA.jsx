// Écran de paramétrage de la double authentification (QR code, confirmation du code, codes de secours).
import { useState } from 'react';
import { setup2FA, confirm2FA, disable2FA } from '../api/twoFactor.api.js';

export default function Configuration2FA() {
  const [etape, setEtape] = useState('inactif'); // inactif | qrcode | actif
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [code, setCode] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [codesRecuperation, setCodesRecuperation] = useState([]);

  async function demarrerActivation() {
    setErreur('');
    try {
      const { data } = await setup2FA();
      setQrCodeDataUrl(data.data.qrCodeDataUrl);
      setEtape('qrcode');
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Erreur lors de la génération du QR code.');
    }
  }

  async function confirmerActivation(e) {
    e.preventDefault();
    setErreur('');
    try {
      const { data } = await confirm2FA(code);
      setCodesRecuperation(data.data?.codesRecuperation || []);
      setEtape('actif');
      setMessage('Double authentification activée avec succès.');
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Code incorrect.');
    }
  }

  async function desactiver(e) {
    e.preventDefault();
    setErreur('');
    try {
      await disable2FA(motDePasse);
      setEtape('inactif');
      setMessage('Double authentification désactivée.');
      setMotDePasse('');
    } catch (err) {
      setErreur(err.response?.data?.error?.message || 'Mot de passe incorrect.');
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md">
      <h3 className="text-base font-semibold text-gray-700 mb-2">
        Double authentification (2FA)
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Renforcez la sécurité de votre compte avec une application d'authentification
        (Google Authenticator, Authy...).
      </p>

      {message && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-3">{message}</p>}
      {erreur && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{erreur}</p>}

      {etape === 'inactif' && (
        <button
          onClick={demarrerActivation}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Activer la 2FA
        </button>
      )}

      {etape === 'qrcode' && (
        <form onSubmit={confirmerActivation}>
          <img src={qrCodeDataUrl} alt="QR code 2FA" className="mx-auto mb-4 w-40 h-40" />
          <p className="text-xs text-gray-500 mb-3">
            Scannez ce QR code, puis saisissez le code à 6 chiffres généré par votre application.
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 text-center tracking-widest"
          />
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium"
          >
            Confirmer et activer
          </button>
        </form>
      )}

      {etape === 'actif' && (
        <>
          {codesRecuperation.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-amber-800 mb-2">
                ⚠️ Codes de récupération — à conserver en lieu sûr, ils ne seront plus jamais affichés :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-sm text-amber-900">
                {codesRecuperation.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={desactiver}>
            <p className="text-sm text-green-700 mb-3">✅ La 2FA est active sur ce compte.</p>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Mot de passe pour désactiver"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
            />
            <button
              type="submit"
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium"
            >
              Désactiver la 2FA
            </button>
          </form>
        </>
      )}
    </div>
  );
}
