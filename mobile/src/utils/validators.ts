/**
 * Validações reutilizáveis de formulário.
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  // mínimo 8 caracteres, 1 maiúscula, 1 número
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}
