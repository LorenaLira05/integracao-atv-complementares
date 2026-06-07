import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';
import { authService } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão ao iniciar o app
  useEffect(() => {
    (async () => {
      const [storedToken, storedUser] = await AsyncStorage.multiGet([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
      ]);
      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        setUser(JSON.parse(storedUser[1]));
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authService.login({ email, password });
    const userObj: User = {
      id: '',
      name: data.nome,
      email: data.email,
      role: data.perfis?.includes('student') ? 'aluno' : 'coordenador',
    };
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, data.token],
      [STORAGE_KEYS.USER, JSON.stringify(userObj)],
    ]);
    setToken(data.token);
    setUser(userObj);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
