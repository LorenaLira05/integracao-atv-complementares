/**
 * RootNavigator.tsx
 *
 * Navegação raiz do aplicativo.
 * Define QUAIS telas existem e em QUAL ORDEM aparecem.
 *
 * Fluxo de navegação:
 *
 *   Não autenticado:
 *     Welcome ──► FirstAccess ──► Login ──► SelectCourse
 *
 *   Autenticado:
 *     Dashboard ──► SubmitHours / Profile
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// ─── Imports de telas ───────────────────────────────────────────────────
import {
  WelcomeScreen,        // boas-vindas (apenas no 1º acesso)
  FirstAccessScreen,    // primeiro acesso (senha inicial)
  LoginScreen,
  ForgotPasswordScreen,
  SelectCourseScreen,   // seleção do curso ativo (após login)
  DashboardScreen,
  HoursListScreen,
  HourDetailScreen,
  SubmitHoursScreen,
  SubmitDocumentScreen,
  SubmitSuccessScreen,
  NotificationsScreen,
  ProfileScreen,
} from '../screens';

// Cria o Stack Navigator tipado com todas as rotas possíveis
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // TODO: substituir pelo valor real do useAuth() quando implementar auth
  const isAuthenticated = false;

  return (
    // NavigationContainer é o "contexto" que envolve toda a navegação
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,  // remove o header padrão em todas as telas
          animation: 'fade',   // animação suave entre telas
        }}
      >
        {/* ── Fluxo de entrada ── */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="FirstAccess" component={FirstAccessScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="SelectCourse" component={SelectCourseScreen} />

        {/* ── Fluxo principal (Dashboard) ── */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="HoursList" component={HoursListScreen} />
        <Stack.Screen name="HourDetail" component={HourDetailScreen} />
        <Stack.Screen name="SubmitHours" component={SubmitHoursScreen} />
        <Stack.Screen name="SubmitDocument" component={SubmitDocumentScreen} />
        <Stack.Screen name="SubmitSuccess" component={SubmitSuccessScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
