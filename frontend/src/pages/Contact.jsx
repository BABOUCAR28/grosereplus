// Espace interne — permet à tout compte connecté d'écrire directement à
// l'administration du cabinet (demande d'accès élargi, partenariat...),
// via le même composant que le formulaire public (voir FormulaireContact.jsx).
// Ne PAS confondre avec une boîte de réception : les messages envoyés depuis
// le formulaire de contact (public ou ici) sont transmis par e-mail et ne
// sont jamais stockés en base — voir contact.controller.js.
import AppLayout from '../layouts/AppLayout.jsx';
import FormulaireContact from '../components/FormulaireContact.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Contact() {
  const { user } = useAuth();

  return (
    <AppLayout titre="Contacter l'administration">
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">✉️</div>
          <h3 className="font-semibold text-gray-800 mb-1">Intéressé par une collaboration ou un accès élargi ?</h3>
          <p className="text-sm text-gray-500">
            Écrivez directement à l'administration du cabinet GROSERE PLUS pour toute demande
            (accès complémentaire, partenariat, prestation).
          </p>
        </div>
        <FormulaireContact
          nomInitial={user ? `${user.prenom} ${user.nom}` : ''}
          emailInitial={user?.email || ''}
        />
      </div>
    </AppLayout>
  );
}
