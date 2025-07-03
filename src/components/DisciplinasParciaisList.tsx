import React, { useState } from 'react';
import { DisciplinaParcial, Atividade, Prova } from '@/types';
import { Trash2, Plus, BookOpen, Edit, X, Check, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ControleFaltas from './ControleFaltas';
import { estaReprovadoPorFaltas, estaReprovadoPorFaltasCompleta } from '@/utils/faltasUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { calcularNotaFinalDisciplina, calcularProgressoDisciplina, podeAdicionarProva, determinarStatusDisciplina, disciplinaEstaCompleta } from '@/utils/avaliacaoUtils';

interface DisciplinasParciaisListProps {
  disciplinas: DisciplinaParcial[];
  onRemoveDisciplina: (id: string) => void;
  onAddAtividade: (disciplinaId: string, atividade: Omit<Atividade, 'id'>) => void;
  onEditAtividade: (disciplinaId: string, atividadeId: string, dadosAtualizados: Omit<Atividade, 'id'>) => void;
  onRemoveAtividade: (disciplinaId: string, atividadeId: string) => void;
  onAddProva: (disciplinaId: string, prova: Omit<Prova, 'id'>) => void;
  onEditProva: (disciplinaId: string, provaId: string, dadosAtualizados: Omit<Prova, 'id'>) => void;
  onRemoveProva: (disciplinaId: string, provaId: string) => void;
  onAdicionarFalta: (disciplinaId: string) => void;
  onAdicionarAulaDupla: (disciplinaId: string) => void;
  onRemoverFalta: (disciplinaId: string) => void;
  onDefinirFaltas: (disciplinaId: string, quantidade: number) => void;
  onAdicionarNotaRecuperacao: (disciplinaId: string, notaRecuperacao: number) => void;
  onRemoverNotaRecuperacao: (disciplinaId: string) => void;
}

const DisciplinasParciaisList = ({ 
  disciplinas, 
  onRemoveDisciplina, 
  onAddAtividade,
  onEditAtividade,
  onRemoveAtividade,
  onAddProva,
  onEditProva,
  onRemoveProva,
  onAdicionarFalta,
  onAdicionarAulaDupla,
  onRemoverFalta,
  onDefinirFaltas,
  onAdicionarNotaRecuperacao,
  onRemoverNotaRecuperacao
}: DisciplinasParciaisListProps) => {
  const [expandedDisciplina, setExpandedDisciplina] = useState<string | null>(null);
  const [minimizedDisciplinas, setMinimizedDisciplinas] = useState<Set<string>>(
    new Set(disciplinas.map(d => d.id))
  );
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [notaObtida, setNotaObtida] = useState('');
  const [notaTotal, setNotaTotal] = useState('');
  const [editandoAtividade, setEditandoAtividade] = useState<{disciplinaId: string, atividadeId: string} | null>(null);
  const [nomeAtividadeEdicao, setNomeAtividadeEdicao] = useState('');
  const [notaObtidaEdicao, setNotaObtidaEdicao] = useState('');
  const [notaTotalEdicao, setNotaTotalEdicao] = useState('');
  // Estados para provas (sistema de médias)
  const [nomeProva, setNomeProva] = useState('');
  const [notaProva, setNotaProva] = useState('');
  const [pesoProva, setPesoProva] = useState('1');
  const [editandoProva, setEditandoProva] = useState<{disciplinaId: string, provaId: string} | null>(null);
  const [nomeProvaEdicao, setNomeProvaEdicao] = useState('');
  const [notaProvaEdicao, setNotaProvaEdicao] = useState('');
  const [pesoProvaEdicao, setPesoProvaEdicao] = useState('');
  const [boxPulsando, setBoxPulsando] = useState<string | null>(null);
  // Estados para recuperação
  const [notaRecuperacao, setNotaRecuperacao] = useState('');
  const [editandoRecuperacao, setEditandoRecuperacao] = useState<string | null>(null);
  const isMobile = useIsMobile();

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

    // Ativar animação de pulsação verde no box de cadastro
    setBoxPulsando(disciplinaId);
    
    // Força o reflow para garantir que a animação funcione em mobile
    requestAnimationFrame(() => {
      setTimeout(() => {
        setBoxPulsando(null);
      }, 1500); // Duração da animação
    });

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

  // Funções para provas (sistema de médias)
  const handleAddProva = (disciplinaId: string) => {
    if (!nomeProva.trim() || !notaProva) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const notaNum = parseFloat(notaProva);
    const pesoNum = parseFloat(pesoProva);

    if (notaNum < 0 || notaNum > 100) {
      alert('A nota deve estar entre 0 e 100');
      return;
    }

    if (pesoNum <= 0) {
      alert('O peso deve ser maior que 0');
      return;
    }

    const disciplina = disciplinas.find(d => d.id === disciplinaId);
    if (disciplina && !podeAdicionarProva(disciplina)) {
      alert(`Não é possível adicionar mais provas. Limite: ${disciplina.totalAvaliacoes || 4} provas.`);
      return;
    }

    onAddProva!(disciplinaId, {
      nome: nomeProva.trim(),
      nota: notaNum,
      peso: pesoNum
    });

    setBoxPulsando(disciplinaId);
    setTimeout(() => {
      setBoxPulsando(null);
    }, 1500);

    setNomeProva('');
    setNotaProva('');
    setPesoProva('1');
  };

  const iniciarEdicaoProva = (disciplinaId: string, provaId: string, prova: any) => {
    setEditandoProva({ disciplinaId, provaId });
    setNomeProvaEdicao(prova.nome);
    setNotaProvaEdicao(prova.nota.toString());
    setPesoProvaEdicao(prova.peso.toString());
  };

  const cancelarEdicaoProva = () => {
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

    const notaNum = parseFloat(notaProvaEdicao);
    const pesoNum = parseFloat(pesoProvaEdicao);

    if (notaNum < 0 || notaNum > 100) {
      alert('A nota deve estar entre 0 e 100');
      return;
    }

    if (pesoNum <= 0) {
      alert('O peso deve ser maior que 0');
      return;
    }

    onEditProva!(editandoProva.disciplinaId, editandoProva.provaId, {
      nome: nomeProvaEdicao.trim(),
      nota: notaNum,
      peso: pesoNum
    });

    cancelarEdicaoProva();
  };

  const removerProva = (disciplinaId: string, provaId: string) => {
    if (confirm('Tem certeza que deseja remover esta prova?')) {
      onRemoveProva!(disciplinaId, provaId);
    }
  };

  // Funções para recuperação
  const handleAddNotaRecuperacao = (disciplinaId: string) => {
    const nota = parseFloat(notaRecuperacao);
    
    if (isNaN(nota) || nota < 0 || nota > 100) {
      alert('Por favor, insira uma nota válida entre 0 e 100');
      return;
    }

    onAdicionarNotaRecuperacao(disciplinaId, nota);
    setNotaRecuperacao('');
    setEditandoRecuperacao(null);
  };

  const handleRemoveNotaRecuperacao = (disciplinaId: string) => {
    if (confirm('Tem certeza que deseja remover a nota de recuperação?')) {
      onRemoverNotaRecuperacao(disciplinaId);
    }
  };

  const iniciarEdicaoRecuperacao = (disciplinaId: string, notaAtual?: number) => {
    setEditandoRecuperacao(disciplinaId);
    setNotaRecuperacao(notaAtual?.toString() || '');
  };

  const cancelarEdicaoRecuperacao = () => {
    setEditandoRecuperacao(null);
    setNotaRecuperacao('');
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
            className={`border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-300 ${
              disciplina.creditos === 0 
                ? 'border-l-4 border-l-orange-400 bg-orange-50'
                : ''
            }`}
          >            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-800">{disciplina.nome}</h3>
                    
                    {/* Status compacto da disciplina */}
                    {(() => {
                      const faltasAtuais = disciplina.faltas || 0;
                      const notaPeriodo = disciplina.notaParcial || 0;
                      const status = determinarStatusDisciplina(notaPeriodo, disciplina.creditos, faltasAtuais);
                      const estaCompleta = disciplinaEstaCompleta(disciplina);
                      
                      if (notaPeriodo === 0 || !estaCompleta) return null;
                      
                      if (estaReprovadoPorFaltasCompleta(disciplina)) {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            ❌ Rep. Faltas
                          </span>
                        );
                      }
                      
                      if (status === 'aprovado') {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            ✅ Aprovado
                          </span>
                        );
                      }
                      
                      if (status === 'reprovado_nota') {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            ❌ Rep. Nota
                          </span>
                        );
                      }
                      
                      if (status === 'final') {
                        return (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠️ Final
                            </span>
                            {disciplina.recuperacao?.notaRecuperacao && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                (disciplina.recuperacao.notaFinalComRecuperacao || 0) >= 60 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {(disciplina.recuperacao.notaFinalComRecuperacao || 0) >= 60 ? '✅' : '❌'}
                              </span>
                            )}
                          </div>
                        );
                      }
                      
                      return null;
                    })()}
                    
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
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {disciplina.modalidade === 'medias' ? 'Sistema de Médias' : 'Sistema de Pontos'}
                    </span>
                    
                    {disciplina.modalidade === 'pontos' ? (
                      <>
                        <span>Atividades: <strong>{(disciplina.atividades || []).length}</strong></span>
                        {(disciplina.atividades || []).length > 0 && (
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
                      </>
                    ) : (
                      <>
                        <span>Provas: <strong>{(disciplina.provas || []).length}</strong></span>
                        {(disciplina.provas || []).length > 0 && (
                          <>
                            {(() => {
                              const faltasAtuais = disciplina.faltas || 0;
                              const reprovadoPorFaltas = estaReprovadoPorFaltas(disciplina.creditos, faltasAtuais);
                              const notaExibida = reprovadoPorFaltas ? 0 : disciplina.notaParcial;
                              const progresso = calcularProgressoDisciplina(disciplina);
                              
                              return (
                                <span className="break-all">
                                  Média Atual: <strong className={`${
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
                            <span className="text-xs text-gray-500">
                              ({(disciplina.provas || []).length}/{disciplina.totalAvaliacoes || 4} avaliações)
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Status da Disciplina e Sistema de Recuperação */}
                {(() => {
                  const faltasAtuais = disciplina.faltas || 0;
                  const notaPeriodo = disciplina.notaParcial || 0;
                  const status = determinarStatusDisciplina(notaPeriodo, disciplina.creditos, faltasAtuais);
                  const estaCompleta = disciplinaEstaCompleta(disciplina);
                  
                  // Calcular pontos restantes para sistema de pontos
                  const pontosDistribuidos = disciplina.modalidade === 'pontos' 
                    ? (disciplina.atividades || []).reduce((total, atividade) => total + atividade.notaTotal, 0)
                    : 0;
                  const pontosRestantes = disciplina.modalidade === 'pontos' ? 100 - pontosDistribuidos : 0;
                  
                  // Debug logs (pode ser removido em produção)
                  console.log(`� ${disciplina.nome}:`, {
                    nota: notaPeriodo,
                    status,
                    recuperacao: disciplina.recuperacao
                  });
                  
                  // Mostrar status apenas se há alguma nota e disciplina está completa
                  if (notaPeriodo === 0 || !estaCompleta) return null;
                  
                  return (
                    <div className="mt-2">
                      {status === 'final' && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">Recuperação necessária</span>
                            <span>
                              Min: <strong>{disciplina.recuperacao?.notaMinima?.toFixed(1) || '--'}</strong>
                            </span>
                          </div>
                          
                          {disciplina.recuperacao?.notaRecuperacao ? (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span>Nota: <strong>{disciplina.recuperacao.notaRecuperacao.toFixed(1)}</strong></span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => iniciarEdicaoRecuperacao(disciplina.id, disciplina.recuperacao?.notaRecuperacao)}
                                    className="p-1 text-gray-500 hover:text-gray-700"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveNotaRecuperacao(disciplina.id)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="font-medium">
                                Resultado: <span className={`${
                                  (disciplina.recuperacao.notaFinalComRecuperacao || 0) >= 60 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {disciplina.recuperacao.notaFinalComRecuperacao?.toFixed(1)}
                                  {(disciplina.recuperacao.notaFinalComRecuperacao || 0) >= 60 ? ' ✅' : ' ❌'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {editandoRecuperacao === disciplina.id ? (
                                <div className="space-y-1">
                                  <Input
                                    type="number"
                                    placeholder="0-100"
                                    value={notaRecuperacao}
                                    onChange={(e) => setNotaRecuperacao(e.target.value)}
                                    className="h-6 text-xs"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleAddNotaRecuperacao(disciplina.id)}
                                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={cancelarEdicaoRecuperacao}
                                      className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => iniciarEdicaoRecuperacao(disciplina.id)}
                                  className="w-full px-2 py-1 text-xs bg-yellow-100 border border-yellow-300 rounded hover:bg-yellow-200 text-yellow-700"
                                >
                                  + Nota da Recuperação
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
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

            {/* Formulário para adicionar atividade/prova - Aparece logo abaixo do botão */}
            {expandedDisciplina === disciplina.id && (
              <div className={`bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-4 transition-all duration-300 ${
                boxPulsando === disciplina.id 
                  ? 'green-pulse-animation !important' 
                  : ''
              }`}
              style={boxPulsando === disciplina.id ? {
                animationName: 'green-pulse',
                animationDuration: '1.5s',
                animationTimingFunction: 'ease-in-out',
                animationFillMode: 'both'
              } : {}}>
                
                {disciplina.modalidade === 'pontos' ? (
                  <>
                    <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nova Atividade para {disciplina.nome}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="nome-atividade" className="text-sm font-medium text-gray-700">
                          Nome da Atividade{isMobile ? ' (opcional)' : ''}
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
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Nova Prova para {disciplina.nome}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="nome-prova" className="text-sm font-medium text-gray-700">
                          Nome da Prova
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
                  </>
                )}
              </div>
            )}

            {/* Lista de atividades (sistema de pontos) */}
            {disciplina.modalidade === 'pontos' && (disciplina.atividades || []).length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Atividades:</h4>                <div className="space-y-1">
                  {(disciplina.atividades || []).map((atividade, index) => (
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

            {/* Lista de provas (sistema de médias) */}
            {disciplina.modalidade === 'medias' && (disciplina.provas || []).length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Provas:</h4>
                <div className="space-y-1">
                  {(disciplina.provas || []).map((prova, index) => (
                    <div key={prova.id} className="text-sm text-gray-600 bg-white p-3 rounded border">
                      {editandoProva?.disciplinaId === disciplina.id && editandoProva?.provaId === prova.id ? (
                        // Modo edição
                        <div className="space-y-3">
                          <div className="text-xs text-blue-600 font-medium mb-2">Editando {prova.nome}</div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs text-gray-700">Nome da Prova</Label>
                              <Input
                                type="text"
                                value={nomeProvaEdicao}
                                onChange={(e) => setNomeProvaEdicao(e.target.value)}
                                placeholder="Ex: 1ª Prova, Prova Final..."
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
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white p-1 h-auto"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={cancelarEdicaoProva}
                                variant="outline"
                                size="sm"
                                className="text-gray-600 hover:text-gray-700 p-1 h-auto"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Modo visualização
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {prova.nome}: {prova.nota.toFixed(1)} pts
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              Peso: {prova.peso} - Contribuição para média: {(prova.nota * prova.peso).toFixed(1)}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <Button
                              onClick={() => iniciarEdicaoProva(disciplina.id, prova.id, prova)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
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
        ))}
      </div>
    </div>
  );
};

export default DisciplinasParciaisList;