import React, { useState } from 'react';
import { DisciplinaParcial } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DisciplinaParcialFormProps {
  onAddDisciplina: (disciplina: Omit<DisciplinaParcial, 'id' | 'atividades'>) => void;
}

const DisciplinaParcialForm = ({ onAddDisciplina }: DisciplinaParcialFormProps) => {
  const [nome, setNome] = useState('');
  const [creditos, setCreditos] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !creditos) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const creditosNum = parseInt(creditos);

    if (creditosNum <= 0) {
      alert('Os créditos devem ser maior que zero');
      return;
    }

    onAddDisciplina({
      nome: nome.trim(),
      creditos: creditosNum
    });

    // Limpar formulário
    setNome('');
    setCreditos('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Adicionar Disciplina (CR Parcial)
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome-parcial" className="text-sm font-medium text-gray-700">
              Nome da Disciplina
            </Label>
            <Input
              id="nome-parcial"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cálculo I"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="creditos-parcial" className="text-sm font-medium text-gray-700">
              Créditos
            </Label>
            <Input
              id="creditos-parcial"
              type="number"
              min="1"
              value={creditos}
              onChange={(e) => setCreditos(e.target.value)}
              placeholder="4"
              className="mt-1"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Disciplina
        </Button>
      </form>
    </div>
  );
};

export default DisciplinaParcialForm;
