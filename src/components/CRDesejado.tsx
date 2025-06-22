import React, { useState, useMemo } from 'react';
import { Disciplina, DisciplinaParcial, TipoCalculo } from '@/types';
import { Target, Calculator, AlertCircle, TestTube, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CRDesejadoProps {
  disciplinas: Disciplina[];
  disciplinasParciais: DisciplinaParcial[];
  tipoCalculo: TipoCalculo;
  crAtual?: number;
}

const CRDesejado = ({ disciplinas, disciplinasParciais, tipoCalculo, crAtual }: CRDesejadoProps) => {
  const [crDesejado, setCrDesejado] = useState('');
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [simulacaoAtiva, setSimulacaoAtiva] = useState(false);
  const [pontosSimulados, setPontosSimulados] = useState<{[key: string]: string}>({});

  const calculos = useMemo(() => {
    if (!crDesejado || !mostrarResultado) return null;

    const crDesejadoNum = parseFloat(crDesejado);
    if (crDesejadoNum < 0 || crDesejadoNum > 100) return null;

    let disciplinasParaCalcular: Array<{nome: string, creditos: number, notaAtual?: number, pontosDisponiveis?: number}> = [];
    
    if (tipoCalculo === 'parcial') {
      disciplinasParaCalcular = disciplinasParciais.map(d => ({
        nome: d.nome,
        creditos: d.creditos,
        notaAtual: d.notaParcial,
        pontosDisponiveis: 100 - (d.pontosConsumidos || 0)
      }));
    } else {
      disciplinasParaCalcular = disciplinas.map(d => ({
        nome: d.nome,
        creditos: d.creditos,
        notaAtual: d.nota,
        pontosDisponiveis: undefined
      }));
    }

    if (disciplinasParaCalcular.length === 0) return null;

    const totalCreditos = disciplinasParaCalcular.reduce((acc, d) => acc + d.creditos, 0);
    const pontosTotaisNecessarios = crDesejadoNum * totalCreditos;

    // Separar disciplinas completas e incompletas
    const disciplinasCompletas = disciplinasParaCalcular.filter(d => {
      if (tipoCalculo === 'parcial') {
        return d.pontosDisponiveis === 0;
      } else {
        return d.notaAtual !== undefined && d.notaAtual !== null;
      }
    });
    
    const disciplinasIncompletas = disciplinasParaCalcular.filter(d => {
      if (tipoCalculo === 'parcial') {
        return d.pontosDisponiveis === undefined || d.pontosDisponiveis > 0;
      } else {
        return d.notaAtual === undefined || d.notaAtual === null;
      }
    });

    // Calcular pontos já garantidos
    const pontosCompletas = disciplinasCompletas.reduce((acc, d) => acc + (d.notaAtual! * d.creditos), 0);
    const pontosParciaisIncompletas = disciplinasIncompletas.reduce((acc, d) => {
      if (tipoCalculo === 'parcial' && d.notaAtual !== undefined) {
        return acc + (d.notaAtual * d.creditos);
      }
      return acc;
    }, 0);
    
    const pontosJaObtidosTotal = pontosCompletas + pontosParciaisIncompletas;
    const pontosNecessarios = pontosTotaisNecessarios - pontosJaObtidosTotal;
      // Calcular pontos máximos ainda possíveis
    let pontosMaximosPossiveis = 0;
    if (tipoCalculo === 'parcial') {
      pontosMaximosPossiveis = disciplinasIncompletas.reduce((acc, d) => {
        const pontosDisponiveis = d.pontosDisponiveis || 0;
        return acc + (pontosDisponiveis / 100) * d.creditos * 100; // pontos disponíveis já em escala 0-100
      }, 0);
    } else {
      const creditosSemNota = disciplinasIncompletas.reduce((acc, d) => acc + d.creditos, 0);
      pontosMaximosPossiveis = creditosSemNota * 100;
    }

    if (disciplinasIncompletas.length === 0) {
      const crAtualCalculado = pontosJaObtidosTotal / totalCreditos;
      return {
        tipo: 'completo' as const,
        crAtualCalculado,
        crDesejado: crDesejadoNum,
        possivel: crAtualCalculado >= crDesejadoNum,
        diferenca: crDesejadoNum - crAtualCalculado
      };
    }    const creditosTotaisIncompletos = disciplinasIncompletas.reduce((acc, d) => acc + d.creditos, 0);
    const possivel = pontosNecessarios <= pontosMaximosPossiveis;
    const metaJaAtingida = pontosNecessarios <= 0;

    let mediaMinimaNecessaria = 0;
    
    if (tipoCalculo === 'parcial') {
      // Para CR parcial, calcular baseado nos pontos disponíveis de cada disciplina
      const pontosDisponiveisTotais = disciplinasIncompletas.reduce((acc, d) => {
        return acc + (d.pontosDisponiveis || 0);
      }, 0);
      
      if (pontosDisponiveisTotais > 0 && !metaJaAtingida) {
        mediaMinimaNecessaria = (pontosNecessarios / creditosTotaisIncompletos);
      }
    } else {
      if (creditosTotaisIncompletos > 0 && !metaJaAtingida) {
        mediaMinimaNecessaria = pontosNecessarios / creditosTotaisIncompletos;
      }
    }

    return {
      tipo: 'incompleto' as const,
      disciplinasCompletas,
      disciplinasIncompletas,
      pontosJaObtidos: pontosJaObtidosTotal,
      pontosNecessarios,
      mediaMinimaNecessaria,
      totalCreditos,
      creditosSemNota: creditosTotaisIncompletos,
      possivel,
      crDesejado: crDesejadoNum,
      pontosMaximosPossiveis,
      tipoCalculo,
      metaJaAtingida
    };
  }, [disciplinas, disciplinasParciais, tipoCalculo, crDesejado, mostrarResultado]);

  const handleCalcular = () => {
    if (!crDesejado) {
      alert('Por favor, informe o CR desejado');
      return;
    }

    const crDesejadoNum = parseFloat(crDesejado);
    if (crDesejadoNum < 0 || crDesejadoNum > 100) {
      alert('O CR desejado deve estar entre 0 e 100');
      return;
    }

    setMostrarResultado(true);
  };
  const limparResultado = () => {
    setMostrarResultado(false);
    setCrDesejado('');
    setSimulacaoAtiva(false);
    setPontosSimulados({});
  };

  const iniciarSimulacao = () => {
    if (!calculos || calculos.tipo === 'completo') return;
    
    // Inicializar com valores sugeridos
    const pontosIniciais: {[key: string]: string} = {};
    calculos.disciplinasIncompletas.forEach((disciplina, index) => {
      if (tipoCalculo === 'parcial') {
        // Para CR parcial, sugerir uma porcentagem dos pontos disponíveis
        const sugestao = Math.min(calculos.mediaMinimaNecessaria, disciplina.pontosDisponiveis || 0);
        pontosIniciais[index.toString()] = sugestao.toFixed(1);
      } else {
        // Para outros tipos, sugerir a média necessária
        pontosIniciais[index.toString()] = calculos.mediaMinimaNecessaria.toFixed(1);
      }
    });
    setPontosSimulados(pontosIniciais);
    setSimulacaoAtiva(true);
  };

  const limparSimulacao = () => {
    setPontosSimulados({});
    setSimulacaoAtiva(false);
  };

  const atualizarPontoSimulado = (index: string, valor: string) => {
    setPontosSimulados(prev => ({
      ...prev,
      [index]: valor
    }));
  };
  const calcularSimulacao = useMemo(() => {
    if (!simulacaoAtiva || !calculos || calculos.tipo === 'completo') return null;

    let pontosAdicionais = 0;
    let pontosMaximosAdicionais = 0;
    let temErro = false;
    const erros: string[] = [];

    calculos.disciplinasIncompletas.forEach((disciplina, index) => {
      const pontoStr = pontosSimulados[index.toString()] || '0';
      const pontos = parseFloat(pontoStr) || 0;

      if (tipoCalculo === 'parcial') {
        const pontosDisponiveis = disciplina.pontosDisponiveis || 0;
        if (pontos > pontosDisponiveis) {
          temErro = true;
          erros.push(`${disciplina.nome}: máximo ${pontosDisponiveis.toFixed(1)} pontos disponíveis`);
        }
        pontosAdicionais += (pontos / 100) * disciplina.creditos * 100;
        pontosMaximosAdicionais += (pontosDisponiveis / 100) * disciplina.creditos * 100;
      } else {
        if (pontos > 100) {
          temErro = true;
          erros.push(`${disciplina.nome}: máximo 100 pontos`);
        }
        pontosAdicionais += pontos * disciplina.creditos;
        pontosMaximosAdicionais += 100 * disciplina.creditos;
      }
    });

    const novospontosTotal = calculos.pontosJaObtidos + pontosAdicionais;
    const crSimulado = novospontosTotal / calculos.totalCreditos;
    const atingiuMeta = crSimulado >= calculos.crDesejado;
    const diferenciaPontosBruta = calculos.pontosNecessarios - pontosAdicionais;

    // Calcular diferença em formato amigável (igual à análise principal)
    let diferencaFormatada = '';
    let diferencaPorCredito = 0;
    let diferencaPorDisciplina = 0;

    if (diferenciaPontosBruta > 0) { // Ainda falta pontos
      if (tipoCalculo === 'parcial') {
        diferencaPorCredito = diferenciaPontosBruta / calculos.creditosSemNota;
        diferencaFormatada = `${diferencaPorCredito.toFixed(1)} pontos por crédito restante`;
      } else {
        diferencaPorDisciplina = diferenciaPontosBruta / calculos.disciplinasIncompletas.length;
        diferencaFormatada = `${diferencaPorDisciplina.toFixed(1)} pontos por disciplina`;
      }
    }

    return {
      crSimulado,
      atingiuMeta,
      pontosAdicionais,
      pontosNecessarios: calculos.pontosNecessarios,
      diferenca: diferenciaPontosBruta,
      diferencaFormatada,
      diferencaPorCredito,
      diferencaPorDisciplina,
      temErro,
      erros
    };
  }, [simulacaoAtiva, pontosSimulados, calculos, tipoCalculo]);

  const temDisciplinas = tipoCalculo === 'parcial' 
    ? disciplinasParciais.length > 0 
    : disciplinas.length > 0;

  if (!temDisciplinas) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Calculadora de CR Desejado
      </h2>

      <div className="space-y-4">
        {crAtual !== undefined && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>CR Atual:</strong> {crAtual.toFixed(2)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cr-desejado" className="text-sm font-medium text-gray-700">
              CR Desejado (0-100)
            </Label>
            <Input
              id="cr-desejado"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={crDesejado}
              onChange={(e) => setCrDesejado(e.target.value)}
              placeholder="75.0"
              className="mt-1"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <Button
              onClick={handleCalcular}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular
            </Button>
            {mostrarResultado && (
              <Button
                onClick={limparResultado}
                variant="outline"
                className="text-gray-600"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {mostrarResultado && calculos && (
          <div className="mt-6 p-4 border-2 border-green-200 bg-green-50 rounded-lg">
            {calculos.tipo === 'completo' ? (
              <div>
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Resultado - Todas as disciplinas já têm nota
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>CR Atual:</strong> {calculos.crAtualCalculado.toFixed(2)}</p>
                  <p><strong>CR Desejado:</strong> {calculos.crDesejado.toFixed(2)}</p>
                  {calculos.possivel ? (
                    <p className="text-green-700 font-medium">
                      ✅ Parabéns! Você já atingiu o CR desejado!
                    </p>
                  ) : (
                    <p className="text-red-700 font-medium">
                      ❌ Infelizmente, com as notas atuais não é possível atingir o CR desejado.
                      Faltam {Math.abs(calculos.diferenca).toFixed(2)} pontos.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Análise para atingir CR {calculos.crDesejado.toFixed(2)}
                </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Pontos já obtidos:</strong> {calculos.pontosJaObtidos.toFixed(2)}</p>
                    {calculos.tipoCalculo === 'parcial' ? (
                      <>
                        <p><strong>Média necessária nas atividades restantes:</strong> {calculos.mediaMinimaNecessaria.toFixed(2)} pontos por crédito</p>
                        <p className="text-xs text-gray-600">
                          Para cada crédito de disciplina incompleta, você precisa obter {calculos.mediaMinimaNecessaria.toFixed(2)} pontos nas próximas atividades
                        </p>
                      </>
                    ) : (
                      <>
                        <p><strong>Nota necessária por disciplina restante:</strong> {calculos.mediaMinimaNecessaria.toFixed(2)} pontos</p>
                        <p className="text-xs text-gray-600">
                          Cada uma das {calculos.creditosSemNota / calculos.disciplinasIncompletas.length > 0 ? calculos.disciplinasIncompletas.length : 1} disciplinas restantes precisa de pelo menos {calculos.mediaMinimaNecessaria.toFixed(2)} pontos
                        </p>
                      </>
                    )}
                  </div>
                    <div className="space-y-2 text-sm">
                    {calculos.metaJaAtingida ? (
                      <div className="p-3 bg-blue-100 border border-blue-300 rounded">
                        <p className="text-blue-800 font-medium">
                          🎯 Meta já atingida!
                        </p>
                        <p className="text-blue-700">
                          <strong>Parabéns! Você já alcançou o CR desejado de {calculos.crDesejado.toFixed(2)}.</strong>
                          {calculos.tipoCalculo === 'parcial' && (
                            <span> Você pode relaxar nas próximas atividades.</span>
                          )}
                        </p>
                      </div>
                    ) : calculos.possivel ? (
                      <div className="p-3 bg-green-100 border border-green-300 rounded">
                        <p className="text-green-800 font-medium">
                          ✅ Meta alcançável!
                        </p>                        {calculos.tipoCalculo === 'parcial' ? (
                          <p className="text-green-700">
                            <strong>Você precisa de {calculos.mediaMinimaNecessaria.toFixed(1)} pontos por crédito restante</strong>
                            <br/>
                            <span className="text-xs">
                              {calculos.creditosSemNota} créditos × {calculos.mediaMinimaNecessaria.toFixed(1)} = {calculos.pontosNecessarios.toFixed(1)} pontos totais necessários
                            </span>
                          </p>
                        ) : (
                          <p className="text-green-700">
                            <strong>Nota mínima necessária por disciplina restante:</strong><br/>
                            <span className="text-lg font-bold">{calculos.mediaMinimaNecessaria.toFixed(2)} pontos</span>
                            <br/>
                            <span className="text-xs">
                              {calculos.disciplinasIncompletas.length} disciplinas × {calculos.mediaMinimaNecessaria.toFixed(2)} pontos
                            </span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-red-100 border border-red-300 rounded">
                        <p className="text-red-800 font-medium">
                          ❌ Meta não alcançável
                        </p>
                        {calculos.tipoCalculo === 'parcial' ? (
                          <p className="text-red-700 text-xs">
                            Mesmo obtendo 100% dos pontos ainda disponíveis, não será possível atingir o CR desejado.
                          </p>
                        ) : (
                          <p className="text-red-700 text-xs">
                            Seria necessário obter {calculos.mediaMinimaNecessaria.toFixed(2)} pontos por disciplina, 
                            mas o máximo possível é 100.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>                {calculos.disciplinasIncompletas.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Disciplinas {calculos.tipoCalculo === 'parcial' ? 'incompletas' : 'que precisam de nota'} ({calculos.disciplinasIncompletas.length}):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {calculos.disciplinasIncompletas.map((disciplina, index) => (
                        <div key={index} className="text-sm bg-white p-2 rounded border">
                          <span className="font-medium">{disciplina.nome}</span>
                          <span className="text-gray-600 ml-2">({disciplina.creditos} créditos)</span>
                          {calculos.tipoCalculo === 'parcial' && disciplina.pontosDisponiveis !== undefined && (
                            <div className="text-blue-600 text-xs mt-1">
                              {disciplina.pontosDisponiveis.toFixed(1)} pontos ainda disponíveis
                              {disciplina.notaAtual !== undefined && (
                                <span className="text-gray-500"> | Já obtidos: {disciplina.notaAtual.toFixed(1)}</span>
                              )}
                            </div>
                          )}
                          {calculos.possivel && calculos.tipoCalculo !== 'parcial' && (
                            <div className="text-green-600 text-xs mt-1">
                              Nota necessária: {calculos.mediaMinimaNecessaria.toFixed(2)} pts
                            </div>
                          )}
                        </div>                      ))}
                    </div>
                  </div>
                )}

                {/* Caixa de Simulação */}
                {calculos.disciplinasIncompletas.length > 0 && !calculos.metaJaAtingida && (
                  <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-purple-800 flex items-center gap-2">
                        <TestTube className="w-4 h-4" />
                        Simulador de Pontuação
                      </h4>
                      {!simulacaoAtiva ? (
                        <Button
                          onClick={iniciarSimulacao}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <TestTube className="w-3 h-3 mr-1" />
                          Simular
                        </Button>
                      ) : (
                        <Button
                          onClick={limparSimulacao}
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-300"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Limpar
                        </Button>
                      )}
                    </div>

                    {!simulacaoAtiva ? (
                      <p className="text-sm text-purple-700">
                        💡 Use o simulador para testar diferentes cenários de pontuação e ver se consegue atingir seu CR desejado!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-purple-700 mb-3">
                          Informe quantos pontos você acha que consegue obter em cada disciplina:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {calculos.disciplinasIncompletas.map((disciplina, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <Label className="text-xs font-medium text-gray-700">
                                {disciplina.nome} ({disciplina.creditos} créditos)
                              </Label>
                              {tipoCalculo === 'parcial' && (
                                <div className="text-xs text-gray-500 mb-1">
                                  Máximo: {disciplina.pontosDisponiveis?.toFixed(1)} pontos disponíveis
                                </div>
                              )}
                              <Input
                                type="number"
                                min="0"
                                max={tipoCalculo === 'parcial' ? disciplina.pontosDisponiveis : 100}
                                step="0.1"
                                value={pontosSimulados[index.toString()] || ''}
                                onChange={(e) => atualizarPontoSimulado(index.toString(), e.target.value)}
                                placeholder={tipoCalculo === 'parcial' ? 
                                  `0 - ${disciplina.pontosDisponiveis?.toFixed(1)}` : 
                                  "0 - 100"
                                }
                                className="mt-1 text-sm"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Resultado da Simulação */}
                        {calcularSimulacao && (
                          <div className="mt-4 p-3 rounded border bg-white">
                            <h5 className="font-medium text-gray-800 mb-2">Resultado da Simulação:</h5>
                            
                            {calcularSimulacao.temErro ? (
                              <div className="p-2 bg-red-100 border border-red-300 rounded text-sm">
                                <p className="text-red-800 font-medium">⚠️ Erros encontrados:</p>
                                <ul className="text-red-700 mt-1 ml-4">
                                  {calcularSimulacao.erros.map((erro, i) => (
                                    <li key={i} className="list-disc">{erro}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (                              <div className={`p-3 rounded border ${
                                calcularSimulacao.atingiuMeta 
                                  ? 'bg-green-100 border-green-300' 
                                  : 'bg-orange-100 border-orange-300'
                              }`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p><strong>CR Simulado:</strong> {calcularSimulacao.crSimulado.toFixed(2)}</p>
                                    <p><strong>CR Desejado:</strong> {calculos.crDesejado.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    {calcularSimulacao.diferenca > 0 ? (
                                      <>
                                        <p><strong>Ainda precisa de:</strong> {calcularSimulacao.diferencaFormatada}</p>
                                        <p className="text-xs text-gray-600">
                                          Total: {calcularSimulacao.diferenca.toFixed(1)} pontos
                                        </p>
                                      </>
                                    ) : (
                                      <p><strong>Excesso:</strong> {Math.abs(calcularSimulacao.diferenca).toFixed(1)} pontos acima da meta</p>
                                    )}
                                    <p className={`font-medium mt-1 ${
                                      calcularSimulacao.atingiuMeta ? 'text-green-700' : 'text-orange-700'
                                    }`}>
                                      {calcularSimulacao.atingiuMeta 
                                        ? '🎯 Meta atingida!' 
                                        : calcularSimulacao.diferenca > 0 
                                          ? `📈 Precisa melhorar mais`
                                          : '🎉 Ultrapassou a meta!'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CRDesejado;
