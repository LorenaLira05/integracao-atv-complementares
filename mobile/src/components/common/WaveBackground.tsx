/**
 * WaveBackground.tsx
 *
 * Componente responsável pelas ONDAS decorativas do topo e da base da tela.
 * Usa SVG para renderizar 3 camadas de ondas exatamente como na imagem:
 *   - Azul (externo)
 *   - Laranja (médio)
 *   - Creme (interno)
 *
 * Ajustado para que a onda inferior suba um pouco mais (deslocamento de 20px para cima),
 * preenchendo melhor o rodapé e aproximando-se da área central de conteúdo.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─── Tipos das props ────────────────────────────────────────────────────
interface WaveBackgroundProps {
  position: 'top' | 'bottom';
}

const WAVE_HEIGHT = 220; // Altura do container das ondas

// ─── Componente ─────────────────────────────────────────────────────────
export default function WaveBackground({ position }: WaveBackgroundProps) {
  const isTop = position === 'top';

  if (isTop) {
    return (
      <View style={styles.containerTop} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 375 220" preserveAspectRatio="none">
          {/* Creme (background) */}
          <Path
            d="M 0,0 L 0,120 C 90,210 230,10 375,150 L 375,0 Z"
            fill="#FDE8D3"
          />
          {/* Laranja (médio) */}
          <Path
            d="M 0,0 L 0,75 C 90,165 230,-35 375,105 L 375,0 Z"
            fill="#FCA84E"
          />
          {/* Azul (foreground) */}
          <Path
            d="M 0,0 L 0,30 C 90,120 230,-80 375,60 L 375,0 Z"
            fill="#1E5B9A"
          />
        </Svg>
      </View>
    );
  }

  return (
    <View style={styles.containerBottom} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 375 220" preserveAspectRatio="none">
        {/* Creme (background) - Deslocado 20px para cima */}
        <Path
          d="M 0,220 L 0,80 C 90,-10 230,200 375,50 L 375,220 Z"
          fill="#FDE8D3"
        />
        {/* Laranja (médio) - Deslocado 20px para cima */}
        <Path
          d="M 0,220 L 0,125 C 90,35 230,245 375,95 L 375,220 Z"
          fill="#FCA84E"
        />
        {/* Azul (foreground) - Deslocado 20px para cima */}
        <Path
          d="M 0,220 L 0,170 C 90,80 230,290 375,140 L 375,220 Z"
          fill="#1E5B9A"
        />
      </Svg>
    </View>
  );
}

// ─── Estilos internos do componente ────────────────────────────────────
const styles = StyleSheet.create({
  containerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: WAVE_HEIGHT,
    zIndex: 0,
    overflow: 'hidden',
  },
  containerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: WAVE_HEIGHT,
    zIndex: 0,
    overflow: 'hidden',
  },
});
