import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { RootStackParamList, HourSubmission } from '../../types';
import { hoursService, ResumoHorasResponse, MeusDadosResponse } from '../../services/api/hoursService';
import { STORAGE_KEYS, API_BASE_URL } from '../../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [resumo, setResumo] = useState<ResumoHorasResponse | null>(null);
  const [meusDados, setMeusDados] = useState<MeusDadosResponse | null>(null);
  const [recentActivities, setRecentActivities] = useState<HourSubmission[]>([]);
  const [allActivities, setAllActivities] = useState<HourSubmission[]>([]);
  const [courseDetails, setCourseDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback((showSpinner = false) => {
    let isMounted = true;
    if (showSpinner) {
      setLoading(true);
    }

    return Promise.allSettled([
      hoursService.getResumoHoras(),
      hoursService.getMeusDados(),
      hoursService.getAll(),
      hoursService.getCursos(),
      AsyncStorage.getItem(STORAGE_KEYS.SELECTED_COURSE_ID)
    ]).then(([resumoRes, dadosRes, activitiesRes, cursosRes, selectedIdRes]) => {
      if (!isMounted) return;
      if (activitiesRes.status === 'fulfilled') {
        console.log('PRIMEIRA ATIVIDADE:', JSON.stringify(activitiesRes.value.data[0]));  // ← adiciona essa linha
        setRecentActivities(activitiesRes.value.data.slice(0, 3));
        setAllActivities(activitiesRes.value.data);
      }
      if (resumoRes.status === 'fulfilled') setResumo(resumoRes.value.data);
      if (dadosRes.status === 'fulfilled') setMeusDados(dadosRes.value.data);
      if (cursosRes.status === 'fulfilled' && selectedIdRes.status === 'fulfilled') {
        const activeCourse = cursosRes.value.data.find(
          (c: any) => String(c.id) === selectedIdRes.value
        );
        if (activeCourse) setCourseDetails(activeCourse);
      }

      // loga qualquer falha sem travar o dashboard
      [resumoRes, dadosRes, activitiesRes, cursosRes, selectedIdRes].forEach((r, i) => {
        if (r.status === 'rejected') {
          const names = ['resumo-horas', 'meus-dados', 'submissoes', 'cursos', 'storage'];
          console.warn(`[Dashboard] falhou: ${names[i]}`, r.reason);
        }
      });

      setLoading(false);
      setRefreshing(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const percentual = resumo ? Math.round(resumo.percentual_total) : 70;

  const aprovadasCount = allActivities.filter(a => a.status === 'approved' || a.status === 'aprovado').length;
  const reprovadasCount = allActivities.filter(a => a.status === 'rejected' || a.status === 'rejeitado').length;
  const pendentesCount = allActivities.filter(
    a => a.status !== 'approved' && a.status !== 'aprovado' && a.status !== 'rejected' && a.status !== 'rejeitado'
  ).length;

  const getRisco = (p: number) => {
    if (p >= 60) return { label: 'Baixo', color: '#22C55E' };
    if (p >= 30) return { label: 'Médio', color: '#F59E0B' };
    return { label: 'Alto', color: '#EF4444' };
  };

  const activeSemester = courseDetails?.semestres
    ? `Semestre ${courseDetails.semestres}`
    : 'Unidade IV';

  const getCardTheme = () => {
    if (resumo?.recomendacoes && resumo.recomendacoes.length > 0) {
      const rec = resumo.recomendacoes[0];
      if (rec.prioridade === 'alta') {
        return {
          bg: '#FEF2F2',
          border: '#FEE2E2',
          title: 'Ação Crítica',
          titleColor: '#B91C1C',
          textColor: '#7F1D1D',
          icon: 'alert-circle' as const,
          iconColor: '#EF4444',
        };
      }
      return {
        bg: '#FFFDF5',
        border: '#FEF3C7',
        title: 'Recomendação',
        titleColor: '#B45309',
        textColor: '#78350F',
        icon: 'bulb' as const,
        iconColor: '#F59E0B',
      };
    }

    if (resumo?.insights && resumo.insights.length > 0) {
      const ins = resumo.insights[0];
      if (ins.nivel_alerta === 'alto') {
        return {
          bg: '#FEF2F2',
          border: '#FEE2E2',
          title: 'Alerta Importante',
          titleColor: '#B91C1C',
          textColor: '#7F1D1D',
          icon: 'alert-circle' as const,
          iconColor: '#EF4444',
        };
      }
      return {
        bg: '#F8FAFC',
        border: '#E2E8F0',
        title: 'Análise Acadêmica',
        titleColor: '#334155',
        textColor: '#475569',
        icon: 'information-circle' as const,
        iconColor: '#64748B',
      };
    }

    if (percentual >= 60) {
      return {
        bg: '#ECFDF5',
        border: '#D1FAE5',
        title: 'Excelente Progresso',
        titleColor: '#047857',
        textColor: '#064E3B',
        icon: 'checkmark-circle' as const,
        iconColor: '#10B981',
      };
    }
    return {
      bg: '#FFFDF5',
      border: '#FEF3C7',
      title: 'Plano de Foco',
      titleColor: '#1B3A6B',
      textColor: '#334155',
      icon: 'bulb' as const,
      iconColor: '#E87722',
    };
  };

  const theme = getCardTheme();

  const textToShow = resumo?.recomendacoes && resumo.recomendacoes.length > 0
    ? `${resumo.recomendacoes[0].titulo}: ${resumo.recomendacoes[0].recomendacao}`
    : resumo?.insights && resumo.insights.length > 0
    ? `${resumo.insights[0].titulo}: ${resumo.insights[0].descricao}`
    : percentual >= 60
    ? 'Continue com seu bom desempenho e siga acumulando suas horas.'
    : 'Foque no envio de atividades pendentes para regularizar sua situação.';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1B3A6B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SENAC Acadêmico</Text>
        {/* Espaçador para centralizar o título */}
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <ActivityIndicator size="large" color="#1B3A6B" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Carregando dados acadêmicos...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* ── BEM-VINDO ── */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeLabel}>BEM-VINDO(A),</Text>
            <Text style={styles.userName}>{meusDados?.aluno?.nome || 'Rodrigo Silva'}</Text>

            <View style={styles.courseRow}>
              <Ionicons name="school" size={16} color="#E87722" style={{ marginRight: 6 }} />
              <Text style={styles.courseName}>{meusDados?.aluno?.curso_nome || resumo?.curso || 'Análise e Desenvolvimento de Sistemas'}</Text>
            </View>
          </View>

          {/* ── CARD PRINCIPAL: HORAS ACUMULADAS ── */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardTopRow}>
              <View style={styles.mainCardLeft}>
                <Text style={styles.cardTitle}>Horas Acumuladas</Text>
                <Text style={styles.progressLabel}>Progresso total do curso</Text>
              </View>

              {/* Gráfico de Gauge */}
              <View style={styles.gaugeWrapper}>
                <View style={styles.gaugeContainer}>
                  <Svg width={90} height={55} viewBox="0 0 100 60">
                    <Path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth={8}
                      strokeLinecap="round"
                    />
                    <Path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeDasharray="125.66"
                      strokeDashoffset={125.66 * (1 - Math.min(Math.max(percentual, 0), 100) / 100)}
                    />
                  </Svg>
                  <View style={styles.gaugeTextContainer}>
                    <Text style={styles.gaugeText}>{percentual}%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Barra horizontal de status (Horas e Risco) */}
            <View style={styles.statusPill}>
              <Text style={styles.statusPillHours}>
                <Text style={styles.statusPillHoursBold}>{resumo ? resumo.total_integralizado : 70}h</Text>/ {resumo ? resumo.total_obrigatorio : 100}h
              </Text>
              <Text style={styles.statusPillRisk}>
                Risco: <Text style={[styles.statusPillRiskValue, { color: getRisco(percentual).color }]}>{getRisco(percentual).label}</Text>
              </Text>
            </View>

            {/* Bloco de Recomendações */}
            <View style={[styles.recommendationsCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <View style={styles.recommendationsIconContainer}>
                <Ionicons name={theme.icon} size={18} color={theme.iconColor} />
              </View>
              <View style={styles.recommendationsTextContainer}>
                <Text style={[styles.recommendationsTitle, { color: theme.titleColor }]}>{theme.title}:</Text>
                <Text style={[styles.recommendationsText, { color: theme.textColor }]}>
                  {textToShow}
                </Text>
              </View>
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>{activeSemester}</Text>
              </View>
            </View>
          </View>

          {/* ── CARDS DE RESUMO (STATUS) ── */}
          <View style={styles.summaryRow}>
            {/* Pendentes */}
            <TouchableOpacity 
              style={styles.summaryCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HoursList', { initialTab: 'pendentes' })}
            >
              <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.summaryValue}>{String(pendentesCount).padStart(2, '0')}</Text>
              <Text style={styles.summaryLabel}>Pendentes</Text>
            </TouchableOpacity>

            {/* Aprovadas */}
            <TouchableOpacity 
              style={styles.summaryCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HoursList', { initialTab: 'aprovadas' })}
            >
              <View style={[styles.iconBg, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.summaryValue}>{String(aprovadasCount).padStart(2, '0')}</Text>
              <Text style={styles.summaryLabel}>Aprovadas</Text>
            </TouchableOpacity>

            {/* Reprovadas */}
            <TouchableOpacity 
              style={styles.summaryCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HoursList', { initialTab: 'reprovadas' })}
            >
              <View style={[styles.iconBg, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.summaryValue}>{String(reprovadasCount).padStart(2, '0')}</Text>
              <Text style={styles.summaryLabel}>Reprovadas</Text>
            </TouchableOpacity>
          </View>

          {/* ── BOTÃO NOVA ATIVIDADE & PDF ── */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('SubmitHours')}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Nova Atividade</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pdfButton}
              activeOpacity={0.7}
              onPress={async () => {
                try {
                  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
                  if (!token) {
                    Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente.');
                    return;
                  }
                  const url = `${API_BASE_URL}/aluno/extrato-print?token=${encodeURIComponent(token)}`;
                  await Linking.openURL(url);
                } catch (err) {
                  console.error('Erro ao abrir extrato:', err);
                  Alert.alert('Erro', 'Falha ao processar exportação de extrato.');
                }
              }}
            >
              <Text style={styles.pdfButtonText}>Exportar Extratos de Horas (PDF)</Text>
            </TouchableOpacity>
          </View>

          {/* ── ATIVIDADES RECENTES ── */}
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Atividades Recentes</Text>

            {recentActivities.map((activity) => {
              const dateStr = activity.submitted_at || activity.created_at || new Date().toISOString();
              const dateFormatted = new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
              const isApproved = activity.status === 'approved' || activity.status === 'aprovado';
              const isRejected = activity.status === 'rejected' || activity.status === 'rejeitado';

              return (
                <TouchableOpacity
                  key={String(activity.id ?? Math.random())}
                  style={styles.activityCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('HoursList')}
                >
                  <View style={styles.activityIconBg}>
                    <Ionicons name="document-text" size={22} color="#1B3A6B" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName} numberOfLines={2}>{activity.title}</Text>
                    <Text style={styles.activityDate}>Enviado em {dateFormatted}</Text>
                  </View>
                  <View style={[
                    isApproved ? styles.badgeApproved :
                      isRejected ? styles.badgeRejected : styles.badgePending
                  ]}>
                    <Text style={[
                      isApproved ? styles.badgeApprovedText :
                        isRejected ? styles.badgeRejectedText : styles.badgePendingText
                    ]}>
                      {isApproved ? 'Aprovada' :
                        isRejected ? 'Reprovada' : 'Pendente'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {recentActivities.length === 0 && (
              <Text style={styles.emptyRecentText}>Nenhuma atividade enviada recentemente.</Text>
            )}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* ── BOTTOM TAB BAR (Estática/Mock) ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="grid" size={20} color="#1B3A6B" />
          <Text style={[styles.tabLabel, { color: '#1B3A6B', fontWeight: '700' }]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('HoursList')}
        >
          <Ionicons name="clipboard-outline" size={20} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Atividades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Alertas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={20} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // ── HEADER ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3A6B',
    textAlign: 'center',
  },

  // ── SCROLL / LAYOUT ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── BEM-VINDO ──
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeLabel: {
    fontSize: 12,
    color: '#1B3A6B',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 6,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseName: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },

  // ── CARD PRINCIPAL ──
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mainCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainCardLeft: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  gaugeWrapper: {
    width: 90,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeContainer: {
    position: 'relative',
    width: 90,
    height: 55,
  },
  gaugeTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3A6B',
  },
  statusPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  statusPillHours: {
    fontSize: 14,
    color: '#64748B',
  },
  statusPillHoursBold: {
    fontWeight: '700',
    color: '#1B3A6B',
  },
  statusPillRisk: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statusPillRiskValue: {
    fontWeight: '700',
  },
  recommendationsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFDF5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  recommendationsIconContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  recommendationsTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 2,
  },
  recommendationsText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  unitBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E87722',
  },

  // ── CARDS DE RESUMO ──
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // ── BOTÕES DE AÇÃO ──
  actionContainer: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1B3A6B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pdfButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pdfButtonText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── ATIVIDADES RECENTES ──
  recentSection: {
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  activityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0F5FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
    marginRight: 8,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#64748B',
  },
  badgeApproved: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeApprovedText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  badgePending: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePendingText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeRejected: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRejectedText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyRecentText: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
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
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
