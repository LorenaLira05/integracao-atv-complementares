/**
 * Utilitários de formatação de data/hora.
 */

/** Retorna "DD/MM/AAAA" */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR');
}

/** Retorna "DD/MM/AAAA às HH:MM" */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/** Retorna "X hora(s)" */
export function formatHours(hours: number): string {
  return `${hours} hora${hours !== 1 ? 's' : ''}`;
}
