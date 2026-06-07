/**
 * LoginScreen.tsx
 *
 * Tela de LOGIN do aplicativo Senac.
 *
 * Layout:
 * ┌─────────────────────────────────┐
 * │  🟠 Onda topo (pêssego)        │
 * │        [ Logo Senac ]           │
 * │  Acesse sua conta               │
 * │  Bem-vindo ao Portal do Aluno   │
 * │                                 │
 * │  Matricula ou E-mail            │
 * │  [ 👤  0020015786            ]  │
 * │                                 │
 * │  Senha          Esqueci senha   │
 * │  [ 🔒  ●●●●●●●●          👁  ] │
 * │                                 │
 * │  [          Entrar           ]  │
 * │  ────── ou continue com ──────  │
 * │  Primeiro acesso? Ative conta   │
 * │                                 │
 * │  🟠 Onda base (pêssego)        │
 * └─────────────────────────────────┘
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../hooks';

import WaveBackground from '../../components/common/WaveBackground';
import SenacLogo from '../../components/common/SenacLogo';

// ─── Tipagem ──────────────────────────────────────────────────────────────────
type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginNavigationProp;
}

// ─── InputField ───────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureEntry?: boolean;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  rightLabel?: React.ReactNode;
}

function InputField({
  label,
  iconName,
  placeholder,
  value,
  onChangeText,
  secureEntry = false,
  isFocused = false,
  onFocus,
  onBlur,
  rightLabel,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightLabel}
      </View>

      <View style={[styles.inputBox, isFocused && styles.inputBoxFocused]}>
        <Ionicons
          name={iconName}
          size={18}
          color={isFocused ? '#004587' : '#9CA3AF'}
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        {secureEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(v => !v)}
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');

  const [matriculaFocused, setMatriculaFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMatriculaChange = (text: string) => {
    // Se conter apenas números, limita a 10 dígitos (tamanho padrão de matrícula)
    if (/^\d*$/.test(text)) {
      setMatricula(text.slice(0, 10));
    } else {
      // Se tiver letras ou arroba, permite formato livre de e-mail
      setMatricula(text);
    }
  };

  const handleEntrar = async () => {
    if (!matricula || !senha) return;
    setLoading(true);
    setError(null);
    try {
      await login(matricula, senha);
      // Navega para a seleção de curso após login bem-sucedido
      navigation.navigate('SelectCourse');
    } catch (err: any) {
      console.error('Erro no login:', err);
      const msg = err.response?.data?.erro || err.message || 'Erro ao realizar login. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Ondas decorativas de fundo */}
      <WaveBackground position="top" />
      <WaveBackground position="bottom" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          {/* Logo Senac */}
          <View style={styles.logoArea}>
            <SenacLogo />
          </View>

          <View style={styles.content}>
            {/* Cabeçalho da tela */}
            <Text style={styles.title}>Acesse sua conta</Text>
            <Text style={styles.subtitle}>Bem-vindo ao Portal do Aluno</Text>

            {/* Campo: Matrícula ou E-mail */}
            <InputField
              label="Matrícula ou E-mail"
              iconName="person-outline"
              placeholder="aluno@aluno.senac.com"
              value={matricula}
              onChangeText={handleMatriculaChange}
              isFocused={matriculaFocused}
              onFocus={() => setMatriculaFocused(true)}
              onBlur={() => setMatriculaFocused(false)}
            />

            {/* Campo: Senha com link "Esqueci minha senha" */}
            <InputField
              label="Senha"
              iconName="lock-closed-outline"
              placeholder="••••••••"
              value={senha}
              onChangeText={setSenha}
              secureEntry
              isFocused={senhaFocused}
              onFocus={() => setSenhaFocused(true)}
              onBlur={() => setSenhaFocused(false)}
              rightLabel={
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotLink}>Esqueci minha senha</Text>
                </TouchableOpacity>
              }
            />

            {/* Mensagem de erro */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Botão Entrar */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleEntrar}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Aguarde...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            {/* Separador */}
            <View style={styles.dividerWrapper}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>ou continue com</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Link de primeiro acesso */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Primeiro acesso? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('FirstAccess')}
                accessibilityRole="link"
              >
                <Text style={styles.footerLink}>Ative sua conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },

  // Logo
  logoArea: {
    alignItems: 'center',
    marginTop: 130,
    marginBottom: 28,
    zIndex: 1,
  },

  // Conteúdo principal
  content: {
    paddingHorizontal: 28,
    zIndex: 1,
  },

  // Cabeçalho
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#004587',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
  },

  // Campo de input
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  forgotLink: {
    fontSize: 13,
    color: '#E87722',
    fontWeight: '500',
  },
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
    borderColor: '#004587',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
  },
  eyeButton: {
    padding: 4,
  },

  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  // Botão Entrar
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

  // Separador
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

  // Rodapé
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
    color: '#E87722',
    fontWeight: '600',
  },
});
