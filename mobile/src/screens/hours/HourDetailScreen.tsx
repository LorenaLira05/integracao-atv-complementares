import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'HourDetail'>;

export default function HourDetailScreen({ navigation, route }: Props) {
  // Recebe o objeto activity enviado pela tela anterior
  const { activity } = route.params;
  const insets = useSafeAreaInsets();

  const getStatusColor = (status: string) => {
    if (status === 'Aprovada') return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' };
    if (status === 'Em Análise' || status === 'Pendente') return { bg: '#FEF3C7', text: '#D97706', icon: 'ellipsis-horizontal-circle' };
    return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
  };

  const statusStyle = getStatusColor(activity.status);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Atividade</Text>
        </View>
        {/* Sem avatar conforme imagem de exemplo e tela anterior */}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── STATUS E DATA ── */}
        <View style={styles.topInfoRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{activity.status}</Text>
          </View>
          <Text style={styles.dateText}>{activity.date}</Text>
        </View>

        {/* ── TÍTULO ── */}
        <Text style={styles.activityTitle}>{activity.title}</Text>

        {/* ── CARDS DE CATEGORIA E CARGA HORÁRIA ── */}
        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Categoria</Text>
            <View style={styles.infoCardValueRow}>
              <Ionicons name="school-outline" size={18} color="#1B3A6B" style={{ marginRight: 6 }} />
              <Text style={styles.infoCardValue}>{activity.category}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Carga Horária</Text>
            <View style={styles.infoCardValueRow}>
              <Ionicons name="time-outline" size={18} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.infoCardValue}>{String(activity.hours).padStart(2, '0')} Horas</Text>
            </View>
          </View>
        </View>

        {/* ── DESCRIÇÃO ── */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionLabel}>Descrição do Aluno</Text>
          <Text style={styles.descriptionText}>{activity.description}</Text>
        </View>

        {/* ── COMPROVANTE ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="attach" size={20} color="#1A1A2E" style={{ marginRight: 6 }} />
            <Text style={styles.sectionLabelDark}>Comprovante de Atividade</Text>
          </View>
          
          <View style={styles.attachmentCard}>
            <View style={styles.attachmentIconBg}>
              <Ionicons name="document-text-outline" size={24} color="#1B3A6B" />
            </View>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName} numberOfLines={1}>{activity.attachment.name}</Text>
              <Text style={styles.attachmentSize}>{activity.attachment.size} • {activity.attachment.type}</Text>
            </View>
            <TouchableOpacity style={styles.attachmentViewButton}>
              <Ionicons name="eye-outline" size={24} color="#1B3A6B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── FEEDBACK DO COORDENADOR ── */}
        {activity.feedback && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles" size={20} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.sectionLabelDark}>Feedback do Avaliador</Text>
            </View>

            <View style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.coordinatorAvatar}>
                  <Text style={styles.coordinatorInitials}>
                    {activity.feedback.author.charAt(0)}
                  </Text>
                </View>
                <View style={styles.feedbackAuthorInfo}>
                  <Text style={styles.feedbackAuthor}>{activity.feedback.author}</Text>
                  <Text style={styles.feedbackDate}>{activity.feedback.date}</Text>
                </View>
              </View>
              <Text style={styles.feedbackText}>{activity.feedback.text}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── BOTTOM TAB BAR (Mockup) ── */}
      <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('HoursList')}>
          <Ionicons name="reader" size={24} color="#1B3A6B" />
          <Text style={[styles.bottomTabLabel, { color: '#1B3A6B', fontWeight: '600' }]}>Atividades</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem}>
          <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
          <Text style={styles.bottomTabLabel}>Alertas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomTabItem}>
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
    backgroundColor: '#F7F9FC', // Fundo clarinho
  },
  
  // ── HEADER ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF', // Conforme a imagem, o header parece ser branco
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
    fontSize: 17,
    fontWeight: '700',
    color: '#1B3A6B',
  },

  // ── SCROLL / LAYOUT ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── STATUS E DATA ──
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // ── TÍTULO ──
  activityTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
  },

  // ── CARDS INFO (Categoria/Horas) ──
  infoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  infoCardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },

  // ── DESCRIÇÃO ──
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },

  // ── SEÇÕES ──
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabelDark: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },

  // ── COMPROVANTE ──
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
  },
  attachmentIconBg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  attachmentViewButton: {
    padding: 4,
  },

  // ── FEEDBACK ──
  feedbackCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coordinatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B3A6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coordinatorInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackAuthorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  feedbackAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  feedbackText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // ── BOTTOM TAB BAR (Mockup) ──
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
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
