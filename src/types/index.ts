
export interface Disciplina {
  id: string;
  nome: string;
  nota: number;
  creditos: number;
}

export interface Periodo {
  id: string;
  numero: number;
  nome: string; // "1º Período", "2º Período", etc.
  disciplinas: Disciplina[];
}

export interface Atividade {
  id: string;
  nome?: string;
  notaObtida: number;
  notaTotal: number;
}

export interface Prova {
  id: string;
  nome: string; // Nome livre: "1ª Prova", "Prova Final", etc.
  nota: number; // 0-100
  peso: number; // padrão = 1
}

export type ModalidadeAvaliacao = 'pontos' | 'medias';

export interface DisciplinaParcial {
  id: string;
  nome: string;
  creditos: number;
  // Sistema de pontos (existente/padrão)
  atividades: Atividade[];
  notaParcial?: number;
  pontosConsumidos?: number;
  // Sistema de médias (novo)
  modalidade: ModalidadeAvaliacao;
  provas: Prova[];
  totalAvaliacoes?: number; // Quantidade total de avaliações planejadas
  // Campos comuns
  faltas?: number;
}

export interface CalculoResultado {
  mediaGeral: number;
  totalCreditos: number;
  totalDisciplinas: number;
}

export type TipoCalculo = 'periodo' | 'curso' | 'parcial';
