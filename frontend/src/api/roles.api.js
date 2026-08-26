// Appels API — liste des rôles RBAC disponibles.
import api from './axios';

export const listerRoles = () => api.get('/roles');
