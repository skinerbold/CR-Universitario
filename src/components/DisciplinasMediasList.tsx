import React, { useState } from 'react';
import { DisciplinaParcial, Prova } from '@/types';
import { Trash2, Plus, TrendingUp, Edit, X, Check, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ControleFaltas from './ControleFaltas';
import { estaReprovadoPorFaltas } from '@/utils/faltasUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { calcularNotaPorMedias, calcularProgressoDisciplina, podeAdicionarProva } from '@/utils/avaliacaoUtils';

interface DisciplinasMediasListProps {
  disciplinas: DisciplinaParcial[];
  onRemoveDisciplina: (id: string) => void;
  onAddProva: (disciplinaId: string, prova: Omit<Prova, 'id'>) => void;
  onEditProva: (disciplinaId: string, provaId: string, dadosAtualizados: Omit<Prova, 'id'>) => void;
  onRemoveProva: (disciplinaId: string, provaId: string) => void;
  onAdicionarFalta: (disciplinaId: string) => void;
  onAdicionarAulaDupla: (disciplinaId: string) => void;
  onRemoverFalta: (disciplinaId: string) => void;
  onDefinirFaltas: (disciplinaId: string, quantidade: number) => void;
}

const DisciplinasMediasList = ({ 
  disciplinas, 
  onRemoveDisciplina, 
  onAddProva,
  onEditProva,
  onRemoveProva,
  onAdicionarFalta,
  onAdicionarAulaDupla,
  onRemoverFalta,
  onDefinirFaltas
}: DisciplinasMediasListProps) => {
  const [expandedDisciplina, setExpandedDisciplina] = useState<string | null>(null);
  const [minimizedDisciplinas, setMinimizedDisciplinas] = useState<Set<string>>(new Set());
  const [nomeProva, setNomeProva] = useState('');
  const [notaProva, setNotaProva] = useState('');
  const [pesoProva, setPesoProva] = useState('1');
  const [editandoProva, setEditandoProva] = useState<{disciplinaId: string, provaId: string} | null>(null);
  const [nomeProvaEdicao, setNomeProvaEdicao] = useState('');
  const [notaProvaEdicao, setNotaProvaEdicao] = useState('');
  const [pesoProvaEdicao, setPesoProvaEdicao] = useState('');
  const [boxPulsando, setBoxPulsando] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Filtrar apenas disciplinas com modalidade 'medias'
  const disciplinasMedias = disciplinas.filter(d => d.modalidade === 'medias');

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

  const handleAddProva = (disciplinaId: string) => {
    if (!nomeProva.trim() || !notaProva || !pesoProva) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const notaProvaNum = parseFloat(notaProva);
    const pesoProvaNum = parseFloat(pesoProva);

    if (notaProvaNum < 0 || notaProvaNum > 100) {
      alert('A nota deve estar entre 0 e 100');
      return;
    }

    if (pesoProvaNum <= 0) {
      alert('O peso deve ser maior que 0');
      return;
    }

    // Verificar se ainda pode adicionar provas
    const disciplina = disciplinasMedias.find(d => d.id === disciplinaId);
    if (disciplina && !podeAdicionarProva(disciplina)) {
      alert(`Esta disciplina já atingiu o limite de ${disciplina.totalAvaliacoes} avaliações`);
      return;
    }

    onAddProva(disciplinaId, {
      nome: nomeProva.trim(),
      nota: notaProvaNum,
      peso: pesoProvaNum
    });

    // Ativar animação de pulsação verde no box de cadastro
    setBoxPulsando(disciplinaId);
    
    // Estratégia específica para PWA mobile para garantir que a animação seja visível
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isMobile && isPWA) {
      const forceAnimation = () => {
        const element = document.querySelector(`[data-disciplina-id="${disciplinaId}"]`) as HTMLElement;
        if (element) {
          element.style.animation = 'none';
          element.offsetHeight;
          element.style.animation = 'green-pulse 1.5s ease-in-out';
        }
      };
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(forceAnimation);
        });
      });
      
      setTimeout(() => {
        setBoxPulsando(null);
      }, 1600);
    } else if (isMobile) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              setBoxPulsando(null);
            }, 1500);
          });
        });
      });
    } else {
      requestAnimationFrame(() => {
        setTimeout(() => {
          setBoxPulsando(null);
        }, 1500);
      });
    }

    setNomeProva('');
    setNotaProva('');
    setPesoProva('1');
  };

  const iniciarEdicaoProva = (disciplinaId: string, provaId: string, prova: Prova) => {
    setEditandoProva({ disciplinaId, provaId });
    setNomeProvaEdicao(prova.nome);
    setNotaProvaEdicao(prova.nota.toString());
    setPesoProvaEdicao(prova.peso.toString());
  };

  const cancelarEdicao = () => {
    setEditandoProva(null);
    setNomeProvaEdicao('');
    setNotaProvaEdicao('');
    setPesoProvaEdicao('');
  };

  const salvarEdicaoProva = () => {
    if (!editandoProva || !nomeProvaEdicao.trim() || !notaProvaEdicao || !pesoProvaEdicao) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const notaProvaNum = parseFloat(notaProvaEdicao);
    const pesoProvaNum = parseFloat(pesoProvaEdicao);

    if (notaProvaNum < 0 || notaProvaNum > 100) {
      alert('A nota deve estar entre 0 e 100');
      return;
    }

    if (pesoProvaNum <= 0) {
      alert('O peso deve ser maior que 0');
      return;
    }

    onEditProva(editandoProva.disciplinaId, editandoProva.provaId, {
      nome: nomeProvaEdicao.trim(),
      nota: notaProvaNum,
      peso: pesoProvaNum
    });

    cancelarEdicao();
  };

  const removerProva = (disciplinaId: string, provaId: string) => {
    if (confirm('Tem certeza que deseja remover esta prova?')) {
      onRemoveProva(disciplinaId, provaId);
    }
  };

  if (disciplinasMedias.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            Nenhuma disciplina no Sistema de Médias ainda.
          </p>
          <p className="text-sm text-gray-400">
            Adicione uma disciplina com modalidade "Sistema de Médias" acima.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        Disciplinas - Sistema de Médias ({disciplinasMedias.length})
      </h2>
      
      <div className="space-y-4">
        {disciplinasMedias.map((disciplina) => {
          const notaAtual = calcularNotaPorMedias(disciplina);
          const progresso = calcularProgressoDisciplina(disciplina);
          const podeAdicionar = podeAdicionarProva(disciplina);
          
          return (
            <div
              key={disciplina.id}
              className={`border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-300 ${
                disciplina.creditos === 0 
                  ? 'border-l-4 border-l-orange-400 bg-orange-50'
                  : 'border-l-4 border-l-green-400 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800">{disciplina.nome}</h3>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        Sistema de Médias
                      </span>
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
                      <span>Provas: <strong>{(disciplina.provas || []).length}/{disciplina.totalAvaliacoes}</strong></span>
                      <span>Progresso: <strong>{progresso.toFixed(0)}%</strong></span>
                      {(disciplina.provas || []).length > 0 && (
                        <>
                          {(() => {
                            const faltasAtuais = disciplina.faltas || 0;
                            const reprovadoPorFaltas = estaReprovadoPorFaltas(disciplina.creditos, faltasAtuais);
                            const notaExibida = reprovadoPorFaltas ? 0 : notaAtual;
                            
                            return (
                              <span className="break-all">
                                Média Atual: <strong className={`${
                                  reprovadoPorFaltas ? 'text-red-600' :
                                  notaExibida >= 70 ? 'text-green-600' : 
                                  notaExibida >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {notaExibida.toFixed(1)}
                                  {reprovadoPorFaltas && <span className="text-xs ml-1">(Zerada por faltas)</span>}
                                </strong>
                              </span>
                            );
                          })()}
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
                  {/* Botão para adicionar prova */}
                  {podeAdicionar && (
                    <div className="mb-3">
                      <Button
                        onClick={() => setExpandedDisciplina(
                          expandedDisciplina === disciplina.id ? null : disciplina.id
                        )}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Prova
                      </Button>
                    </div>
                  )}

                  {!podeAdicionar && (disciplina.provas || []).length < (disciplina.totalAvaliacoes || 0) && (
                    <div className="mb-3 text-sm text-gray-500">
                      ⚠️ Limite de {disciplina.totalAvaliacoes} avaliações atingido
                    </div>
                  )}

                  {/* Formulário para adicionar prova */}
                  {expandedDisciplina === disciplina.id && podeAdicionar && (
                    <div 
                      data-disciplina-id={disciplina.id}
                      className={`bg-green-50 p-4 rounded-lg border-2 border-green-200 mb-4 transition-all duration-300 ${
                        boxPulsando === disciplina.id 
                          ? 'green-pulse-animation' 
                          : ''
                      }`}
                      style={{
                        ...(boxPulsando === disciplina.id ? {
                          animationName: 'green-pulse',
                          animationDuration: '1.5s',
                          animationTimingFunction: 'ease-in-out',
                          animationFillMode: 'both',
                          willChange: 'transform, background-color, border-color, box-shadow',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden'
                        } : {})
                      }}
                    >
                      <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nova Prova para {disciplina.nome}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="nome-prova" className="text-sm font-medium text-gray-700">
                            Nome da Prova{isMobile ? ' (opcional)' : ''}
                          </Label>
                          <Input
                            id="nome-prova"
                            type="text"
                            value={nomeProva}
                            onChange={(e) => setNomeProva(e.target.value)}
                            placeholder="Ex: 1ª Prova, Prova Final..."
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="nota-prova" className="text-sm font-medium text-gray-700">
                            Nota Obtida (0-100)
                          </Label>
                          <Input
                            id="nota-prova"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={notaProva}
                            onChange={(e) => setNotaProva(e.target.value)}
                            placeholder="85.5"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="peso-prova" className="text-sm font-medium text-gray-700">
                            Peso da Prova
                          </Label>
                          <Input
                            id="peso-prova"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={pesoProva}
                            onChange={(e) => setPesoProva(e.target.value)}
                            placeholder="1"
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex items-end gap-2">
                          <Button
                            onClick={() => handleAddProva(disciplina.id)}
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

                  {/* Lista de provas */}
                  {(disciplina.provas || []).length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Provas Realizadas:</h4>
                      <div className="space-y-1">
                        {(disciplina.provas || []).map((prova, index) => (
                          <div key={prova.id} className="text-sm text-gray-600 bg-white p-3 rounded border">
                            {editandoProva?.disciplinaId === disciplina.id && editandoProva?.provaId === prova.id ? (
                              // Modo edição
                              <div className="space-y-3">
                                <div className="text-xs text-green-600 font-medium mb-2">Editando {prova.nome}</div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                  <div>
                                    <Label className="text-xs text-gray-700">Nome da Prova</Label>
                                    <Input
                                      type="text"
                                      value={nomeProvaEdicao}
                                      onChange={(e) => setNomeProvaEdicao(e.target.value)}
                                      placeholder="Ex: 1ª Prova..."
                                      className="mt-1 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-700">Nota (0-100)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      value={notaProvaEdicao}
                                      onChange={(e) => setNotaProvaEdicao(e.target.value)}
                                      className="mt-1 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-700">Peso</Label>
                                    <Input
                                      type="number"
                                      min="0.1"
                                      step="0.1"
                                      value={pesoProvaEdicao}
                                      onChange={(e) => setPesoProvaEdicao(e.target.value)}
                                      className="mt-1 text-sm"
                                    />
                                  </div>
                                  <div className="flex items-end gap-1">
                                    <Button
                                      onClick={salvarEdicaoProva}
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
                            ) : (
                              // Modo visualização
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div>
                                    <span className="font-medium text-gray-800">
                                      {prova.nome}
                                    </span>
                                    <span className="ml-2">
                                      <strong>{prova.nota}</strong> pontos
                                    </span>
                                    {prova.peso !== 1 && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        (peso {prova.peso})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-gray-500 text-xs mt-1">
                                    Prova {index + 1} de {disciplina.totalAvaliacoes} - {prova.nota}% de aproveitamento
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-3">
                                  <Button
                                    onClick={() => iniciarEdicaoProva(disciplina.id, prova.id, prova)}
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={() => removerProva(disciplina.id, prova.id)}
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
                      </div>
                    </div>
                  )}

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
          );
        })}
      </div>
    </div>
  );
};

export default DisciplinasMediasList;
