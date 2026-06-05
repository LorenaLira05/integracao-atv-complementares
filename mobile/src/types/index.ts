// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'aluno' | 'coordenador' | 'superadmin';
  courseId?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type SubmissionStatus = 'submitted' | 'approved' | 'rejected' | 'returned_for_adjustment' | 'pendente' | 'aprovado' | 'rejeitado';

export interface HourSubmission {
  id: string;
  userId: string;
  title: string;
  description: string;
  hours: number;
  category: string;
  date: string;
  status: SubmissionStatus;
  attachmentUrl?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
  submitted_at?: string;
  created_at?: string;
  approved_hours?: number;
  requested_hours?: number;
  category_name?: string;
  original_filename?: string;
  file_size_kb?: number;
  mime_type?: string;
}

export interface ActivityMock {
  id: string;
  title: string;
  status: 'Pendente' | 'Aprovado' | 'Reprovado' | 'Em Análise';
  date: string;
  hours: number;
  category: string;
  description: string;
  rejectionReason?: string;
  attachment: {
    name: string;
    size: string;
    type: string;
  };
  feedback?: {
    author: string;
    date: string;
    text: string;
  };
}

// ─── Course ──────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  name: string;
  unit: string;
  module: string;
  modality: 'Presencial' | 'EAD' | 'Híbrido';
  status: 'Ativo' | 'Concluído' | 'Suspenso';
  image: any;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  // Tela de entrada
  Welcome: undefined;        // ← primeira tela que o usuário vê

  // Fluxo de primeiro acesso
  FirstAccess: undefined;    // ← quando é o primeiro login do usuário

  // Auth stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Seleção de curso (após login)
  SelectCourse: undefined;   // ← escolha do curso ativo do aluno

  // App stack
  Dashboard: undefined;
  SubmitHours: undefined;
  SubmitDocument: {
    course_id: number;
    category_id: number;
    title: string;
    description: string;
    requested_hours: number;
    category_name: string;
  };
  SubmitSuccess: undefined;
  HoursList?: { initialTab?: 'todas' | 'pendentes' | 'aprovadas' | 'reprovadas' };
  Notifications: undefined;
  HourDetail: { activity: ActivityMock };
  Profile: undefined;
  Settings: undefined;
};

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
