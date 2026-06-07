import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../hooks';
import { hoursService, MeusDadosResponse } from '../../services/api/hoursService';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [meusDados, setMeusDados] = useState<MeusDadosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setLoading(true);
      hoursService.getMeusDados()
        .then(({ data }) => {
          if (isMounted) {
            setMeusDados(data);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Erro ao buscar perfil:', err);
          if (isMounted) setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleSair = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SENAC Acadêmico</Text>
        </View>
        <View style={styles.avatarHeaderPlaceholder} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00478F" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Carregando dados do perfil...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── HEADER DO PERFIL (FOTO, NOME, CPF) ── */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarImagePlaceholder}>
                <Ionicons name="person" size={64} color="#9CA3AF" />
              </View>
              <TouchableOpacity style={styles.editAvatarBadge} activeOpacity={0.8}>
                <Ionicons name="pencil" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{meusDados?.aluno?.nome || 'Estudante'}</Text>
            
            <View style={styles.courseRow}>
              <Ionicons name="school-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={styles.courseName}>{meusDados?.aluno?.curso_nome || 'Curso não cadastrado'}</Text>
            </View>

            <View style={styles.cpfBadge}>
              <Text style={styles.cpfText}>{meusDados?.aluno?.email}</Text>
            </View>
          </View>

          {/* ── CARDS DE ESTATÍSTICAS ── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Submissões</Text>
              <Text style={[styles.statValue, { color: '#00478F' }]}>{meusDados?.total_submissoes || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Horas Validadas</Text>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{meusDados?.horas_aprovadas || 0}h</Text>
            </View>
          </View>

          {/* ── CONFIGURAÇÕES ── */}
          <View style={styles.configSection}>
            <Text style={styles.configSectionTitle}>CONFIGURAÇÕES</Text>

            <View style={styles.configCard}>
              {/* Trocar de Curso */}
              <TouchableOpacity 
                style={styles.configItem} 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('SelectCourse')}
              >
                <View style={styles.configIconBg}>
                  <Ionicons name="swap-horizontal" size={20} color="#1B3A6B" />
                </View>
                <Text style={styles.configItemText}>Trocar de Curso</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Notificações */}
              <TouchableOpacity 
                style={styles.configItem} 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Notifications')}
              >
                <View style={styles.configIconBg}>
                  <Ionicons name="notifications-outline" size={20} color="#1B3A6B" />
                </View>
                <Text style={styles.configItemText}>Notificações</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Ajuda */}
              <TouchableOpacity style={styles.configItem} activeOpacity={0.7}>
                <View style={styles.configIconBg}>
                  <Ionicons name="help-circle-outline" size={20} color="#1B3A6B" />
                </View>
                <Text style={styles.configItemText}>Ajuda</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Sair */}
              <TouchableOpacity 
                style={styles.configItem} 
                activeOpacity={0.7}
                onPress={handleSair}
              >
                <View style={[styles.configIconBg, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                </View>
                <Text style={[styles.configItemText, { color: '#DC2626' }]}>Sair</Text>
                <Ionicons name="chevron-forward" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── BOTTOM TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('HoursList')}>
          <Ionicons name="reader-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Atividades</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Alertas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem}>
          {/* Active Tab Pill para Perfil */}
          <View style={styles.activeTabPill}>
            <Ionicons name="person" size={24} color="#00478F" />
            <Text style={[styles.bottomTabLabel, { color: '#00478F', fontWeight: '700', marginTop: 2 }]}>Perfil</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Fundo bem claro
  },
  
  // ── HEADER ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00478F', // Azul SENAC
  },
  avatarHeaderPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1D5DB', // Bolinha cinza vazia conforme imagem atual
  },

  // ── SCROLL / LAYOUT ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  // ── PROFILE HEADER ──
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImagePlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B', // Laranja
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cpfBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cpfText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '500',
  },

  // ── CARDS DE ESTATÍSTICAS ──
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },

  // ── CONFIGURAÇÕES ──
  configSection: {
    width: '100%',
  },
  configSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  configIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  configItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 72, // Alinha com o texto, ignorando o ícone
  },

  // ── BOTTOM TAB BAR ──
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 4,
  },
  activeTabPill: {
    backgroundColor: '#F0F6FF',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
