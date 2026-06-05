/**
 * SenacLogo.tsx
 *
 * Componente que renderiza o LOGO do Senac usando a imagem oficial.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function SenacLogo() {
  return (
    <View style={styles.container} accessibilityLabel="Logo Senac">
      <Image
        source={require('../../assets/images/logo_senac.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 180,
    height: 128,
  },
});
