import React, { useState } from 'react';
import { Disciplina, Periodo } from '@/types';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PeriodoFormProps {
  onAddPeriodo: (periodo: Omit<Periodo, 'id' | 'numero'>) => void;
}

const PeriodoForm = ({ onAddPeriodo }: PeriodoFormProps) => {
  const [disciplinas, setDisciplinas] = useState<Array<{nome: string, nota: string, creditos: string}>>([
    { nome: '', nota: '', creditos: '' }
  ]);

  const adicionarDisciplina = () => {
    setDisciplinas([...disciplinas, { nome: '', nota: '', creditos: '' }]);
  };

  const removerDisciplina = (index: number) => {
    if (disciplinas.length > 1) {
      setDisciplinas(disciplinas.filter((_, i) => i !== index));
    }
  };

  const atualizarDisciplina = (index: number, campo: 'nome' | 'nota' | 'creditos', valor: string) => {
    const novasDisciplinas = [...disciplinas];
    novasDisciplinas[index][campo] = valor;
    setDisciplinas(novasDisciplinas);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const disciplinasValidas = disciplinas.filter(d => 
      d.nome.trim() && d.nota && d.creditos
    );

    if (disciplinasValidas.length === 0) {
      alert('Adicione pelo menos uma disciplina com todos os campos preenchidos');
      return;
    }

    const disciplinasParaSalvar: Omit<Disciplina, 'id'>[] = [];

    for (const disciplina of disciplinasValidas) {
      const notaNum = parseFloat(disciplina.nota);
      const creditosNum = parseInt(disciplina.creditos);

      if (notaNum < 0 || notaNum > 100) {
        alert('As notas devem estar entre 0 e 100');
        return;
      }

      if (creditosNum < 0) {
        alert('Os créditos devem ser maior ou igual a zero');
        return;
      }

      disciplinasParaSalvar.push({
        nome: disciplina.nome.trim(),
        nota: notaNum,
        creditos: creditosNum
      });
    }

    // Cria as disciplinas com IDs
    const disciplinasComId: Disciplina[] = disciplinasParaSalvar.map(disciplina => ({
      ...disciplina,
      id: Date.now().toString() + Math.random().toString(36)
    }));

    // Cria o período com as disciplinas
    const novoPeriodo = {
      nome: '', // Será definido automaticamente no hook
      disciplinas: disciplinasComId
    };

    onAddPeriodo(novoPeriodo);
    
    // Limpar formulário
    setDisciplinas([{ nome: '', nota: '', creditos: '' }]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Inserir Novo Período
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Disciplinas do Período
          </Label>
          
          {disciplinas.map((disciplina, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="sm:col-span-2">
                <Label className="text-xs text-gray-600">Nome da Disciplina</Label>
                <Input
                  type="text"
                  value={disciplina.nome}
                  onChange={(e) => atualizarDisciplina(index, 'nome', e.target.value)}
                  placeholder="Ex: Cálculo I"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Nota (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={disciplina.nota}
                  onChange={(e) => atualizarDisciplina(index, 'nota', e.target.value)}
                  placeholder="85"
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-gray-600">Créditos</Label>
                  <Input
                    type="number"
                    min="0"
                    value={disciplina.creditos}
                    onChange={(e) => atualizarDisciplina(index, 'creditos', e.target.value)}
                    placeholder="4"
                    className="mt-1"
                  />
                </div>
                {disciplinas.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removerDisciplina(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            onClick={adicionarDisciplina}
            variant="outline"
            className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Outra Disciplina
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Período
        </Button>
      </form>
    </div>
  );
};

export default PeriodoForm;
