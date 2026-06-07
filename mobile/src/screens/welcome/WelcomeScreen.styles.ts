/**
 * WelcomeScreen.styles.ts
 *
 * Arquivo de estilos da tela de boas-vindas.
 * Ajustado para ondas profundas de altura 220:
 *   - zIndex e posicionamentos recalibrados
 *   - Margem inferior aumentada para acompanhar a subida da onda inferior
 */

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
    marginTop: 100,             // Empurra o conteúdo abaixo da onda profunda do topo
  },
  logoSpacing: {
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#004587',          // Azul oficial Senac
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  divider: {
    width: 0,
    height: 0,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 210,         // Ajustado de 190 para 210 para acompanhar a subida da onda inferior
    zIndex: 1,
  },
  button: {
    backgroundColor: '#004587', // Azul oficial Senac
    borderRadius: 10,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#004587',
    marginTop: 12,
  },
  buttonSecondaryText: {
    color: '#004587',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export { width, height };
