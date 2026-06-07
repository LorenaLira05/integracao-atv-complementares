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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { authService } from '../../services/api/authService';

import WaveBackground from '../../components/common/WaveBackground';
import SenacLogo from '../../components/common/SenacLogo';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

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
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
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

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [emailFocused, setEmailFocused] = useState(false);
  const [novaSenhaFocused, setNovaSenhaFocused] = useState(false);
  const [confirmarSenhaFocused, setConfirmarSenhaFocused] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, informe seu e-mail.');
      return;
    }
    // Simples regex check de e-mail
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Erro', 'Por favor, informe um e-mail válido.');
      return;
    }
    setStep(2);
  };

  const handleAlterarSenha = () => {
    if (novaSenha.length < 8) {
      Alert.alert('Erro', 'A senha deve conter no mínimo 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    authService.redefinirSenha(email, novaSenha)
      .then(() => {
        setLoading(false);
        Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      })
      .catch(err => {
        setLoading(false);
        console.error('Erro ao redefinir senha:', err);
        const msg = err.response?.data?.erro || err.message || 'Erro ao redefinir senha.';
        Alert.alert('Erro', msg);
      });
  };

  const passwordsDifferent = confirmarSenha.length > 0 && novaSenha !== confirmarSenha;
  const isButtonEnabled = novaSenha.length >= 8 && confirmarSenha.length >= 8 && novaSenha === confirmarSenha;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <WaveBackground position="top" />
      <WaveBackground position="bottom" />

      {/* Header back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (step === 2) {
              setStep(1);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1B3A6B" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Mantém a tela sem rolagem, encaixando na viewport
        >
          {step === 1 ? (
            <View style={{ flex: 1 }}>
              <View style={styles.logoArea}>
                <SenacLogo />
              </View>

              <View style={styles.content}>
                <Text style={styles.title}>Redefinir senha</Text>
                <Text style={styles.subtitle}>Informe seu e-mail cadastrado para redefinir sua senha.</Text>

                <InputField
                  label="E-mail *"
                  iconName="mail-outline"
                  placeholder="Ex: estudante@senac.com.br"
                  value={email}
                  onChangeText={setEmail}
                  isFocused={emailFocused}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>AVANÇAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, marginTop: 40 }}>
              <View style={styles.checkmarkContainer}>
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.content}>
                <Text style={[styles.title, { textAlign: 'center' }]}>Redefinir senha</Text>
                
                <Text style={styles.instructionsText}>
                  As senhas devem ser <Text style={styles.highlightText}>idênticas</Text> e conter no mínimo 8 caracteres
                </Text>

                <InputField
                  label="Nova Senha *"
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
                  label="Confirmar Senha *"
                  iconName="lock-closed-outline"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureEntry
                  isFocused={confirmarSenhaFocused}
                  onFocus={() => setConfirmarSenhaFocused(true)}
                  onBlur={() => setConfirmarSenhaFocused(false)}
                />

                {passwordsDifferent && (
                  <Text style={styles.validationErrorText}>As senhas digitadas são diferentes</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.button, 
                    !isButtonEnabled && styles.buttonDisabled,
                    loading && { opacity: 0.7 }
                  ]}
                  onPress={handleAlterarSenha}
                  disabled={!isButtonEnabled || loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>ALTERAR SENHA</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 28,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmarkCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#004587',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#004587',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004587',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
    lineHeight: 20,
  },
  instructionsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  highlightText: {
    color: '#E87722',
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Cor de fundo do input do screenshot
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 50,
  },
  inputBoxFocused: {
    borderColor: '#004587',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    backgroundColor: '#004587',
    borderRadius: 10,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#004587',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9FB8D2', // Cor cinza/azul claro desativado
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  validationErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    fontWeight: '600',
  },
});
