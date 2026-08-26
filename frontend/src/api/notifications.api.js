// Appels API — notifications internes de l'utilisateur connecté.
import api from './axios';

export const listerNotifications = (params) => api.get('/notifications', { params });
export const marquerLue = (id) => api.put(`/notifications/${id}/lu`);
export const marquerToutesLues = () => api.put('/notifications/lu-tout');
