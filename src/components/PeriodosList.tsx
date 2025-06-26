import React, { useState } from 'react';
import { Periodo } from '@/types';
import { Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PeriodosListProps {
  periodos: Periodo[];
  onRemovePeriodo: (id: string) => void;
}

const PeriodosList = ({ periodos, onRemovePeriodo }: PeriodosListProps) => {
  const [minimizedPeriodos, setMinimizedPeriodos] = useState<Set<string>>(new Set());

  const toggleMinimized = (periodoId: string) => {
    setMinimizedPeriodos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(periodoId)) {
        newSet.delete(periodoId);
      } else {
        newSet.add(periodoId);
      }
      return newSet;
    });
  };

  if (periodos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <p className="text-center text-gray-500">
          Nenhum período adicionado ainda. Comece inserindo um período acima.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Períodos do Curso ({periodos.length})
      </h2>
      
      <div className="space-y-4">
        {periodos.map((periodo) => {
          const totalCreditos = periodo.disciplinas.reduce((acc, d) => acc + d.creditos, 0);
          const somaNotasCreditos = periodo.disciplinas.reduce((acc, d) => acc + (d.nota * d.creditos), 0);
          const mediaPeriodo = totalCreditos > 0 ? somaNotasCreditos / totalCreditos : 0;
          
          return (
            <div
              key={periodo.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800">{periodo.nome}</h3>
                      <Button
                        onClick={() => onRemovePeriodo(periodo.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                      <span>Disciplinas: <strong>{periodo.disciplinas.length}</strong></span>
                      <span>Créditos: <strong>{totalCreditos}</strong></span>
                      <span>CR do Período: <strong className={`${
                        mediaPeriodo >= 7 ? 'text-green-600' : 
                        mediaPeriodo >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {mediaPeriodo.toFixed(2)}
                      </strong></span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => toggleMinimized(periodo.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  {minimizedPeriodos.has(periodo.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Conteúdo minimizável */}
              {!minimizedPeriodos.has(periodo.id) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Disciplinas:</h4>
                  <div className="space-y-1">
                    {periodo.disciplinas.map((disciplina) => (
                      <div key={disciplina.id} className="text-sm text-gray-600 bg-white p-3 rounded border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">{disciplina.nome}</span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span>Nota: <strong className={`${
                              disciplina.nota >= 7 ? 'text-green-600' : 
                              disciplina.nota >= 6 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{disciplina.nota.toFixed(1)}</strong></span>
                            <span>Créditos: <strong>{disciplina.creditos}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodosList;
