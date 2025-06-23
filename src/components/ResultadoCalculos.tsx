
import React from 'react';
import { CalculoResultado, TipoCalculo } from '@/types';
import { Award, BookOpen, Hash } from 'lucide-react';

interface ResultadoCalculosProps {
  resultado: CalculoResultado | null;
  tipoCalculo: TipoCalculo;
}

const ResultadoCalculos = ({ resultado, tipoCalculo }: ResultadoCalculosProps) => {
  if (!resultado) {
    return null;
  }

  const getMediaColor = (media: number) => {
    if (media >= 80) return 'text-green-600';
    if (media >= 70) return 'text-blue-600';
    if (media >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMediaBgColor = (media: number) => {
    if (media >= 80) return 'bg-green-50 border-green-200';
    if (media >= 70) return 'bg-blue-50 border-blue-200';
    if (media >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="break-words">Resultado do {
          tipoCalculo === 'periodo' ? 'Período' : 
          tipoCalculo === 'curso' ? 'Curso' : 'CR Parcial'
        }</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${getMediaBgColor(resultado.mediaGeral)}`}>
          <div className="text-center">
            <div className={`text-2xl sm:text-3xl font-bold ${getMediaColor(resultado.mediaGeral)} mb-1`}>
              {resultado.mediaGeral.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Média Ponderada
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold text-blue-600 mb-1">
              <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
              {resultado.totalCreditos}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Total de Créditos
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 rounded-lg border-2 bg-indigo-50 border-indigo-200 sm:col-span-2 lg:col-span-1">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold text-indigo-600 mb-1">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              {resultado.totalDisciplinas}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Disciplinas
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          <strong>Fórmula:</strong> Média Ponderada = Σ(Nota × Créditos) ÷ Σ(Créditos)
          {tipoCalculo === 'parcial' && (
            <span className="block mt-1 text-xs">
              * Nota de cada disciplina = Soma dos pontos obtidos nas atividades (máx. 100 pontos por disciplina)
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ResultadoCalculos;
