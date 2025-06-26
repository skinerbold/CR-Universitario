import { DisciplinaParcial, Prova, ModalidadeAvaliacao } from '@/types';

/**
 * Migra uma disciplina parcial existente para o novo formato com modalidade
 * Todas as disciplinas existentes são convertidas para 'pontos'
 */
export const migrarDisciplinaParaNovoFormato = (disciplina: any): DisciplinaParcial => {
  return {
    ...disciplina,
    modalidade: 'pontos' as ModalidadeAvaliacao,
    provas: [],
    totalAvaliacoes: undefined
  };
};

/**
 * Calcula a nota final de uma disciplina baseada na sua modalidade
 */
export const calcularNotaFinalDisciplina = (disciplina: DisciplinaParcial): number => {
  if (disciplina.modalidade === 'medias') {
    return calcularNotaPorMedias(disciplina);
  } else {
    return calcularNotaPorPontos(disciplina);
  }
};

/**
 * Calcula nota no sistema de médias (provas)
 */
export const calcularNotaPorMedias = (disciplina: DisciplinaParcial): number => {
  if (!disciplina.provas || disciplina.provas.length === 0) {
    return 0;
  }

  const somaNotas = disciplina.provas.reduce((sum, prova) => 
    sum + (prova.nota * prova.peso), 0);
  const somaPesos = disciplina.provas.reduce((sum, prova) => 
    sum + prova.peso, 0);

  return somaPesos > 0 ? somaNotas / somaPesos : 0;
};

/**
 * Calcula nota no sistema de pontos (atividades) - mantém lógica atual
 */
export const calcularNotaPorPontos = (disciplina: DisciplinaParcial): number => {
  if (!disciplina.atividades || disciplina.atividades.length === 0) {
    return 0;
  }

  const totalObtido = disciplina.atividades.reduce((sum, atividade) => 
    sum + atividade.notaObtida, 0);
  
  return totalObtido;
};

/**
 * Calcula o progresso da disciplina (quantos % da nota final já foram avaliados)
 */
export const calcularProgressoDisciplina = (disciplina: DisciplinaParcial): number => {
  if (disciplina.modalidade === 'medias') {
    if (!disciplina.totalAvaliacoes || disciplina.totalAvaliacoes === 0) {
      return 0;
    }
    return (disciplina.provas.length / disciplina.totalAvaliacoes) * 100;
  } else {
    const pontosConsumidos = disciplina.pontosConsumidos || 0;
    return pontosConsumidos;
  }
};

/**
 * Calcula quantos pontos/avaliações ainda restam
 */
export const calcularRestanteDisciplina = (disciplina: DisciplinaParcial): string => {
  if (disciplina.modalidade === 'medias') {
    const restantes = (disciplina.totalAvaliacoes || 0) - disciplina.provas.length;
    return restantes > 0 ? `${restantes} avaliação(ões) restante(s)` : 'Todas as avaliações realizadas';
  } else {
    const pontosRestantes = 100 - (disciplina.pontosConsumidos || 0);
    return `${pontosRestantes.toFixed(1)} pts disponíveis`;
  }
};

/**
 * Valida se uma nova prova pode ser adicionada
 */
export const podeAdicionarProva = (disciplina: DisciplinaParcial): boolean => {
  if (disciplina.modalidade !== 'medias') return false;
  if (!disciplina.totalAvaliacoes) return false;
  return disciplina.provas.length < disciplina.totalAvaliacoes;
};

/**
 * Cria uma nova prova com valores padrão
 */
export const criarNovaProva = (nome: string, nota: number, peso: number = 1): Omit<Prova, 'id'> => {
  return {
    nome: nome.trim() || `Prova ${Date.now()}`,
    nota: Math.max(0, Math.min(100, nota)),
    peso: Math.max(0.1, peso)
  };
};

/**
 * Valida os dados de uma prova
 */
export const validarProva = (nome: string, nota: number, peso: number): string | null => {
  if (!nome.trim()) {
    return 'Nome da prova é obrigatório';
  }
  if (nota < 0 || nota > 100) {
    return 'Nota deve estar entre 0 e 100';
  }
  if (peso <= 0) {
    return 'Peso deve ser maior que 0';
  }
  return null;
};

/**
 * Verifica se todas as disciplinas no localStorage precisam de migração
 */
export const verificarNecessidadeMigracao = (disciplinas: any[]): boolean => {
  return disciplinas.some(disciplina => 
    !disciplina.modalidade || 
    disciplina.modalidade === undefined
  );
};

/**
 * Executa a migração em lote de todas as disciplinas
 */
export const executarMigracaoCompleta = (disciplinas: any[]): DisciplinaParcial[] => {
  return disciplinas.map(migrarDisciplinaParaNovoFormato);
};
