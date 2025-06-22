
import { useState, useMemo, useCallback } from 'react';
import { Disciplina, CalculoResultado, TipoCalculo, DisciplinaParcial, Atividade } from '@/types';
import { usePersistentState, useCalculadoraPersistence } from './usePersistentState';
import { estaReprovadoPorFaltas } from '@/utils/faltasUtils';

export const useCalculadora = () => {
  const { getStorageKey } = useCalculadoraPersistence();

  // Estados persistentes
  const [disciplinas, setDisciplinas] = usePersistentState<Disciplina[]>(
    getStorageKey('disciplinas'),
    []
  );
  
  const [disciplinasParciais, setDisciplinasParciais] = usePersistentState<DisciplinaParcial[]>(
    getStorageKey('disciplinas-parciais'),
    []
  );
  
  const [tipoCalculo, setTipoCalculo] = usePersistentState<TipoCalculo>(
    getStorageKey('tipo-calculo'),
    'periodo'
  );

  // Função para atualizar timestamp da última modificação
  const updateLastModified = useCallback(() => {
    localStorage.setItem(getStorageKey('last-modified'), new Date().toISOString());
  }, [getStorageKey]);

  const adicionarDisciplina = useCallback((novaDisciplina: Omit<Disciplina, 'id'>) => {
    const disciplinaComId: Disciplina = {
      ...novaDisciplina,
      id: Date.now().toString() + Math.random().toString(36)
    };
    setDisciplinas(prev => [...prev, disciplinaComId]);
    updateLastModified();
  }, [setDisciplinas, updateLastModified]);

  const adicionarDisciplinaParcial = useCallback((novaDisciplina: Omit<DisciplinaParcial, 'id' | 'atividades'>) => {
    const disciplinaComId: DisciplinaParcial = {
      ...novaDisciplina,
      id: Date.now().toString() + Math.random().toString(36),
      atividades: []
    };
    setDisciplinasParciais(prev => [...prev, disciplinaComId]);
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const adicionarAtividade = useCallback((disciplinaId: string, atividade: Omit<Atividade, 'id'>) => {
    const atividadeComId: Atividade = {
      ...atividade,
      id: Date.now().toString() + Math.random().toString(36)
    };
    
    setDisciplinasParciais(prev => 
      prev.map(disciplina => 
        disciplina.id === disciplinaId 
          ? { ...disciplina, atividades: [...disciplina.atividades, atividadeComId] }
          : disciplina
      )
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const removerDisciplina = useCallback((id: string) => {
    setDisciplinas(prev => prev.filter(d => d.id !== id));
    updateLastModified();
  }, [setDisciplinas, updateLastModified]);

  const removerDisciplinaParcial = useCallback((id: string) => {
    setDisciplinasParciais(prev => prev.filter(d => d.id !== id));
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const limparDisciplinas = useCallback(() => {
    setDisciplinas([]);
    updateLastModified();
  }, [setDisciplinas, updateLastModified]);

  const limparDisciplinasParciais = useCallback(() => {
    setDisciplinasParciais([]);
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const calcularNotaParcial = (atividades: Atividade[]): number => {
    if (atividades.length === 0) return 0;
    
    // Soma apenas os pontos obtidos (não faz regra de 3)
    // A nota parcial é simplesmente a soma dos pontos obtidos
    const pontosObtidos = atividades.reduce((acc, atividade) => acc + atividade.notaObtida, 0);
    
    // Retorna os pontos obtidos (máximo 100)
    return Math.min(pontosObtidos, 100);
  };

  const calcularPontosConsumidos = (atividades: Atividade[]): number => {
    // Calcula quantos pontos já foram "consumidos" da disciplina (valor total das atividades)
    return atividades.reduce((acc, atividade) => acc + atividade.notaTotal, 0);
  };

  const disciplinasParciaisComNotas = useMemo(() => {
    return disciplinasParciais.map(disciplina => {
      const notaParcial = calcularNotaParcial(disciplina.atividades);
      const pontosConsumidos = calcularPontosConsumidos(disciplina.atividades);
      
      // Se reprovado por faltas, nota final é 0
      const faltasAtuais = disciplina.faltas || 0;
      const notaFinal = estaReprovadoPorFaltas(disciplina.creditos, faltasAtuais) ? 0 : notaParcial;
      
      return {
        ...disciplina,
        notaParcial: notaFinal,
        pontosConsumidos
      };
    });
  }, [disciplinasParciais]);

  const resultado = useMemo((): CalculoResultado | null => {
    if (tipoCalculo === 'parcial') {
      if (disciplinasParciaisComNotas.length === 0) return null;

      const disciplinasComNota = disciplinasParciaisComNotas.filter(d => d.atividades.length > 0);
      if (disciplinasComNota.length === 0) return null;

      const somaNotasCreditos = disciplinasComNota.reduce(
        (acc, disciplina) => acc + (disciplina.notaParcial! * disciplina.creditos),
        0
      );
      
      const totalCreditos = disciplinasComNota.reduce(
        (acc, disciplina) => acc + disciplina.creditos,
        0
      );

      const mediaGeral = totalCreditos > 0 ? somaNotasCreditos / totalCreditos : 0;

      return {
        mediaGeral,
        totalCreditos,
        totalDisciplinas: disciplinasComNota.length
      };
    } else {
      if (disciplinas.length === 0) return null;

      const somaNotasCreditos = disciplinas.reduce(
        (acc, disciplina) => acc + (disciplina.nota * disciplina.creditos),
        0
      );
      
      const totalCreditos = disciplinas.reduce(
        (acc, disciplina) => acc + disciplina.creditos,
        0
      );

      const mediaGeral = totalCreditos > 0 ? somaNotasCreditos / totalCreditos : 0;

      return {
        mediaGeral,
        totalCreditos,
        totalDisciplinas: disciplinas.length
      };
    }
  }, [disciplinas, disciplinasParciaisComNotas, tipoCalculo]);

  const editarAtividade = useCallback((disciplinaId: string, atividadeId: string, dadosAtualizados: Omit<Atividade, 'id'>) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => {
        if (disciplina.id === disciplinaId) {
          const novasAtividades = disciplina.atividades.map(atividade =>
            atividade.id === atividadeId
              ? { ...atividade, ...dadosAtualizados }
              : atividade
          );
          return { ...disciplina, atividades: novasAtividades };
        }
        return disciplina;
      })
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const removerAtividade = useCallback((disciplinaId: string, atividadeId: string) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => {
        if (disciplina.id === disciplinaId) {
          const novasAtividades = disciplina.atividades.filter(atividade => 
            atividade.id !== atividadeId
          );
          return { ...disciplina, atividades: novasAtividades };
        }
        return disciplina;
      })
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const adicionarFalta = useCallback((disciplinaId: string) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => {
        if (disciplina.id === disciplinaId) {
          const faltasAtuais = disciplina.faltas || 0;
          return { ...disciplina, faltas: faltasAtuais + 1 };
        }
        return disciplina;
      })
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const adicionarAulaDupla = useCallback((disciplinaId: string) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => {
        if (disciplina.id === disciplinaId) {
          const faltasAtuais = disciplina.faltas || 0;
          return { ...disciplina, faltas: faltasAtuais + 2 };
        }
        return disciplina;
      })
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const removerFalta = useCallback((disciplinaId: string) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => {
        if (disciplina.id === disciplinaId) {
          const faltasAtuais = disciplina.faltas || 0;
          return { ...disciplina, faltas: Math.max(0, faltasAtuais - 1) };
        }
        return disciplina;
      })
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const definirFaltas = useCallback((disciplinaId: string, novaQuantidade: number) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => {
        if (disciplina.id === disciplinaId) {
          return { ...disciplina, faltas: Math.max(0, novaQuantidade) };
        }
        return disciplina;
      })
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  // Funções de persistência
  const persistence = useCalculadoraPersistence();

  return {
    disciplinas,
    disciplinasParciais: disciplinasParciaisComNotas,
    tipoCalculo,
    resultado,
    adicionarDisciplina,
    adicionarDisciplinaParcial,
    adicionarAtividade,
    editarAtividade,
    removerAtividade,
    adicionarFalta,
    adicionarAulaDupla,
    removerFalta,
    definirFaltas,
    removerDisciplina,
    removerDisciplinaParcial,
    limparDisciplinas,
    limparDisciplinasParciais,
    setTipoCalculo,
    // Funções de persistência
    persistence: {
      exportData: persistence.exportData,
      importData: persistence.importData,
      clearAllData: persistence.clearAllData,
      getStorageInfo: persistence.getStorageInfo
    }
  };
};
