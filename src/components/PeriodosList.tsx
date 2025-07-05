import React, { useState } from 'react';
import { Periodo, Disciplina } from '@/types';
import { Trash2, ChevronDown, ChevronUp, BookOpen, Edit, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PeriodosListProps {
  periodos: Periodo[];
  onRemovePeriodo: (id: string) => void;
  onEditarDisciplinaPeriodo: (periodoId: string, disciplinaId: string, dadosAtualizados: Omit<Disciplina, 'id'>) => void;
  onAdicionarDisciplinaPeriodo: (periodoId: string, novaDisciplina: Omit<Disciplina, 'id'>) => void;
  onRemoverDisciplinaPeriodo: (periodoId: string, disciplinaId: string) => void;
}

const PeriodosList = ({ 
  periodos, 
  onRemovePeriodo, 
  onEditarDisciplinaPeriodo, 
  onAdicionarDisciplinaPeriodo, 
  onRemoverDisciplinaPeriodo 
}: PeriodosListProps) => {
  const [minimizedPeriodos, setMinimizedPeriodos] = useState<Set<string>>(
    new Set(periodos.map(p => p.id))
  );
  const [editingDisciplina, setEditingDisciplina] = useState<string | null>(null);
  const [addingToPeriodo, setAddingToPeriodo] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', nota: '', creditos: '' });
  const [newDisciplinaForm, setNewDisciplinaForm] = useState({ nome: '', nota: '', creditos: '' });

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

  const startEditingDisciplina = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina.id);
    setEditForm({
      nome: '',
      nota: '',
      creditos: ''
    });
  };

  const cancelEdit = () => {
    setEditingDisciplina(null);
    setEditForm({ nome: '', nota: '', creditos: '' });
  };

  const saveEdit = (periodoId: string, disciplinaId: string) => {
    const nota = parseFloat(editForm.nota) || 0;
    const creditos = parseInt(editForm.creditos) || 0;
    
    if (editForm.nome.trim() && nota >= 0 && creditos >= 0) {
      onEditarDisciplinaPeriodo(periodoId, disciplinaId, {
        nome: editForm.nome,
        nota,
        creditos
      });
      setEditingDisciplina(null);
      setEditForm({ nome: '', nota: '', creditos: '' });
    }
  };

  const startAddingDisciplina = (periodoId: string) => {
    setAddingToPeriodo(periodoId);
    setNewDisciplinaForm({ nome: '', nota: '', creditos: '' });
  };

  const cancelAddDisciplina = () => {
    setAddingToPeriodo(null);
    setNewDisciplinaForm({ nome: '', nota: '', creditos: '' });
  };

  const saveNewDisciplina = (periodoId: string) => {
    const nota = parseFloat(newDisciplinaForm.nota) || 0;
    const creditos = parseInt(newDisciplinaForm.creditos) || 0;
    
    if (newDisciplinaForm.nome.trim() && nota >= 0 && creditos >= 0) {
      onAdicionarDisciplinaPeriodo(periodoId, {
        nome: newDisciplinaForm.nome,
        nota,
        creditos
      });
      setAddingToPeriodo(null);
      setNewDisciplinaForm({ nome: '', nota: '', creditos: '' });
    }
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
          // Calcula totais considerando apenas disciplinas com créditos > 0
          const disciplinasComCreditos = periodo.disciplinas.filter(d => d.creditos > 0);
          const totalCreditos = disciplinasComCreditos.reduce((acc, d) => acc + d.creditos, 0);
          const somaNotasCreditos = disciplinasComCreditos.reduce((acc, d) => acc + (d.nota * d.creditos), 0);
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
                        {mediaPeriodo.toFixed(1)}
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Disciplinas:</h4>
                    <Button
                      onClick={() => startAddingDisciplina(periodo.id)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      disabled={addingToPeriodo === periodo.id}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {/* Formulário para nova disciplina */}
                    {addingToPeriodo === periodo.id && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                          <Input
                            placeholder="Nome da disciplina"
                            value={newDisciplinaForm.nome}
                            onChange={(e) => setNewDisciplinaForm(prev => ({ ...prev, nome: e.target.value }))}
                            className="sm:col-span-2"
                          />
                          <Input
                            type="number"
                            placeholder="Nota final"
                            min="0"
                            max="100"
                            step="0.1"
                            value={newDisciplinaForm.nota}
                            onChange={(e) => setNewDisciplinaForm(prev => ({ ...prev, nota: e.target.value }))}
                          />
                          <Input
                            type="number"
                            placeholder="Créditos"
                            min="0"
                            value={newDisciplinaForm.creditos}
                            onChange={(e) => setNewDisciplinaForm(prev => ({ ...prev, creditos: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => saveNewDisciplina(periodo.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Salvar
                          </Button>
                          <Button
                            onClick={cancelAddDisciplina}
                            variant="outline"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {periodo.disciplinas.map((disciplina) => (
                      <div key={disciplina.id} className={`text-sm text-gray-600 bg-white p-3 rounded border ${
                        disciplina.creditos === 0 ? 'border-l-4 border-l-orange-400 bg-orange-50' : ''
                      }`}>
                        {editingDisciplina === disciplina.id ? (
                          // Modo de edição
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <Input
                                value={editForm.nome}
                                onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
                                className="sm:col-span-2"
                                placeholder="Nome da disciplina"
                              />
                              <Input
                                type="number"
                                value={editForm.nota}
                                onChange={(e) => setEditForm(prev => ({ ...prev, nota: e.target.value }))}
                                placeholder="Nota final"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              <Input
                                type="number"
                                value={editForm.creditos}
                                onChange={(e) => setEditForm(prev => ({ ...prev, creditos: e.target.value }))}
                                placeholder="Créditos"
                                min="0"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => saveEdit(periodo.id, disciplina.id)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Salvar
                              </Button>
                              <Button
                                onClick={cancelEdit}
                                variant="outline"
                                size="sm"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Modo de visualização
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1">
                              <span className="font-medium text-gray-800">{disciplina.nome}</span>
                              {disciplina.creditos === 0 && (
                                <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                                  Sem crédito
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="flex gap-4 text-xs">
                                <span>Nota: <strong className={`${
                                  disciplina.nota >= 7 ? 'text-green-600' : 
                                  disciplina.nota >= 6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>{disciplina.nota.toFixed(1)}</strong></span>
                                <span>Créditos: <strong>{disciplina.creditos}</strong></span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => startEditingDisciplina(disciplina)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => onRemoverDisciplinaPeriodo(periodo.id, disciplina.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
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
