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
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { hoursService, AppNotification } from '../../services/api/hoursService';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type NotificationType = 'todas' | 'aprovadas' | 'pendentes' | 'reprovadas';

export default function NotificationsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<NotificationType>('todas');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchNotifications = useCallback(() => {
    let isMounted = true;
    setLoading(true);
    hoursService.getNotificacoes()
      .then(({ data }) => {
        if (isMounted) {
          setNotifications(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Erro ao buscar notificações:', err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(fetchNotifications);

  const handleMarkAllRead = () => {
    hoursService.marcarTodasLidas()
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas.');
      })
      .catch(err => {
        console.error('Erro ao marcar como lidas:', err);
        Alert.alert('Erro', 'Não foi possível marcar todas como lidas.');
      });
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'todas') return true;
    if (activeTab === 'aprovadas') return item.type === 'submission_approved';
    if (activeTab === 'reprovadas') return item.type === 'submission_rejected';
    if (activeTab === 'pendentes') {
      return item.type === 'submission_created' || 
             item.type === 'submission_updated' || 
             item.type === 'submission_returned';
    }
    return true;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.is_read);
  const readNotifications = filteredNotifications.filter(n => n.is_read);

  const TABS: { id: NotificationType; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'aprovadas', label: 'Aprovadas' },
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'reprovadas', label: 'Reprovadas' },
  ];

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `Há ${diffMins} min`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `Há ${diffHrs} h`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return 'Ontem';
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const getNotificationStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'submission_approved':
        return {
          icon: 'checkmark' as const,
          iconColor: '#059669',
          iconBg: '#D1FAE5',
          borderColor: '#10B981',
          defaultTitle: 'Atividade Aprovada',
        };
      case 'submission_rejected':
        return {
          icon: 'close' as const,
          iconColor: '#B91C1C',
          iconBg: '#FEE2E2',
          borderColor: '#DC2626',
          defaultTitle: 'Atividade Reprovada',
        };
      case 'submission_returned':
        return {
          icon: 'warning' as const,
          iconColor: '#D97706',
          iconBg: '#FEF3C7',
          borderColor: '#F59E0B',
          defaultTitle: 'Devolvida para Ajuste',
        };
      case 'submission_created':
      case 'submission_updated':
      default:
        return {
          icon: 'document-text' as const,
          iconColor: '#0284C7',
          iconBg: '#E0F2FE',
          borderColor: '#3B82F6',
          defaultTitle: 'Atualização de Atividade',
        };
    }
  };

  const renderCard = (item: AppNotification) => {
    const styleInfo = getNotificationStyle(item.type);
    const isUnread = !item.is_read;

    return (
      <View
        key={item.id}
        style={[
          styles.notificationCard,
          {
            borderLeftColor: isUnread ? styleInfo.borderColor : 'transparent',
            paddingLeft: isUnread ? 12 : 16,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: styleInfo.iconBg }]}>
          <Ionicons name={styleInfo.icon} size={20} color={styleInfo.iconColor} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title || styleInfo.defaultTitle}</Text>
          <Text style={styles.cardDescription}>
            {item.message || 'Houve uma nova atualização no status da sua atividade.'}
          </Text>
          <Text style={styles.cardTime}>{formatTime(item.created_at)}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="notifications" size={18} color="#1B3A6B" />
          </View>
          <Text style={styles.headerTitle}>Notificações</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <ActivityIndicator size="large" color="#1B3A6B" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Carregando notificações...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── CHIPS (TABS) ── */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.chip, activeTab === tab.id && styles.chipActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.chipText, activeTab === tab.id && styles.chipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── RECENTES ── */}
          {unreadNotifications.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recentes</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markAllReadText}>Marcar todas como lidas</Text>
                </TouchableOpacity>
              </View>
              {unreadNotifications.map(renderCard)}
            </View>
          )}

          {/* ── ANTERIORES ── */}
          {readNotifications.length > 0 && (
            <View style={{ marginTop: unreadNotifications.length > 0 ? 12 : 0 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Anteriores</Text>
              </View>
              {readNotifications.map(renderCard)}
            </View>
          )}

          {notifications.length === 0 && (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
              <Text style={{ color: '#6B7280', fontSize: 15, marginTop: 12, fontStyle: 'italic' }}>
                Nenhuma notificação encontrada.
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── BOTTOM TAB BAR ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="grid-outline" size={20} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('HoursList')}>
          <Ionicons name="clipboard-outline" size={20} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Atividades</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem}>
          <Ionicons name="notifications" size={20} color="#1B3A6B" />
          <Text style={[styles.bottomTabLabel, { color: '#1B3A6B', fontWeight: '700' }]}>Alertas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomTabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={20} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Perfil</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1B3A6B',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3A6B',
  },

  // ── SCROLL / LAYOUT ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  // ── CHIPS (TABS) ──
  chipsScroll: {
    marginBottom: 20,
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#1B3A6B',
    borderColor: '#1B3A6B',
  },
  chipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // ── SECTIONS ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  markAllReadText: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '600',
  },

  // ── NOTIFICATION CARDS ──
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginLeft: 8,
    marginTop: 4,
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
  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 4,
  },
  bottomTabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
