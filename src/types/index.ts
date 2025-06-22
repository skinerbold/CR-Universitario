
export interface Disciplina {
  id: string;
  nome: string;
  nota: number;
  creditos: number;
}

export interface Atividade {
  id: string;
  notaObtida: number;
  notaTotal: number;
}

export interface DisciplinaParcial {
  id: string;
  nome: string;
  creditos: number;
  atividades: Atividade[];
  notaParcial?: number;
  pontosConsumidos?: number;
  faltas?: number;
}

export interface CalculoResultado {
  mediaGeral: number;
  totalCreditos: number;
  totalDisciplinas: number;
}

export type TipoCalculo = 'periodo' | 'curso' | 'parcial';
