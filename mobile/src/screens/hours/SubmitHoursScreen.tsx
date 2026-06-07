import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { hoursService } from '../../services/api/hoursService';

type Props = NativeStackScreenProps<RootStackParamList, 'SubmitHours'>;

export default function SubmitHoursScreen({ navigation }: Props) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [horas, setHoras] = useState('');
  const [descricao, setDescricao] = useState('');

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hoursService.getResumoHoras()
      .then(({ data }) => {
        setCourseId(data.course_id);
        if (data.limites) {
          setCategories(data.limites.map(l => ({ id: l.category_id, name: l.categoria })));
        }
      })
      .catch(() => {
        // fallback: pega do AsyncStorage
        AsyncStorage.getItem('@sistema_horas:selected_course_id')
          .then(id => { if (id) setCourseId(parseInt(id)); });
      });
  }, []);

  const handleHorasChange = (text: string) => {
    // Remove qualquer caractere não numérico
    const cleanText = text.replace(/[^0-9]/g, '');
    // Limita a no máximo 2 dígitos
    const limitedText = cleanText.substring(0, 2);
    // Impede começar com zero
    if (limitedText.startsWith('0')) {
      setHoras(limitedText.substring(1));
      return;
    }
    setHoras(limitedText);
  };

  const handleContinue = () => {
    if (!titulo || !categoriaId || !horas || !descricao) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    const parsedHoras = parseInt(horas, 10);
    if (isNaN(parsedHoras) || parsedHoras < 1 || parsedHoras > 99) {
      setError('A carga horária deve ser um número de 1 a 99.');
      return;
    }
    if (!courseId) {
      setError('Erro ao carregar o curso do aluno. Verifique sua conexão ou tente fazer login novamente.');
      return;
    }
    setError(null);
    navigation.navigate('SubmitDocument', {
      course_id: courseId,
      category_id: categoriaId,
      title: titulo,
      description: descricao,
      requested_hours: parsedHoras,
      category_name: categoria,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1B3A6B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Atividade</Text>
        </View>
        <View style={styles.avatarPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── PROGRESSO (Passo 1 de 2) ── */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressStepText}>Passo 1 de 2</Text>
              <Text style={styles.progressDescText}>Detalhes da Atividade</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '50%' }]} />
            </View>
          </View>

          {error && <Text style={{ color: '#EF4444', marginBottom: 12, fontWeight: '600' }}>{error}</Text>}

          {/* ── FORMULÁRIO ── */}
          <View style={styles.formCard}>

            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título da Atividade *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Curso de Metodologias Ágeis"
                  placeholderTextColor="#9CA3AF"
                  value={titulo}
                  onChangeText={setTitulo}
                />
              </View>
            </View>

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria *</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                activeOpacity={0.8}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={categoria ? styles.inputText : styles.placeholderText}>
                  {categoria || 'Selecione uma categoria'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Carga Horária */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carga Horária (horas) *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 40"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={horas}
                  onChangeText={handleHorasChange}
                  maxLength={2}
                />
                <Ionicons name="time-outline" size={20} color="#6B7280" />
              </View>
            </View>

            {/* Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição *</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Descreva brevemente a atividade realizada e seu aprendizado..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  value={descricao}
                  onChangeText={setDescricao}
                />
              </View>
            </View>

          </View>

          {/* ── INFO ALERT ── */}
          <View style={styles.infoAlert}>
            <Ionicons name="information-circle-outline" size={22} color="#1B3A6B" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Na próxima etapa, você precisará anexar um arquivo PDF, PNG, JPG ou imagem do certificado para comprovação.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MODAL DE CATEGORIAS ── */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandleBar} />
            <Text style={styles.modalTitle}>Selecione a Categoria</Text>
            <FlatList
              data={categories}
              keyExtractor={(item, index) => String(item.id ?? index)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategoria(item.name);
                    setCategoriaId(item.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={{ marginBottom: 20 }}
            />
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuar para Comprovante</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  keyboardView: {
    flex: 1,
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
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB', // Círculo vazio
  },

  // ── SCROLL / LAYOUT ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ── PROGRESSO ──
  progressContainer: {
    marginBottom: 24,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressStepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00478F', // Azul escuro
  },
  progressDescText: {
    fontSize: 12,
    color: '#4B5563',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E87722', // Laranja Senac
    borderRadius: 3,
  },

  // ── FORMULÁRIO (CARD) ──
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  textAreaWrapper: {
    height: 120,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    height: '100%',
    width: '100%',
  },
  inputText: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  placeholderText: {
    fontSize: 15,
    color: '#9CA3AF',
  },

  // ── INFO ALERT ──
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF', // Azul bem claro
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },

  // ── FOOTER ──
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    backgroundColor: '#00478F', // Azul escuro
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 10,
    shadowColor: '#00478F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '60%',
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3A6B',
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 15,
    color: '#111827',
  },
  modalCancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginTop: 8,
  },
  modalCancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 15,
  },
});
