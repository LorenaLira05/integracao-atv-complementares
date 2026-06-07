import api from './client';
import { User, AuthState } from '../../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  perfis: string[];
  primeiroAcesso?: boolean;
  nome: string;
  email: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', {
      email: payload.email,
      senha: payload.password,
      password: payload.password,
    }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  redefinirSenha: (email: string, novaSenha: string) =>
    api.post<{ mensagem: string }>('/auth/redefinir-senha', { email, novaSenha }),

  primeiroAcesso: (token: string, novaSenha: string) =>
    api.post<{ mensagem: string }>(
      '/auth/primeiro-acesso',
      { novaSenha },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
};
