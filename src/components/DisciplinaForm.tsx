
import React, { useState } from 'react';
import { Disciplina } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DisciplinaFormProps {
  onAddDisciplina: (disciplina: Omit<Disciplina, 'id'>) => void;
}

const DisciplinaForm = ({ onAddDisciplina }: DisciplinaFormProps) => {
  const [nome, setNome] = useState('');
  const [nota, setNota] = useState('');
  const [creditos, setCreditos] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !nota || !creditos) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const notaNum = parseFloat(nota);
    const creditosNum = parseInt(creditos);

    if (notaNum < 0 || notaNum > 100) {
      alert('A nota deve estar entre 0 e 100');
      return;
    }

    if (creditosNum <= 0) {
      alert('Os créditos devem ser maior que zero');
      return;
    }

    onAddDisciplina({
      nome: nome.trim(),
      nota: notaNum,
      creditos: creditosNum
    });

    // Limpar formulário
    setNome('');
    setNota('');
    setCreditos('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Adicionar Disciplina
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
              Nome da Disciplina
            </Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cálculo I"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="nota" className="text-sm font-medium text-gray-700">
              Nota (0-100)
            </Label>
            <Input
              id="nota"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="85"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="creditos" className="text-sm font-medium text-gray-700">
              Créditos
            </Label>
            <Input
              id="creditos"
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

export default DisciplinaForm;
