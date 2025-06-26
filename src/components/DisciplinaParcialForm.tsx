import React, { useState } from 'react';
import { DisciplinaParcial, ModalidadeAvaliacao } from '@/types';
import { Plus, Calculator, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DisciplinaParcialFormProps {
  onAddDisciplina: (disciplina: Omit<DisciplinaParcial, 'id' | 'atividades' | 'provas'>) => void;
}

const DisciplinaParcialForm = ({ onAddDisciplina }: DisciplinaParcialFormProps) => {
  const [nome, setNome] = useState('');
  const [creditos, setCreditos] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeAvaliacao>('pontos');
  const [totalAvaliacoes, setTotalAvaliacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !creditos) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const creditosNum = parseInt(creditos);

    if (creditosNum < 0) {
      alert('Os créditos devem ser maior ou igual a zero');
      return;
    }

    // Validação específica para sistema de médias
    if (modalidade === 'medias') {
      if (!totalAvaliacoes) {
        alert('Para o sistema de médias, é obrigatório informar o total de avaliações');
        return;
      }

      const totalAvaliacoesNum = parseInt(totalAvaliacoes);
      if (totalAvaliacoesNum < 1 || totalAvaliacoesNum > 10) {
        alert('O total de avaliações deve estar entre 1 e 10');
        return;
      }

      onAddDisciplina({
        nome: nome.trim(),
        creditos: creditosNum,
        modalidade,
        totalAvaliacoes: totalAvaliacoesNum
      });
    } else {
      onAddDisciplina({
        nome: nome.trim(),
        creditos: creditosNum,
        modalidade
      });
    }

    // Limpar formulário
    setNome('');
    setCreditos('');
    setTotalAvaliacoes('');
    setModalidade('pontos');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Adicionar Disciplina (CR Parcial)
      </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Modalidade */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Como esta disciplina é avaliada?
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setModalidade('pontos')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                modalidade === 'pontos'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-5 h-5" />
                <span className="font-medium">Sistema de Pontos</span>
              </div>
              <p className="text-sm text-gray-600">
                Atividades diversas que somam até 100 pontos (atual)
              </p>
            </button>

            <button
              type="button"
              onClick={() => setModalidade('medias')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                modalidade === 'medias'
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Sistema de Médias</span>
              </div>
              <p className="text-sm text-gray-600">
                Provas de 100 pontos cada com média simples/ponderada
              </p>
            </button>
          </div>
        </div>

        {/* Campos da disciplina */}
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
              min="0"
              value={creditos}
              onChange={(e) => setCreditos(e.target.value)}
              placeholder="4"
              className="mt-1"
            />
          </div>
        </div>

        {/* Campo específico para sistema de médias */}
        {modalidade === 'medias' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <Label htmlFor="total-avaliacoes" className="text-sm font-medium text-green-800">
              Total de Avaliações (obrigatório)
            </Label>
            <Input
              id="total-avaliacoes"
              type="number"
              min="1"
              max="10"
              value={totalAvaliacoes}
              onChange={(e) => setTotalAvaliacoes(e.target.value)}
              placeholder="Ex: 4 (para 4 provas)"
              className="mt-1 border-green-300 focus:border-green-500"
            />
            <p className="text-xs text-green-600 mt-1">
              Quantas avaliações (provas) esta disciplina terá no total?
            </p>
          </div>
        )}

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
