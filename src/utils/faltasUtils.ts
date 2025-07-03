/**
 * Utilitários para sistema de controle de faltas
 */

/**
 * Calcula o máximo de faltas permitidas baseado nos créditos da disciplina
 */
export const calcularMaximoFaltas = (creditos: number): number => {
  const tabelaFaltas: { [key: number]: number } = {
    0: 7,  // Disciplinas sem crédito: mesmo limite de disciplinas de 2 créditos
    2: 7,
    3: 11,
    4: 14,
    5: 18,
    6: 22,
    7: 25,
    8: 28
  };

  return tabelaFaltas[creditos] || 14; // Default: 14 faltas para disciplinas > 8 créditos
};

/**
 * Calcula quantas faltas ainda são permitidas
 */
export const calcularFaltasRestantes = (creditos: number, faltasAtuais: number): number => {
  const maxFaltas = calcularMaximoFaltas(creditos);
  return Math.max(0, maxFaltas - faltasAtuais);
};

/**
 * Verifica se o aluno está em situação de risco por faltas
 */
export const verificarRiscoFaltas = (creditos: number, faltasAtuais: number): {
  status: 'seguro' | 'atencao' | 'critico' | 'reprovado';
  porcentagem: number;
} => {
  const maxFaltas = calcularMaximoFaltas(creditos);
  const porcentagem = (faltasAtuais / maxFaltas) * 100;

  if (faltasAtuais > maxFaltas) {
    return { status: 'reprovado', porcentagem: 100 };
  } else if (porcentagem >= 80) {
    return { status: 'critico', porcentagem };
  } else if (porcentagem >= 60) {
    return { status: 'atencao', porcentagem };
  } else {
    return { status: 'seguro', porcentagem };
  }
};

/**
 * Verifica se o aluno está reprovado por faltas
 */
export const estaReprovadoPorFaltas = (creditos: number, faltasAtuais: number): boolean => {
  const maxFaltas = calcularMaximoFaltas(creditos);
  return faltasAtuais > maxFaltas;
};

/**
 * Verifica se o aluno está reprovado por faltas considerando se a disciplina está completa
 * Só determina reprovação se a disciplina estiver finalizada (todas as avaliações aplicadas)
 */
export const estaReprovadoPorFaltasCompleta = (disciplina: any): boolean => {
  if (!disciplina) return false;
  
  const maxFaltas = calcularMaximoFaltas(disciplina.creditos);
  const faltasAtuais = disciplina.faltas || 0;
  
  // Se não excedeu o limite, não está reprovado
  if (faltasAtuais <= maxFaltas) {
    return false;
  }
  
  // Se excedeu o limite, verifica se a disciplina está completa
  if (disciplina.modalidade === 'medias') {
    const provas = disciplina.provas || [];
    const totalAvaliacoes = disciplina.totalAvaliacoes || 4;
    // Só considera reprovado se todas as avaliações foram aplicadas
    return provas.length >= totalAvaliacoes;
  } else {
    // Sistema de pontos: só considera reprovado se todos os pontos foram distribuídos
    const atividades = disciplina.atividades || [];
    if (atividades.length === 0) return false;
    
    const pontosDistribuidos = atividades.reduce((total: number, atividade: any) => total + atividade.notaTotal, 0);
    return pontosDistribuidos >= 100;
  }
};

/**
 * Retorna configurações visuais baseadas no status de faltas
 */
export const getStatusFaltasConfig = (status: 'seguro' | 'atencao' | 'critico' | 'reprovado') => {
  const configs = {
    seguro: {
      cor: 'text-green-600',
      fundo: 'bg-green-50 border-green-200',
      icone: '✅',
      titulo: 'Situação Normal'
    },
    atencao: {
      cor: 'text-yellow-600',
      fundo: 'bg-yellow-50 border-yellow-200',
      icone: '⚠️',
      titulo: 'Atenção'
    },
    critico: {
      cor: 'text-orange-600',
      fundo: 'bg-orange-50 border-orange-200',
      icone: '🚨',
      titulo: 'Situação Crítica'
    },
    reprovado: {
      cor: 'text-red-600',
      fundo: 'bg-red-50 border-red-200',
      icone: '❌',
      titulo: 'Reprovado por Faltas'
    }
  };

  return configs[status];
};
