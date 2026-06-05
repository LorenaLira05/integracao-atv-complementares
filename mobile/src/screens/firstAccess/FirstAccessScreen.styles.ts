/**
 * FirstAccessScreen.styles.ts
 *
 * Estilos da tela de Primeiro Acesso (novo design).
 *
 * Layout: fundo branco com ondas pêssego (igual à WelcomeScreen),
 * logo Senac, avatar circular, campos de input e botão.
 *
 * Paleta:
 *   Fundo:         #FFFFFF
 *   Onda:          #F5C9A0  (pêssego)
 *   Azul Senac:    #1A3D6D
 *   Laranja Senac: #E87722
 *   Cinza texto:   #6B7280
 *   Borda input:   #E5E7EB
 */

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({

  // ─── Tela / container raiz ───────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ─── Área de rolagem ─────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // ─── Conteúdo principal (centralizado) ───────────────────────────────
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    zIndex: 1,
  },

  // ─── Área do logo (centralizado) ─────────────────────────────────────
  logoArea: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 130,
    zIndex: 1,
  },

  // ─── Avatar circular ─────────────────────────────────────────────────
  // Círculo que representa a foto de perfil do usuário
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,            // metade = círculo perfeito
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',     // alinhado à esquerda junto ao título
  },

  // ─── Título e subtítulo ───────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#004587',
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
  },

  // ─── Grupo de campo (label + caixa) ──────────────────────────────────
  fieldGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
  },

  // ─── Caixa do input ──────────────────────────────────────────────────
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 50,
  },

  inputBoxFocused: {
    borderColor: '#004587',      // borda azul quando focado
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
  },

  eyeButton: {
    padding: 4,
  },

  // ─── Botão "Entrar" ───────────────────────────────────────────────────
  button: {
    backgroundColor: '#004587',
    borderRadius: 10,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // ─── Separador "ou continue com" ─────────────────────────────────────
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  dividerLabel: {
    marginHorizontal: 10,
    fontSize: 13,
    color: '#9CA3AF',
  },

  // ─── Link "Primeiro acesso? Ative sua conta" ──────────────────────────
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
  },

  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },

  footerLink: {
    fontSize: 14,
    color: '#E87722',           // laranja Senac
    fontWeight: '600',
  },

  // ─── Step 2 (Processo Concluído) ──────────────────────────────────────
  checkmarkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#004587',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 16,
  },

  successHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E87722',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#004587',
    textAlign: 'center',
    marginBottom: 16,
  },

  successDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
});
