
import React from 'react';
import { Disciplina } from '@/types';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DisciplinasListProps {
  disciplinas: Disciplina[];
  onRemoveDisciplina: (id: string) => void;
}

const DisciplinasList = ({ disciplinas, onRemoveDisciplina }: DisciplinasListProps) => {
  if (disciplinas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <p className="text-center text-gray-500 text-sm sm:text-base">
          Nenhuma disciplina adicionada ainda. Comece adicionando uma disciplina acima.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Disciplinas Adicionadas ({disciplinas.length})
      </h2>
      
      <div className="space-y-3">
        {disciplinas.map((disciplina) => (
          <div
            key={disciplina.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-3"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 break-words">{disciplina.nome}</h3>
              <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600 mt-1 gap-1">
                <span>Nota: <strong>{disciplina.nota.toFixed(1)}</strong></span>
                <span>Créditos: <strong>{disciplina.creditos}</strong></span>
              </div>
            </div>
            
            <Button
              onClick={() => onRemoveDisciplina(disciplina.id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-center"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisciplinasList;
