import { DisciplinaParcial, Prova, ModalidadeAvaliacao } from '@/types';

/**
 * Arredonda nota seguindo o padrão acadêmico brasileiro:
 * 
 * Exemplos:
 * - 86.5 → 87 (arredonda para cima)
 * - 86.4 → 86 (arredonda para baixo) 
 * - 86.7 → 87 (arredonda para cima)
 * - 86.0 → 86 (mantém inteiro)
 * 
 * Utiliza Math.round() que implementa o arredondamento
 * "half-up" (meio para cima), padrão na maioria das instituições.
 */
export const arredondarNotaAcademica = (nota: number): number => {
  return Math.round(nota);
};

/**
 * Migra uma disciplina parcial existente para o novo formato com modalidade
 * Todas as disciplinas existentes são convertidas para 'pontos'
 */
/**
 * Migração de dados antigos para o novo formato com modalidades
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
 * APLICA ARREDONDAMENTO ACADÊMICO na nota final
 */
export const calcularNotaFinalDisciplina = (disciplina: DisciplinaParcial): number => {
  let notaFinal: number;
  
  if (disciplina.modalidade === 'medias') {
    notaFinal = calcularNotaPorMedias(disciplina);
  } else {
    notaFinal = calcularNotaPorPontos(disciplina);
  }
  
  // Aplica arredondamento acadêmico apenas se a nota for > 0
  return notaFinal > 0 ? arredondarNotaAcademica(notaFinal) : 0;
};

/**
 * Calcula nota no sistema de médias (provas)
 * Considera provas não cadastradas como nota 0 e calcula a média progressivamente
 */
export const calcularNotaPorMedias = (disciplina: DisciplinaParcial): number => {
  const provas = disciplina.provas || [];
  if (provas.length === 0) {
    return 0;
  }

  const totalAvaliacoes = disciplina.totalAvaliacoes || 4; // padrão 4 avaliações
  
  // Calcula a soma das notas das provas já cadastradas
  const somaNotasRealizadas = provas.reduce((sum, prova) => 
    sum + (prova.nota * prova.peso), 0);
  const somaPesosRealizados = provas.reduce((sum, prova) => 
    sum + prova.peso, 0);

  // Para provas não realizadas, considera peso padrão = 1 e nota = 0
  const provasNaoRealizadas = totalAvaliacoes - provas.length;
  const pesoProvasNaoRealizadas = provasNaoRealizadas * 1; // peso padrão = 1
  const notaProvasNaoRealizadas = 0; // nota 0 para provas não realizadas

  // Calcula a média considerando todas as avaliações (realizadas + não realizadas)
  const somaNotasTotal = somaNotasRealizadas + notaProvasNaoRealizadas;
  const somaPesosTotal = somaPesosRealizados + pesoProvasNaoRealizadas;

  return somaPesosTotal > 0 ? somaNotasTotal / somaPesosTotal : 0;
};

/**
 * Calcula nota no sistema de pontos (atividades) - mantém lógica atual
 */
export const calcularNotaPorPontos = (disciplina: DisciplinaParcial): number => {
  const atividades = disciplina.atividades || [];
  if (atividades.length === 0) {
    return 0;
  }

  const totalObtido = atividades.reduce((sum, atividade) => 
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
    const provas = disciplina.provas || [];
    return (provas.length / disciplina.totalAvaliacoes) * 100;
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
    const provas = disciplina.provas || [];
    const restantes = (disciplina.totalAvaliacoes || 0) - provas.length;
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
  const provas = disciplina.provas || [];
  return provas.length < disciplina.totalAvaliacoes;
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
