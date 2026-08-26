// Appels API — consultation du journal d'audit (lecture seule).
import api from './axios';

export const listerLogsAudit = (params) => api.get('/logs-audit', { params });
export const getFiltresLogsAudit = () => api.get('/logs-audit/entites');
