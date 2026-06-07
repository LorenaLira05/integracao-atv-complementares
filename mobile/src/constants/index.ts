// ─── API ─────────────────────────────────────────────────────────────────────
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.103:3001';
export const API_TIMEOUT = 60_000; // ms

// ─── AsyncStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: '@sistema_horas:token',
  USER: '@sistema_horas:user',
  THEME: '@sistema_horas:theme',
  SELECTED_COURSE_ID: '@sistema_horas:selected_course_id',
} as const;

// ─── Categorias de horas ──────────────────────────────────────────────────────
export const HOUR_CATEGORIES = [
  { label: 'Extensão', value: 'extensao' },
  { label: 'Pesquisa', value: 'pesquisa' },
  { label: 'Monitoria', value: 'monitoria' },
  { label: 'Evento Acadêmico', value: 'evento_academico' },
  { label: 'Curso Livre', value: 'curso_livre' },
  { label: 'Projeto Social', value: 'projeto_social' },
  { label: 'Outros', value: 'outros' },
] as const;

// ─── Paginação padrão ─────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;

// ─── Cores do status ──────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  pendente: '#F59E0B',
  aprovado: '#10B981',
  rejeitado: '#EF4444',
} as const;
