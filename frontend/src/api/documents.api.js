// Appels API — upload, téléchargement et suppression de documents.
import api from './axios';

export const listerDocuments = (params) => api.get('/documents', { params });
export const deposerDocument = (formData) =>
  api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const telechargerDocument = (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' });
