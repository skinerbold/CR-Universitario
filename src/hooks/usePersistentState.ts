import { useState, useEffect, useCallback } from 'react';

/**
 * Hook customizado para persistir estado no localStorage
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    onError?: (error: Error) => void;
  }
) {
  const serialize = options?.serialize || JSON.stringify;
  const deserialize = options?.deserialize || JSON.parse;
  const onError = options?.onError || console.error;

  // Função para carregar dados do localStorage
  const loadStoredValue = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return deserialize(item);
    } catch (error) {
      onError(new Error(`Erro ao carregar dados do localStorage para chave "${key}": ${error}`));
      return defaultValue;
    }
  }, [key, defaultValue, deserialize, onError]);

  // Estado inicial carregado do localStorage
  const [state, setState] = useState<T>(loadStoredValue);

  // Função para salvar no localStorage
  const saveToStorage = useCallback((value: T) => {
    try {
      localStorage.setItem(key, serialize(value));
    } catch (error) {
      onError(new Error(`Erro ao salvar dados no localStorage para chave "${key}": ${error}`));
    }
  }, [key, serialize, onError]);

  // Função para atualizar o estado e salvar automaticamente
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      saveToStorage(newValue);
      return newValue;
    });
  }, [saveToStorage]);

  // Função para limpar dados do storage
  const clearValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      onError(new Error(`Erro ao limpar dados do localStorage para chave "${key}": ${error}`));
    }
  }, [key, defaultValue, onError]);

  // Função para recarregar do storage
  const reloadValue = useCallback(() => {
    const newValue = loadStoredValue();
    setState(newValue);
  }, [loadStoredValue]);

  // Efeito para salvar quando o estado muda
  useEffect(() => {
    saveToStorage(state);
  }, [state, saveToStorage]);

  return [state, setValue, { clearValue, reloadValue }] as const;
}

/**
 * Hook específico para dados da calculadora de CR
 */
export function useCalculadoraPersistence() {
  const getStorageKey = (suffix: string) => `calculadora-cr-${suffix}`;

  // Utilitários para backup e restore
  const exportData = useCallback(() => {
    try {
      const data = {
        disciplinas: localStorage.getItem(getStorageKey('disciplinas')),
        disciplinasParciais: localStorage.getItem(getStorageKey('disciplinas-parciais')),
        tipoCalculo: localStorage.getItem(getStorageKey('tipo-calculo')),
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-calculadora-cr-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return false;
    }
  }, []);

  const importData = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Validar estrutura básica
          if (!data.version || !data.timestamp) {
            throw new Error('Formato de arquivo inválido');
          }
          
          // Restaurar dados
          if (data.disciplinas) {
            localStorage.setItem(getStorageKey('disciplinas'), data.disciplinas);
          }
          if (data.disciplinasParciais) {
            localStorage.setItem(getStorageKey('disciplinas-parciais'), data.disciplinasParciais);
          }
          if (data.tipoCalculo) {
            localStorage.setItem(getStorageKey('tipo-calculo'), data.tipoCalculo);
          }
          
          resolve(true);
        } catch (error) {
          console.error('Erro ao importar dados:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey('disciplinas'));
      localStorage.removeItem(getStorageKey('disciplinas-parciais'));
      localStorage.removeItem(getStorageKey('tipo-calculo'));
      return true;
    } catch (error) {
      console.error('Erro ao limpar todos os dados:', error);
      return false;
    }
  }, []);

  const getStorageInfo = useCallback(() => {
    try {
      const disciplinas = localStorage.getItem(getStorageKey('disciplinas'));
      const disciplinasParciais = localStorage.getItem(getStorageKey('disciplinas-parciais'));
      const tipoCalculo = localStorage.getItem(getStorageKey('tipo-calculo'));
      
      return {
        hasData: !!(disciplinas || disciplinasParciais || tipoCalculo),
        disciplinasCount: disciplinas ? JSON.parse(disciplinas).length : 0,
        disciplinasParciaisCount: disciplinasParciais ? JSON.parse(disciplinasParciais).length : 0,
        lastModified: localStorage.getItem(getStorageKey('last-modified')) || 'Nunca',
        storageSize: new Blob([
          disciplinas || '',
          disciplinasParciais || '',
          tipoCalculo || ''
        ]).size
      };
    } catch (error) {
      return {
        hasData: false,
        disciplinasCount: 0,
        disciplinasParciaisCount: 0,
        lastModified: 'Erro',
        storageSize: 0
      };
    }
  }, []);

  return {
    getStorageKey,
    exportData,
    importData,
    clearAllData,
    getStorageInfo
  };
}
