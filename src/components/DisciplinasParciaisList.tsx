import React, { useState } from 'react';
import { DisciplinaParcial, Atividade } from '@/types';
import { Trash2, Plus, BookOpen, Edit, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ControleFaltas from './ControleFaltas';
import { estaReprovadoPorFaltas } from '@/utils/faltasUtils';

interface DisciplinasParciaisListProps {
  disciplinas: DisciplinaParcial[];
  onRemoveDisciplina: (id: string) => void;
  onAddAtividade: (disciplinaId: string, atividade: Omit<Atividade, 'id'>) => void;
  onEditAtividade: (disciplinaId: string, atividadeId: string, dadosAtualizados: Omit<Atividade, 'id'>) => void;
  onRemoveAtividade: (disciplinaId: string, atividadeId: string) => void;
  onAdicionarFalta: (disciplinaId: string) => void;
  onAdicionarAulaDupla: (disciplinaId: string) => void;
  onRemoverFalta: (disciplinaId: string) => void;
  onDefinirFaltas: (disciplinaId: string, quantidade: number) => void;
}

const DisciplinasParciaisList = ({ 
  disciplinas, 
  onRemoveDisciplina, 
  onAddAtividade,
  onEditAtividade,
  onRemoveAtividade,
  onAdicionarFalta,
  onAdicionarAulaDupla,
  onRemoverFalta,
  onDefinirFaltas
}: DisciplinasParciaisListProps) => {
  const [expandedDisciplina, setExpandedDisciplina] = useState<string | null>(null);
  const [minimizedDisciplinas, setMinimizedDisciplinas] = useState<Set<string>>(new Set());
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [notaObtida, setNotaObtida] = useState('');
  const [notaTotal, setNotaTotal] = useState('');
  const [editandoAtividade, setEditandoAtividade] = useState<{disciplinaId: string, atividadeId: string} | null>(null);
  const [nomeAtividadeEdicao, setNomeAtividadeEdicao] = useState('');
  const [notaObtidaEdicao, setNotaObtidaEdicao] = useState('');
  const [notaTotalEdicao, setNotaTotalEdicao] = useState('');
  const [disciplinaPulsando, setDisciplinaPulsando] = useState<string | null>(null);

  const toggleMinimized = (disciplinaId: string) => {
    setMinimizedDisciplinas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(disciplinaId)) {
        newSet.delete(disciplinaId);
      } else {
        newSet.add(disciplinaId);
      }
      return newSet;
    });
  };
  const handleAddAtividade = (disciplinaId: string) => {
    if (!notaObtida || !notaTotal) {
      alert('Por favor, preencha nota obtida e nota total');
      return;
    }

    const notaObtidaNum = parseFloat(notaObtida);
    const notaTotalNum = parseFloat(notaTotal);

    if (notaObtidaNum < 0 || notaTotalNum <= 0) {
      alert('As notas devem ser válidas (obtida ≥ 0, total > 0)');
      return;
    }

    if (notaObtidaNum > notaTotalNum) {
      alert('A nota obtida não pode ser maior que a nota total da atividade');
      return;
    }    // Verificar se a nota total da atividade não fará ultrapassar 100 pontos consumidos na disciplina
    const disciplina = disciplinas.find(d => d.id === disciplinaId);
    if (disciplina) {
      const pontosJaConsumidos = disciplina.pontosConsumidos || 0;
      const novoTotalConsumido = pontosJaConsumidos + notaTotalNum;
      
      if (novoTotalConsumido > 100) {
        alert(`Esta atividade faria ultrapassar 100 pontos na disciplina. Já foram consumidos ${pontosJaConsumidos.toFixed(1)} pontos e podem ser adicionados no máximo ${(100 - pontosJaConsumidos).toFixed(1)} pontos em atividades.`);
        return;
      }
    }    onAddAtividade(disciplinaId, {
      nome: nomeAtividade.trim() || undefined,
      notaObtida: notaObtidaNum,
      notaTotal: notaTotalNum
    });

    // Ativar animação de pulsação verde
    setDisciplinaPulsando(disciplinaId);
    setTimeout(() => {
      setDisciplinaPulsando(null);
    }, 1500); // Duração da animação

    setNomeAtividade('');
    setNotaObtida('');
    setNotaTotal('');
  };
  const iniciarEdicaoAtividade = (disciplinaId: string, atividadeId: string, atividade: Atividade) => {
    setEditandoAtividade({ disciplinaId, atividadeId });
    setNomeAtividadeEdicao(atividade.nome || '');
    setNotaObtidaEdicao(atividade.notaObtida.toString());
    setNotaTotalEdicao(atividade.notaTotal.toString());
  };

  const cancelarEdicao = () => {
    setEditandoAtividade(null);
    setNomeAtividadeEdicao('');
    setNotaObtidaEdicao('');
    setNotaTotalEdicao('');
  };

  const salvarEdicaoAtividade = () => {
    if (!editandoAtividade || !notaObtidaEdicao || !notaTotalEdicao) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const notaObtidaNum = parseFloat(notaObtidaEdicao);
    const notaTotalNum = parseFloat(notaTotalEdicao);

    if (notaObtidaNum < 0 || notaTotalNum <= 0) {
      alert('As notas devem ser válidas (obtida ≥ 0, total > 0)');
      return;
    }

    if (notaObtidaNum > notaTotalNum) {
      alert('A nota obtida não pode ser maior que a nota total da atividade');
      return;
    }

    // Verificar se a nota total não fará ultrapassar 100 pontos (considerando a atividade atual sendo editada)
    const disciplina = disciplinas.find(d => d.id === editandoAtividade.disciplinaId);
    if (disciplina) {
      const atividadeAtual = disciplina.atividades.find(a => a.id === editandoAtividade.atividadeId);
      const pontosJaConsumidos = disciplina.pontosConsumidos || 0;
      const pontosAtividadeAtual = atividadeAtual?.notaTotal || 0;
      const novoTotalConsumido = pontosJaConsumidos - pontosAtividadeAtual + notaTotalNum;
      
      if (novoTotalConsumido > 100) {
        alert(`Esta alteração faria ultrapassar 100 pontos na disciplina. Total atual: ${pontosJaConsumidos.toFixed(1)} pontos. Máximo permitido para esta atividade: ${(100 - pontosJaConsumidos + pontosAtividadeAtual).toFixed(1)} pontos.`);
        return;
      }
    }    onEditAtividade(editandoAtividade.disciplinaId, editandoAtividade.atividadeId, {
      nome: nomeAtividadeEdicao.trim() || undefined,
      notaObtida: notaObtidaNum,
      notaTotal: notaTotalNum
    });

    cancelarEdicao();
  };

  const removerAtividade = (disciplinaId: string, atividadeId: string) => {
    if (confirm('Tem certeza que deseja remover esta atividade?')) {
      onRemoveAtividade(disciplinaId, atividadeId);
    }
  };

  if (disciplinas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <p className="text-center text-gray-500">
          Nenhuma disciplina adicionada ainda. Comece adicionando uma disciplina acima.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Disciplinas Parciais ({disciplinas.length})
      </h2>
      
      <div className="space-y-4">
        {disciplinas.map((disciplina) => (
          <div
            key={disciplina.id}
            className={`border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-1500 ${
              disciplinaPulsando === disciplina.id 
                ? 'animate-pulse bg-green-100 border-green-300 shadow-lg' 
                : disciplina.creditos === 0 
                ? 'border-l-4 border-l-orange-400 bg-orange-50'
                : ''
            }`}
          >            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800">{disciplina.nome}</h3>
                    {disciplina.creditos === 0 && (
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                        Sem crédito
                      </span>
                    )}
                    <Button
                      onClick={() => onRemoveDisciplina(disciplina.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                    <span>Créditos: <strong>{disciplina.creditos}</strong></span>
                    <span>Atividades: <strong>{disciplina.atividades.length}</strong></span>
                    {disciplina.atividades.length > 0 && (
                      <>
                        {(() => {
                          const faltasAtuais = disciplina.faltas || 0;
                          const reprovadoPorFaltas = estaReprovadoPorFaltas(disciplina.creditos, faltasAtuais);
                          const notaExibida = reprovadoPorFaltas ? 0 : disciplina.notaParcial;
                          
                          return (
                            <span className="break-all">
                              Pontos Obtidos: <strong className={`${
                                reprovadoPorFaltas ? 'text-red-600' :
                                notaExibida >= 70 ? 'text-green-600' : 
                                notaExibida >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {notaExibida.toFixed(1)}
                                {reprovadoPorFaltas && <span className="text-xs ml-1">(Nota zerada por faltas)</span>}
                              </strong>
                            </span>
                          );
                        })()}
                        <span className="text-xs text-gray-500 break-all">
                          (Restam {(100 - (disciplina.pontosConsumidos || 0)).toFixed(1)} pts disponíveis)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => toggleMinimized(disciplina.id)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                {minimizedDisciplinas.has(disciplina.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Conteúdo minimizável */}
            {!minimizedDisciplinas.has(disciplina.id) && (
              <>
                {/* Botão para adicionar atividade */}
                <div className="mb-3">
                  <Button
                    onClick={() => setExpandedDisciplina(
                      expandedDisciplina === disciplina.id ? null : disciplina.id
                    )}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Atividade
                  </Button>
                </div>

            {/* Formulário para adicionar atividade - Aparece logo abaixo do botão */}
            {expandedDisciplina === disciplina.id && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Atividade para {disciplina.nome}
                </h4>                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="nome-atividade" className="text-sm font-medium text-gray-700">
                      Nome da Atividade (opcional)
                    </Label>
                    <Input
                      id="nome-atividade"
                      type="text"
                      value={nomeAtividade}
                      onChange={(e) => setNomeAtividade(e.target.value)}
                      placeholder="Ex: Prova 1, Trabalho..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nota-obtida" className="text-sm font-medium text-gray-700">
                      Pontos Obtidos
                    </Label>
                    <Input
                      id="nota-obtida"
                      type="number"
                      min="0"
                      step="0.1"
                      value={notaObtida}
                      onChange={(e) => setNotaObtida(e.target.value)}
                      placeholder="20"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nota-total" className="text-sm font-medium text-gray-700">
                      Pontos Totais da Atividade
                    </Label>
                    <Input
                      id="nota-total"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={notaTotal}
                      onChange={(e) => setNotaTotal(e.target.value)}
                      placeholder="25"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={() => handleAddAtividade(disciplina.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button
                      onClick={() => setExpandedDisciplina(null)}
                      variant="outline"
                      className="text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de atividades */}
            {disciplina.atividades.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Atividades:</h4>                <div className="space-y-1">
                  {disciplina.atividades.map((atividade, index) => (
                    <div key={atividade.id} className="text-sm text-gray-600 bg-white p-3 rounded border">
                      {editandoAtividade?.disciplinaId === disciplina.id && editandoAtividade?.atividadeId === atividade.id ? (
                        // Modo edição
                        <div className="space-y-3">                          <div className="text-xs text-blue-600 font-medium mb-2">Editando {atividade.nome || `Atividade ${index + 1}`}</div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs text-gray-700">Nome da Atividade</Label>
                              <Input
                                type="text"
                                value={nomeAtividadeEdicao}
                                onChange={(e) => setNomeAtividadeEdicao(e.target.value)}
                                placeholder="Ex: Prova 1, Trabalho..."
                                className="mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-700">Pontos Obtidos</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                value={notaObtidaEdicao}
                                onChange={(e) => setNotaObtidaEdicao(e.target.value)}
                                className="mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-700">Pontos Totais</Label>
                              <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={notaTotalEdicao}
                                onChange={(e) => setNotaTotalEdicao(e.target.value)}
                                className="mt-1 text-sm"
                              />
                            </div>
                            <div className="flex items-end gap-1">
                              <Button
                                onClick={salvarEdicaoAtividade}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Salvar
                              </Button>
                              <Button
                                onClick={cancelarEdicao}
                                variant="outline"
                                size="sm"
                                className="text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (                        // Modo visualização
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div>
                              <span className="font-medium text-gray-800">
                                {atividade.nome || `Atividade ${index + 1}`}
                              </span>
                              <span className="ml-2">
                                <strong>{atividade.notaObtida}</strong> pontos obtidos
                              </span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {atividade.notaTotal} pontos totais - {((atividade.notaObtida / atividade.notaTotal) * 100).toFixed(1)}% de aproveitamento
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <Button
                              onClick={() => iniciarEdicaoAtividade(disciplina.id, atividade.id, atividade)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => removerAtividade(disciplina.id, atividade.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>              </div>            )}

            {/* Controle de Faltas */}
            <ControleFaltas
              disciplina={disciplina}
              onAdicionarFalta={onAdicionarFalta}
              onAdicionarAulaDupla={onAdicionarAulaDupla}
              onRemoverFalta={onRemoverFalta}
              onDefinirFaltas={onDefinirFaltas}
            />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisciplinasParciaisList;
