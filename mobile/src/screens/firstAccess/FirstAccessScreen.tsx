/**
 * FirstAccessScreen.tsx
 *
 * Tela de PRIMEIRO ACESSO — design com ondas Senac, logo, avatar e campos.
 * Usa emojis Unicode no lugar de bibliotecas de ícones externas.
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { styles } from './FirstAccessScreen.styles';
import { authService } from '../../services/api';

import WaveBackground from '../../components/common/WaveBackground';
import SenacLogo from '../../components/common/SenacLogo';

type FirstAccessNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FirstAccess'
>;

interface Props {
  navigation: FirstAccessNavigationProp;
}

// ── AvatarPlaceholder ────────────────────────────────────────────────────────
function AvatarPlaceholder() {
  return (
    <View style={styles.avatarWrapper}>
      <Ionicons name="person" size={36} color="#9CA3AF" />
    </View>
  );
}

// ── InputField ───────────────────────────────────────────────────────────────
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <Text style={styles.label}>{label}</Text>
        {rightLabel}
      </View>

      <View style={[styles.inputBox, isFocused && styles.inputBoxFocused]}>
        <Ionicons
          name={iconName}
          size={18}
          color={isFocused ? '#004587' : '#9CA3AF'}
          style={{ marginRight: 10 }}
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

// ── FirstAccessScreen ────────────────────────────────────────────────────────
export default function FirstAccessScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [nomeFocused, setNomeFocused] = useState(false);
  const [matriculaFocused, setMatriculaFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const [novaSenhaFocused, setNovaSenhaFocused] = useState(false);
  const [confirmarSenhaFocused, setConfirmarSenhaFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const handleEntrar = async () => {
    if (!nome || !matricula || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      // Tenta fazer login com as credenciais provisórias
      const { data } = await authService.login({ email: matricula, password: senha });
      
      // Verifica se realmente é o primeiro acesso
      if (data.primeiroAcesso !== true) {
        alert("Esta conta já foi ativada. Faça login normalmente na tela inicial.");
        return;
      }
      
      // Armazena o token temporariamente e avança
      setTempToken(data.token);
      setStep(2);
    } catch (err: any) {
      console.error('Erro no primeiro acesso:', err);
      const msg = err.response?.data?.erro || err.message || 'Credenciais inválidas ou erro ao conectar.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!novaSenha || !confirmarSenha) {
      alert("Por favor, preencha as senhas.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }
    if (novaSenha.length < 6) {
      alert("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    if (!tempToken) {
      alert("Sessão expirada. Por favor, volte ao passo anterior.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      await authService.primeiroAcesso(tempToken, novaSenha);
      alert("Senha alterada com sucesso! Agora faça login com a nova senha.");
      navigation.navigate('Login');
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      const msg = err.response?.data?.erro || err.message || 'Erro ao redefinir a senha. Tente novamente.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <WaveBackground position="top" />
      <WaveBackground position="bottom" />

      <KeyboardAvoidingView
        style={{ flex: 1, zIndex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Area (escondida no passo 2 para focar no ícone de concluído) */}
          {step === 1 && (
            <View style={styles.logoArea}>
              <SenacLogo />
            </View>
          )}

          <View style={styles.content}>
            {step === 1 && (
              <View>
                {/* Avatar + Título */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <AvatarPlaceholder />
                  <View style={{ marginLeft: 14 }}>
                    <Text style={styles.title}>Primeiro acesso</Text>
                    <Text style={styles.subtitle}>Crie uma conta</Text>
                  </View>
                </View>

                <InputField
                  label="Nome"
                  iconName="person-outline"
                  placeholder="João Pereira"
                  value={nome}
                  onChangeText={setNome}
                  isFocused={nomeFocused}
                  onFocus={() => setNomeFocused(true)}
                  onBlur={() => setNomeFocused(false)}
                />

                <InputField
                  label="Matrícula ou E-mail"
                  iconName="person-outline"
                  placeholder="aluno@aluno.senac.com"
                  value={matricula}
                  onChangeText={setMatricula}
                  isFocused={matriculaFocused}
                  onFocus={() => setMatriculaFocused(true)}
                  onBlur={() => setMatriculaFocused(false)}
                />

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
                />

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

                <View style={styles.dividerWrapper}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>ou continue com</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Já tem uma conta? </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Login')}
                    accessibilityRole="link"
                  >
                    <Text style={styles.footerLink}>Fazer login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={{ marginTop: 20 }}>
                {/* Ícone de Sucesso */}
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={38} color="#FFFFFF" />
                </View>

                {/* Cabeçalho */}
                <Text style={styles.successHeader}>PROCESSO CONCLUÍDO</Text>
                <Text style={styles.successTitle}>primeiro acesso</Text>
                <Text style={styles.successDescription}>
                  Este é o seu primeiro acesso. Por segurança, redefina sua senha. As senhas devem ser idênticas e conter no mínimo 6 caracteres.
                </Text>

                <InputField
                  label="Nova Senha"
                  iconName="lock-closed-outline"
                  placeholder="••••••••"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureEntry
                  isFocused={novaSenhaFocused}
                  onFocus={() => setNovaSenhaFocused(true)}
                  onBlur={() => setNovaSenhaFocused(false)}
                />

                <InputField
                  label="Confirmar Nova Senha"
                  iconName="lock-closed-outline"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureEntry
                  isFocused={confirmarSenhaFocused}
                  onFocus={() => setConfirmarSenhaFocused(true)}
                  onBlur={() => setConfirmarSenhaFocused(false)}
                />

                <TouchableOpacity
                  style={[styles.button, loading && { opacity: 0.7 }]}
                  onPress={handleFinalize}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Aguarde...' : 'IR PARA TELA INICIAL'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
