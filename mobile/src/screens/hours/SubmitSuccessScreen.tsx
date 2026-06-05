import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SubmitSuccess'>;

export default function SubmitSuccessScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SENAC Acadêmico</Text>
        </View>
        <View style={styles.avatarPlaceholder} />
      </View>

      <View style={styles.content}>
        {/* ── ICONE SUCESSO ── */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIconBg}>
            <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
          </View>
        </View>

        {/* ── TEXTOS ── */}
        <Text style={styles.title}>Atividade Enviada!</Text>
        <Text style={styles.subtitle}>
          Sua atividade foi enviada com sucesso e está aguardando análise do coordenador.
        </Text>

        {/* ── CARD PROTOCOLO ── */}
        <View style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#1B3A6B" style={{ marginRight: 6 }} />
            <Text style={styles.protocolLabel}>Detalhes do Protocolo</Text>
          </View>
          
          <View style={styles.protocolRow}>
            <Text style={styles.protocolKey}>Protocolo:</Text>
            <Text style={styles.protocolValue}>#2023-A789B</Text>
          </View>
          
          <View style={styles.protocolRow}>
            <Text style={styles.protocolKey}>Enviado em:</Text>
            <Text style={styles.protocolValue}>24 Mai, 14:32</Text>
          </View>
        </View>

        {/* ── BOTÕES ── */}
        <TouchableOpacity 
          style={styles.homeButton} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('HoursList')}
        >
          <Text style={styles.homeButtonText}>Voltar para o Início</Text>
          <Ionicons name="home-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.receiptButton}>
          <Ionicons name="receipt-outline" size={18} color="#1B3A6B" style={{ marginRight: 6 }} />
          <Text style={styles.receiptButtonText}>Ver comprovante de envio</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F9F4', // Fundo levemente esverdeado/azulado conforme imagem
  },
  
  // ── HEADER ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B3A6B',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1D5DB',
  },

  // ── CONTENT ──
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 40,
  },

  successIconContainer: {
    marginBottom: 24,
  },
  successIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B981', // Verde Esmeralda
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },

  // ── PROTOCOLO ──
  protocolCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  protocolLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B3A6B',
  },
  protocolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  protocolKey: {
    fontSize: 14,
    color: '#6B7280',
  },
  protocolValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  // ── BOTÕES ──
  homeButton: {
    width: '100%',
    backgroundColor: '#00478F', // Azul escuro
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: '#00478F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  receiptButtonText: {
    color: '#1B3A6B',
    fontSize: 15,
    fontWeight: '600',
  },
});
