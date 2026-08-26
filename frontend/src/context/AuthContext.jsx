// Contexte React d'authentification : expose l'utilisateur connecté, son
// état de chargement, et les actions de connexion/déconnexion à toute
// l'application (via useAuth()). Les tokens sont stockés en localStorage.
import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

const ROLES_ADMIN = ['SUPER_ADMIN', 'ADMIN'];

/**
 * Uniformise le rôle reçu de l'API (espaces, casse) avant de le stocker en
 * mémoire côté front. Défense en profondeur : l'API renvoie déjà un rôle
 * normalisé, mais un token déjà émis avant ce correctif pourrait encore
 * porter une valeur brute — on ne veut pas que ça casse le RBAC du front.
 */
function normaliserUtilisateur(utilisateur) {
  if (!utilisateur) return utilisateur;
  return { ...utilisateur, role: (utilisateur.role || '').toString().trim().toUpperCase() };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gp_token');
    if (token) {
      authApi
        .getProfil()
        .then(({ data }) => setUser(normaliserUtilisateur(data.data)))
        .catch(() => {
          localStorage.removeItem('gp_token');
          localStorage.removeItem('gp_refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Tente une connexion classique. Si le compte a la 2FA active, l'API
   * retourne un défi (deuxFacteursRequis + challengeToken) au lieu des
   * tokens finaux : dans ce cas, aucune session n'est encore ouverte et
   * l'appelant doit ensuite utiliser confirmerLogin2fa().
   */
  async function seConnecter(email, motDePasse) {
    const { data } = await authApi.login(email, motDePasse);

    if (data.data.deuxFacteursRequis) {
      return { deuxFacteursRequis: true, challengeToken: data.data.challengeToken };
    }

    const utilisateur = normaliserUtilisateur(data.data.user);
    localStorage.setItem('gp_token', data.data.token);
    localStorage.setItem('gp_refresh_token', data.data.refreshToken);
    setUser(utilisateur);
    return { deuxFacteursRequis: false, user: utilisateur };
  }

  /**
   * Finalise la connexion après saisie du code TOTP (ou d'un code de
   * récupération) suite à un défi 2FA.
   */
  async function confirmerLogin2fa(challengeToken, code) {
    const { data } = await authApi.verifierLogin2fa(challengeToken, code);
    const utilisateur = normaliserUtilisateur(data.data.user);
    localStorage.setItem('gp_token', data.data.token);
    localStorage.setItem('gp_refresh_token', data.data.refreshToken);
    setUser(utilisateur);
    return utilisateur;
  }

  async function seDeconnecter() {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('gp_token');
      localStorage.removeItem('gp_refresh_token');
      setUser(null);
    }
  }

  const estAdmin = !!user && ROLES_ADMIN.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, estAdmin, seConnecter, confirmerLogin2fa, seDeconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
