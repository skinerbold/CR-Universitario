
import React from 'react';
import { CalculoResultado, TipoCalculo, DisciplinaParcial } from '@/types';
import { Award, BookOpen, Hash, Calculator, Star } from 'lucide-react';

interface ResultadoCalculosProps {
  resultado: CalculoResultado | null;
  tipoCalculo: TipoCalculo;
  disciplinasParciais?: DisciplinaParcial[];
}

const ResultadoCalculos = ({ resultado, tipoCalculo, disciplinasParciais = [] }: ResultadoCalculosProps) => {
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

  // Informações sobre as modalidades de avaliação (apenas para tipo parcial)
  const disciplinasPontos = disciplinasParciais.filter(d => d.modalidade === 'pontos');
  const disciplinasMedias = disciplinasParciais.filter(d => d.modalidade === 'medias');
  const temAmbosOsSistemas = tipoCalculo === 'parcial' && disciplinasPontos.length > 0 && disciplinasMedias.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="break-words">
          {tipoCalculo === 'curso' ? 'CRA - Coeficiente de Rendimento Acadêmico' : 
           tipoCalculo === 'periodo' ? 'CR - Coeficiente de Rendimento do Período' : 
           'CR Parcial'}
        </span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${getMediaBgColor(resultado.mediaGeral)}`}>
          <div className="text-center">
            <div className={`text-2xl sm:text-3xl font-bold ${getMediaColor(resultado.mediaGeral)} mb-1`}>
              {resultado.mediaGeral.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              {tipoCalculo === 'curso' ? 'CRA' : 'Média Ponderada'}
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

      {/* Informações sobre modalidades de avaliação - apenas no CR parcial */}
      {tipoCalculo === 'parcial' && disciplinasParciais.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {disciplinasPontos.length > 0 && (
            <div className="p-3 rounded-lg border-2 bg-orange-50 border-orange-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-600 mb-1">
                  <Calculator className="w-4 h-4" />
                  {disciplinasPontos.length}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Sistema de Pontos
                </div>
              </div>
            </div>
          )}
          {disciplinasMedias.length > 0 && (
            <div className="p-3 rounded-lg border-2 bg-purple-50 border-purple-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-purple-600 mb-1">
                  <Star className="w-4 h-4" />
                  {disciplinasMedias.length}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Sistema de Médias
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          <strong>Fórmula {tipoCalculo === 'curso' ? 'CRA' : 'CR'}:</strong> 
          {tipoCalculo === 'curso' ? ' CRA = Σ(Nota × Créditos) ÷ Σ(Créditos)' : ' Média Ponderada = Σ(Nota × Créditos) ÷ Σ(Créditos)'}
          {tipoCalculo === 'parcial' && (
            <>
              <span className="block mt-2 text-xs">
                <strong>Sistema de Pontos:</strong> Nota = Soma dos pontos obtidos nas atividades (máx. 100 pontos por disciplina)
              </span>
              <span className="block mt-1 text-xs">
                <strong>Sistema de Médias:</strong> Nota = Média das provas (ponderada se houver pesos customizados)
              </span>
              {temAmbosOsSistemas && (
                <span className="block mt-2 text-xs text-blue-600 font-medium">
                  ℹ️ Você está usando ambos os sistemas: {disciplinasPontos.length} disciplinas por pontos e {disciplinasMedias.length} por médias
                </span>
              )}
            </>
          )}
          {tipoCalculo === 'curso' && (
            <span className="block mt-1 text-xs text-blue-600">
              * CRA considera todas as disciplinas cursadas em todos os períodos do curso
            </span>
          )}
          <span className="block mt-1 text-xs text-orange-600">
            * Disciplinas com 0 créditos não interferem no cálculo do {tipoCalculo === 'curso' ? 'CRA' : 'CR'}, mas podem ter atividades e controle de presença
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResultadoCalculos;
