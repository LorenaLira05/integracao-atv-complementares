import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, HourSubmission, ActivityMock } from '../../types';
import { hoursService } from '../../services/api/hoursService';

type Props = NativeStackScreenProps<RootStackParamList, 'HoursList'>;

const INITIAL_MOCK_ACTIVITIES: ActivityMock[] = [
  {
    id: '1',
    title: 'Certificado de Curso',
    status: 'Pendente',
    date: 'Enviado em 12 Out 2023',
    hours: 40,
    category: 'Extensão',
    description: 'Curso extracurrícular realizado na plataforma online sobre metodologias ágeis com carga horária de 40 horas.',
    attachment: { name: 'certificado_agile.pdf', size: '2.4 MB', type: 'PDF Document' },
  },
  {
    id: '2',
    title: 'Projeto Social',
    status: 'Aprovado',
    date: 'Enviado em 05 Out 2023',
    hours: 20,
    category: 'Atividade Comunitária',
    description: 'Participação ativa em projeto social focado em educação tecnológica para jovens carentes durante 2 meses.',
    attachment: { name: 'recibo_projeto_social.pdf', size: '1.1 MB', type: 'PDF Document' },
    feedback: { author: 'Coordenador Acadêmico', date: '08 Out 2023', text: 'Excelente iniciativa! Carga horária contabilizada com sucesso no histórico do aluno.' }
  },
  {
    id: '3',
    title: 'Palestra Acadêmica',
    status: 'Reprovado',
    date: 'Enviado em 28 Set 2023',
    hours: 4,
    category: 'Ensino',
    description: 'Participação na palestra magna sobre inovações em Inteligência Artificial no SENAC.',
    rejectionReason: 'O documento anexado não possui assinatura da instituição organizadora.',
    attachment: { name: 'comprovante_palestra.jpg', size: '800 KB', type: 'Image' },
    feedback: { author: 'Secretaria Acadêmica', date: '02 Out 2023', text: 'O documento enviado não atende aos requisitos mínimos exigidos (falta assinatura oficial). Por favor, corrija o envio e submeta novamente.' }
  },
];

const mapSubmissionToActivityMock = (sub: any): ActivityMock => {
  const statusFormatted = 
    sub.status === 'approved' ? 'Aprovado' as const :
    sub.status === 'rejected' ? 'Reprovado' as const : 'Pendente' as const;
  
  const dateFormatted = sub.submitted_at || sub.created_at || new Date().toISOString();
  
  return {
    id: String(sub.id),
    title: sub.title,
    status: statusFormatted,
    date: `Enviado em ${new Date(dateFormatted).toLocaleDateString('pt-BR')}`,
    hours: parseFloat(sub.approved_hours || sub.requested_hours || 0),
    category: sub.category_name || 'Geral',
    description: sub.description || '',
    rejectionReason: sub.status === 'rejected' ? sub.feedback : undefined,
    attachment: {
      name: sub.original_filename || 'certificado.pdf',
      size: sub.file_size_kb ? `${(sub.file_size_kb / 1024).toFixed(1)} MB` : '1.2 MB',
      type: sub.mime_type?.includes('image') ? 'Image' : 'PDF Document'
    },
    feedback: sub.feedback ? {
      author: 'Coordenador Acadêmico',
      date: new Date(sub.reviewed_at || new Date()).toLocaleDateString('pt-BR'),
      text: sub.feedback
    } : undefined
  };
};

