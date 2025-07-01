import { useState, useMemo, useCallback, useEffect } from 'react';
import { Disciplina, CalculoResultado, TipoCalculo, DisciplinaParcial, Atividade, Periodo, Prova, ModalidadeAvaliacao } from '@/types';
import { usePersistentState, useCalculadoraPersistence } from './usePersistentState';
import { estaReprovadoPorFaltas } from '@/utils/faltasUtils';
import { 
  migrarDisciplinaParaNovoFormato, 
  calcularNotaFinalDisciplina,
  verificarNecessidadeMigracao,
  executarMigracaoCompleta,
  determinarStatusDisciplina,
  calcularNotaMinimaRecuperacao,
  calcularNotaFinalRecuperacao,
  disciplinaEstaCompleta
} from '@/utils/avaliacaoUtils';

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

  // Migração automática das disciplinas existentes para o novo formato
  useEffect(() => {
    const disciplinasAtuais = JSON.parse(localStorage.getItem(getStorageKey('disciplinas-parciais')) || '[]');
    
    if (disciplinasAtuais.length > 0 && verificarNecessidadeMigracao(disciplinasAtuais)) {
      console.log('🔄 Migrando disciplinas para novo formato com modalidades...');
      const disciplinasMigradas = executarMigracaoCompleta(disciplinasAtuais);
      setDisciplinasParciais(disciplinasMigradas);
      console.log('✅ Migração concluída!', disciplinasMigradas.length, 'disciplinas migradas');
    }
  }, [getStorageKey, setDisciplinasParciais]);

  const [periodos, setPeriodos] = usePersistentState<Periodo[]>(
    getStorageKey('periodos'),
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

  const adicionarDisciplinaParcial = useCallback((novaDisciplina: Omit<DisciplinaParcial, 'id' | 'atividades' | 'provas'>) => {
    const disciplinaComId: DisciplinaParcial = {
      ...novaDisciplina,
      id: Date.now().toString() + Math.random().toString(36),
      atividades: [],
      provas: [],
      modalidade: novaDisciplina.modalidade || 'pontos'
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

  // === FUNÇÕES PARA SISTEMA DE MÉDIAS (PROVAS) ===
  
  const adicionarProva = useCallback((disciplinaId: string, prova: Omit<Prova, 'id'>) => {
    const provaComId: Prova = {
      ...prova,
      id: Date.now().toString() + Math.random().toString(36)
    };
    
    setDisciplinasParciais(prev => 
      prev.map(disciplina => 
        disciplina.id === disciplinaId 
          ? { ...disciplina, provas: [...disciplina.provas, provaComId] }
          : disciplina
      )
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const editarProva = useCallback((disciplinaId: string, provaId: string, dadosAtualizados: Omit<Prova, 'id'>) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => 
        disciplina.id === disciplinaId 
          ? {
              ...disciplina,
              provas: disciplina.provas.map(prova =>
                prova.id === provaId 
                  ? { ...prova, ...dadosAtualizados }
                  : prova
              )
            }
          : disciplina
      )
    );
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const removerProva = useCallback((disciplinaId: string, provaId: string) => {
    setDisciplinasParciais(prev => 
      prev.map(disciplina => 
        disciplina.id === disciplinaId 
          ? {
              ...disciplina,
              provas: disciplina.provas.filter(prova => prova.id !== provaId)
            }
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

  const adicionarPeriodo = useCallback((periodo: Omit<Periodo, 'id' | 'numero'>) => {
    const periodoComId: Periodo = {
      ...periodo,
      id: Date.now().toString() + Math.random().toString(36),
      numero: periodos.length + 1,
      nome: `${periodos.length + 1}º Período`
    };
    setPeriodos(prev => [...prev, periodoComId]);
    updateLastModified();
  }, [setPeriodos, periodos.length, updateLastModified]);

  const removerPeriodo = useCallback((id: string) => {
    setPeriodos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // Reordena os números dos períodos
      return filtered.map((periodo, index) => ({
        ...periodo,
        numero: index + 1,
        nome: `${index + 1}º Período`
      }));
    });
    updateLastModified();
  }, [setPeriodos, updateLastModified]);

  const limparPeriodos = useCallback(() => {
    setPeriodos([]);
    updateLastModified();
  }, [setPeriodos, updateLastModified]);

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
      // Garantir que arrays sempre existam
      const disciplinaSegura = {
        ...disciplina,
        atividades: disciplina.atividades || [],
        provas: disciplina.provas || []
      };
      
      // Calcula nota baseada na modalidade da disciplina
      const notaParcial = calcularNotaFinalDisciplina(disciplinaSegura);
      const pontosConsumidos = disciplinaSegura.modalidade === 'pontos' 
        ? calcularPontosConsumidos(disciplinaSegura.atividades)
        : 0; // No sistema de médias, não há "pontos consumidos"
      
      // Se reprovado por faltas, nota final é 0
      const faltasAtuais = disciplinaSegura.faltas || 0;
      const notaFinal = estaReprovadoPorFaltas(disciplinaSegura.creditos, faltasAtuais) ? 0 : notaParcial;
      
      // Determina status da disciplina e calcula recuperação se necessário
      const status = determinarStatusDisciplina(notaFinal, disciplinaSegura.creditos, faltasAtuais);
      let recuperacao = disciplinaSegura.recuperacao;
      
      // Se a disciplina está completa e ficou de final, calcula a recuperação
      if (status === 'final' && disciplinaEstaCompleta(disciplinaSegura)) {
        const notaMinima = calcularNotaMinimaRecuperacao(notaFinal);
        recuperacao = {
          notaMinima,
          notaRecuperacao: recuperacao?.notaRecuperacao,
          notaFinalComRecuperacao: recuperacao?.notaRecuperacao 
            ? calcularNotaFinalRecuperacao(notaFinal, recuperacao.notaRecuperacao)
            : undefined
        };
      }
      
      return {
        ...disciplinaSegura,
        notaParcial: notaFinal,
        pontosConsumidos,
        recuperacao
      };
    });
  }, [disciplinasParciais]);

  const calcularCRParcial = (disciplinasComNotas: DisciplinaParcial[]) => {
    if (!disciplinasComNotas || disciplinasComNotas.length === 0) return null;

    // Filtra disciplinas que têm avaliações (atividades OU provas) E créditos > 0
    const disciplinasComNota = disciplinasComNotas.filter(d => {
      // Garantir que arrays existam
      const atividades = d.atividades || [];
      const provas = d.provas || [];
      
      const temAvaliacao = d.modalidade === 'pontos' 
        ? atividades.length > 0 
        : provas.length > 0;
      return temAvaliacao && d.creditos > 0;
    });
    
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
  };

  const calcularCRCurso = (periodos: Periodo[]) => {
    if (periodos.length === 0) return null;

    // Coleta todas as disciplinas de todos os períodos, excluindo as com 0 créditos
    const todasDisciplinas = periodos.flatMap(periodo => periodo.disciplinas).filter(d => d.creditos > 0);
    
    if (todasDisciplinas.length === 0) return null;

    const somaNotasCreditos = todasDisciplinas.reduce(
      (acc, disciplina) => acc + (disciplina.nota * disciplina.creditos),
      0
    );
    
    const totalCreditos = todasDisciplinas.reduce(
      (acc, disciplina) => acc + disciplina.creditos,
      0
    );

    const mediaGeral = totalCreditos > 0 ? somaNotasCreditos / totalCreditos : 0;

    return {
      mediaGeral,
      totalCreditos,
      totalDisciplinas: todasDisciplinas.length
    };
  };

  const calcularCR = (disciplinas: Disciplina[]) => {
    if (disciplinas.length === 0) return null;

    // Filtra disciplinas com créditos > 0
    const disciplinasComCreditos = disciplinas.filter(d => d.creditos > 0);
    if (disciplinasComCreditos.length === 0) return null;

    const somaNotasCreditos = disciplinasComCreditos.reduce(
      (acc, disciplina) => acc + (disciplina.nota * disciplina.creditos),
      0
    );
    
    const totalCreditos = disciplinasComCreditos.reduce(
      (acc, disciplina) => acc + disciplina.creditos,
      0
    );

    const mediaGeral = totalCreditos > 0 ? somaNotasCreditos / totalCreditos : 0;

    return {
      mediaGeral,
      totalCreditos,
      totalDisciplinas: disciplinasComCreditos.length
    };
  };

  const resultado = useMemo(() => {
    if (tipoCalculo === 'parcial') {
      return calcularCRParcial(disciplinasParciaisComNotas);
    } else if (tipoCalculo === 'curso') {
      return calcularCRCurso(periodos);
    } else {
      return calcularCR(disciplinas);
    }
  }, [tipoCalculo, disciplinas, disciplinasParciaisComNotas, periodos]);

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

  const editarDisciplinaPeriodo = useCallback((periodoId: string, disciplinaId: string, dadosAtualizados: Omit<Disciplina, 'id'>) => {
    setPeriodos(prev => 
      prev.map(periodo => {
        if (periodo.id === periodoId) {
          const novasDisciplinas = periodo.disciplinas.map(disciplina =>
            disciplina.id === disciplinaId
              ? { ...disciplina, ...dadosAtualizados }
              : disciplina
          );
          return { ...periodo, disciplinas: novasDisciplinas };
        }
        return periodo;
      })
    );
    updateLastModified();
  }, [setPeriodos, updateLastModified]);

  const adicionarDisciplinaPeriodo = useCallback((periodoId: string, novaDisciplina: Omit<Disciplina, 'id'>) => {
    const disciplinaComId: Disciplina = {
      ...novaDisciplina,
      id: Date.now().toString() + Math.random().toString(36)
    };
    
    setPeriodos(prev => 
      prev.map(periodo => {
        if (periodo.id === periodoId) {
          return { ...periodo, disciplinas: [...periodo.disciplinas, disciplinaComId] };
        }
        return periodo;
      })
    );
    updateLastModified();
  }, [setPeriodos, updateLastModified]);

  const removerDisciplinaPeriodo = useCallback((periodoId: string, disciplinaId: string) => {
    setPeriodos(prev => 
      prev.map(periodo => {
        if (periodo.id === periodoId) {
          const novasDisciplinas = periodo.disciplinas.filter(disciplina => 
            disciplina.id !== disciplinaId
          );
          return { ...periodo, disciplinas: novasDisciplinas };
        }
        return periodo;
      })
    );
    updateLastModified();
  }, [setPeriodos, updateLastModified]);

  const adicionarNotaRecuperacao = useCallback((disciplinaId: string, notaRecuperacao: number) => {
    setDisciplinasParciais(prev => prev.map(disciplina => {
      if (disciplina.id === disciplinaId) {
        const notaPeriodo = disciplina.notaParcial || 0;
        const notaFinalComRecuperacao = calcularNotaFinalRecuperacao(notaPeriodo, notaRecuperacao);
        
        return {
          ...disciplina,
          recuperacao: {
            ...disciplina.recuperacao,
            notaRecuperacao,
            notaFinalComRecuperacao
          }
        };
      }
      return disciplina;
    }));
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  const removerNotaRecuperacao = useCallback((disciplinaId: string) => {
    setDisciplinasParciais(prev => prev.map(disciplina => {
      if (disciplina.id === disciplinaId && disciplina.recuperacao) {
        return {
          ...disciplina,
          recuperacao: {
            ...disciplina.recuperacao,
            notaRecuperacao: undefined,
            notaFinalComRecuperacao: undefined
          }
        };
      }
      return disciplina;
    }));
    updateLastModified();
  }, [setDisciplinasParciais, updateLastModified]);

  // Funções de persistência
  const persistence = useCalculadoraPersistence();

  return {
    disciplinas,
    disciplinasParciais: disciplinasParciaisComNotas,
    periodos,
    tipoCalculo,
    resultado,
    adicionarDisciplina,
    adicionarDisciplinaParcial,
    adicionarAtividade,
    editarAtividade,
    removerAtividade,
    // Funções para sistema de médias (provas)
    adicionarProva,
    editarProva,
    removerProva,
    // Funções de faltas
    adicionarFalta,
    adicionarAulaDupla,
    removerFalta,
    definirFaltas,
    // Funções de recuperação
    adicionarNotaRecuperacao,
    removerNotaRecuperacao,
    // Funções gerais
    removerDisciplina,
    removerDisciplinaParcial,
    limparDisciplinas,
    limparDisciplinasParciais,
    adicionarPeriodo,
    removerPeriodo,
    limparPeriodos,
    editarDisciplinaPeriodo,
    adicionarDisciplinaPeriodo,
    removerDisciplinaPeriodo,
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
