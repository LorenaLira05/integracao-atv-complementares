/**
 * WelcomeScreen.tsx
 *
 * PRIMEIRA TELA do aplicativo — Tela de Boas-vindas (Welcome / Splash).
 *
 * ┌─────────────────────────────┐
 * │  🟠 Onda decorativa topo   │  ← WaveBackground position="top"
 * │                             │
 * │       [ Logo Senac ]        │  ← SenacLogo
 * │                             │
 * │   "Bem-vindo ao Futuro"     │  ← título
 * │  "Conectando você à..."     │  ← subtítulo
 * │          ───                │  ← divider (linha laranja)
 * │                             │
 * │  [ Começar Jornada ]        │  ← botão principal
 * │  🟠 Onda decorativa base   │  ← WaveBackground position="bottom"
 * └─────────────────────────────┘
 *
 * Navegação:
 *  Ao pressionar o botão "Começar Jornada" → vai para a tela de Login.
 *
 * Props recebidas via React Navigation:
 *  - navigation: objeto de navegação injetado automaticamente pelo Stack.
 */

import React from 'react';
import {
  View,         // container básico (como <div>)
  Text,         // texto
  TouchableOpacity,  // botão com feedback de toque
  Animated,     // para animações de entrada
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Imports internos ───────────────────────────────────────────────────
import { styles } from './WelcomeScreen.styles';  // estilos desta tela
import WaveBackground from '../../components/common/WaveBackground';  // ondas
import SenacLogo from '../../components/common/SenacLogo';       // logo
import { RootStackParamList } from '../../types';  // tipagem das rotas
import { STORAGE_KEYS } from '../../constants';

// ─── Tipagem da prop de navegação ───────────────────────────────────────
type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

// ─── Componente principal ───────────────────────────────────────────────
export default function WelcomeScreen({ navigation }: Props) {

  // ── Animação de fade-in ao entrar na tela ─────────────────────────────
  // Cria um valor animado que começa em 0 (invisível) e vai para 1 (visível)
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Verificação de auto-login
  React.useEffect(() => {
    let isMounted = true;
    const checkAutoLogin = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token && isMounted) {
          const selectedCourseId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_COURSE_ID);
          if (selectedCourseId) {
            navigation.replace('Dashboard');
          } else {
            navigation.replace('SelectCourse');
          }
        }
      } catch (err) {
        console.error('Erro ao verificar auto-login:', err);
      }
    };
    checkAutoLogin();
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  React.useEffect(() => {
    // Executa a animação quando o componente é montado
    Animated.timing(fadeAnim, {
      toValue: 1,          // valor final (totalmente visível)
      duration: 800,       // duração em milissegundos
      useNativeDriver: true, // usa o driver nativo para melhor performance
    }).start();
  }, [fadeAnim]);

  // ── Handler do botão ──────────────────────────────────────────────────
  // Ao clicar "Começar Jornada":
  //   → Se for o primeiro acesso: vai para FirstAccess (criar/alterar senha)
  //   → Futuramente: verificar AsyncStorage para saber se já passou pelo FirstAccess
  const handleFirstAccess = () => {
    navigation.navigate('FirstAccess');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // ── Renderização ──────────────────────────────────────────────────────
  return (
    // SafeAreaView garante que o conteúdo não fica atrás do notch/status bar
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ────────────────────────────────────────────────────────────────
          CAMADA 0 — Ondas decorativas (renderizadas PRIMEIRO = atrás)
          Como têm position: 'absolute', não ocupam espaço no fluxo.
          Renderizar antes = ficar embaixo visualmente.
      ──────────────────────────────────────────────────────────────── */}
      <WaveBackground position="top" />
      <WaveBackground position="bottom" />

      {/* ────────────────────────────────────────────────────────────────
          CAMADA 1 — Conteúdo central (logo + textos)
          Renderizado depois das ondas = fica na frente delas.
      ──────────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Logo do Senac */}
        <View style={styles.logoSpacing}>
          <SenacLogo />
        </View>

        {/* Título principal */}
        <Text style={styles.title}>Bem-vindo ao Futuro</Text>

        {/* Subtítulo / tagline */}
        <Text style={styles.subtitle}>
          Conectando você à excelência profissional.
        </Text>


      </Animated.View>

      {/* ────────────────────────────────────────────────────────────────
          CAMADA 1 — Rodapé com os botões
          Também renderizado depois das ondas, sempre visível na frente.
      ──────────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Começar"
        >
          <Text style={styles.buttonText}>COMEÇAR</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