export default function HoursListScreen({ route, navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'todas' | 'pendentes' | 'aprovadas' | 'reprovadas'>('todas');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<HourSubmission[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchSubmissions = useCallback((showSpinner = false) => {
    let isMounted = true;
    if (showSpinner) {
      setLoading(true);
    }
    return hoursService.getAll()
      .then(({ data }) => {
        if (isMounted) {
          setSubmissions(data);
          setLoading(false);
          setRefreshing(false);
        }
      })
      .catch(err => {
        console.error('Erro ao listar atividades:', err);
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.initialTab) {
        setActiveTab(route.params.initialTab);
        navigation.setParams({ initialTab: undefined });
      }
      fetchSubmissions(true);
    }, [fetchSubmissions, route.params?.initialTab, navigation])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubmissions(false);
  }, [fetchSubmissions]);

  const activities = submissions.map(mapSubmissionToActivityMock);

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'pendentes' && activity.status !== 'Pendente') return false;
    if (activeTab === 'aprovadas' && activity.status !== 'Aprovado') return false;
    if (activeTab === 'reprovadas' && activity.status !== 'Reprovado') return false;
    if (search && !activity.title.toLowerCase().includes(search.toLowerCase()) && !activity.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusStyle = (status: ActivityMock['status']) => {
    if (status === 'Aprovado') return { bg: '#D1FAE5', text: '#059669' };
    if (status === 'Reprovado') return { bg: '#FEE2E2', text: '#DC2626' };
    return { bg: '#FFEDD5', text: '#D97706' };
  };

  const getIconForActivity = (title: string) => {
    if (title.includes('Certificado')) return 'document-text-outline';
    if (title.includes('Projeto')) return 'heart-outline';
    if (title.includes('Palestra')) return 'school-outline';
    return 'document-outline';
  };

  // Renderização do Estado Vazio (Primeiro Acesso)
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      
      {/* Ilustração Central */}
      <View style={styles.emptyIllustrationContainer}>
        <View style={styles.emptyCardLarge}>
          <Ionicons name="clipboard-outline" size={64} color="#F59E0B" />
          <View style={styles.emptyLinesContainer}>
            <View style={styles.emptyLine} />
            <View style={styles.emptyLine} />
            <View style={[styles.emptyLine, { width: '40%' }]} />
          </View>
        </View>
        <View style={styles.emptyCardSmall}>
          <Ionicons name="search" size={28} color="#1B3A6B" />
        </View>
      </View>

      {/* Textos */}
      <Text style={styles.emptyTitle}>Sua jornada começa aqui</Text>
      <Text style={styles.emptySubtitle}>
        Envie sua primeira atividade complementar e acompanhe sua evolução rumo ao diploma.
      </Text>

      {/* Botão */}
      <TouchableOpacity 
        style={styles.emptyButton} 
        activeOpacity={0.85}
        onPress={() => navigation.navigate('SubmitHours')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.emptyButtonText}>Enviar Primeira Atividade</Text>
      </TouchableOpacity>

      {/* Cards Inferiores */}
      <View style={styles.emptyStatsRow}>
        <View style={styles.emptyStatCard}>
          <View style={styles.statIconRow}>
            <Ionicons name="school-outline" size={16} color="#6B7280" />
            <Text style={styles.statLabel}>CARGA HORÁRIA</Text>
          </View>
          <Text style={styles.statValue}>0h / 120h</Text>
        </View>

        <View style={styles.emptyStatCard}>
          <View style={styles.statIconRow}>
            <Ionicons name="calendar-outline" size={16} color="#F59E0B" />
            <Text style={styles.statLabel}>STATUS</Text>
          </View>
          <Text style={styles.statValue}>Regular</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SENAC Acadêmico</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellIcon}>
          <Ionicons name="notifications-outline" size={24} color="#1B3A6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={submissions.length === 0 ? styles.scrollContentEmpty : styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {submissions.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Text style={styles.pageTitle}>Minhas Atividades</Text>

            {/* ── BUSCA ── */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por categoria..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* ── FILTROS (CHIPS) ── */}
            <View style={styles.chipsContainer}>
              <TouchableOpacity
                style={[styles.chip, activeTab === 'todas' && styles.chipActive]}
                onPress={() => setActiveTab('todas')}
              >
                <Text style={[styles.chipText, activeTab === 'todas' && styles.chipTextActive]}>Todas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, activeTab === 'pendentes' && styles.chipActive]}
                onPress={() => setActiveTab('pendentes')}
              >
                <Text style={[styles.chipText, activeTab === 'pendentes' && styles.chipTextActive]}>Pendentes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, activeTab === 'aprovadas' && styles.chipActive]}
                onPress={() => setActiveTab('aprovadas')}
              >
                <Text style={[styles.chipText, activeTab === 'aprovadas' && styles.chipTextActive]}>Aprovadas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, activeTab === 'reprovadas' && styles.chipActive]}
                onPress={() => setActiveTab('reprovadas')}
              >
                <Text style={[styles.chipText, activeTab === 'reprovadas' && styles.chipTextActive]}>Reprovadas</Text>
              </TouchableOpacity>
            </View>

            {/* ── LISTA DE ATIVIDADES ── */}
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00478F" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Carregando atividades...</Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {filteredActivities.map((activity) => {
                  const statusStyle = getStatusStyle(activity.status);
                  return (
                    <TouchableOpacity
                      key={activity.id}
                      style={styles.activityCard}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('HourDetail', { activity })}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.iconBg}>
                          <Ionicons name={getIconForActivity(activity.title)} size={24} color="#1B3A6B" />
                        </View>
                        <View style={styles.cardInfo}>
                          <Text style={styles.activityName} numberOfLines={1}>{activity.title}</Text>
                          <Text style={styles.activityDate}>{activity.date}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                          <Text style={[styles.badgeText, { color: statusStyle.text }]}>{activity.status}</Text>
                        </View>
                      </View>

                      {activity.rejectionReason && (
                        <View style={styles.rejectionBox}>
                          <Text style={styles.rejectionText}>{activity.rejectionReason}</Text>
                        </View>
                      )}

                      <View style={styles.cardFooter}>
                        <View style={styles.hoursRow}>
                          <Ionicons name="time-outline" size={16} color="#6B7280" style={{ marginRight: 4 }} />
                          <Text style={styles.hoursText}>{String(activity.hours).padStart(2, '0')} horas</Text>
                        </View>
                        <View style={styles.actionRow}>
                          <Text style={[styles.actionText, activity.status === 'Reprovado' && { color: '#DC2626' }]}>
                            {activity.status === 'Reprovado' ? 'Corrigir envio' : activity.status === 'Aprovado' ? 'Visualizar recibo' : 'Ver detalhes'}
                          </Text>
                          <Ionicons 
                            name={activity.status === 'Reprovado' ? 'swap-horizontal' : activity.status === 'Aprovado' ? 'open-outline' : 'chevron-forward'} 
                            size={16} color={activity.status === 'Reprovado' ? '#DC2626' : '#1B3A6B'} style={{ marginLeft: 4 }} 
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {filteredActivities.length === 0 && (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Nenhuma atividade encontrada.</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB SÓ SE TIVER ATIVIDADES */}
      {(submissions.length > 0) && (
        <TouchableOpacity
          style={[styles.fabButton, { bottom: (insets.bottom > 0 ? insets.bottom : 8) + 64 }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SubmitHours')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.fabButtonText}>Nova Atividade</Text>
        </TouchableOpacity>
      )}

      {/* ── BOTTOM TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem}>
          {/* Fundo azul claro para a aba ativa para imitar o estilo pill da imagem levemente */}
          <View style={styles.activeTabPill}>
            <Ionicons name="reader" size={24} color="#00478F" />
            <Text style={[styles.bottomTabLabel, { color: '#00478F', fontWeight: '700', marginTop: 2 }]}>Atividades</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomTabItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Alertas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomTabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Perfil</Text>
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
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6', // Círculo cinza claro
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00478F', // Azul SENAC
  },
  bellIcon: {
    padding: 4,
  },

  // ── SCROLL / LAYOUT ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },

  // ── EMPTY STATE ──
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  emptyIllustrationContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyCardLarge: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyLinesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
  },
  emptyLine: {
    height: 3,
    width: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  emptyCardSmall: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00478F', // Azul SENAC
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00478F',
    width: '100%',
    height: 54,
    borderRadius: 12,
    marginBottom: 40,
    shadowColor: '#00478F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStatsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  emptyStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },

  // ── RESTANTE DA TELA CHEIA ──
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#00478F',
    borderColor: '#00478F',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rejectionBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  rejectionText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#1B3A6B',
    fontWeight: '500',
  },

  // ── BOTÃO FLUTUANTE (FAB) ──
  fabButton: {
    position: 'absolute',
    bottom: 84, // valor base, será sobrescrito inline com insets
    right: 20,
    backgroundColor: '#00478F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 54,
    borderRadius: 27,
    shadowColor: '#00478F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
    backgroundColor: '#F0F6FF', // Fundo azuzinho claro em formato de pílula
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
