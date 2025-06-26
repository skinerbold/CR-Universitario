import React, { useState, useMemo } from 'react';
import { Disciplina, DisciplinaParcial, Periodo } from '@/types';
import { Target, Calculator, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CRAatualizadoProps {
  disciplinasParciais: DisciplinaParcial[];
  periodos: Periodo[];
}

const CRAatualizado = ({ disciplinasParciais, periodos }: CRAatualizadoProps) => {
  const [craDesejado, setCraDesejado] = useState('');
  const [mostrarSimulacao, setMostrarSimulacao] = useState(false);

  // Calcula o CRA atual considerando períodos já cursados + disciplinas parciais
  const craAtualizado = useMemo(() => {
    // Disciplinas já cursadas (dos períodos completos) - apenas com créditos > 0
    const disciplinasCursadas = periodos.flatMap(periodo => periodo.disciplinas).filter(d => d.creditos > 0);
    
    // Disciplinas parciais com nota atual - apenas com créditos > 0
    const disciplinasParciaisComNota = disciplinasParciais.filter(d => {
      const temAvaliacao = d.modalidade === 'pontos' 
        ? d.atividades.length > 0 
        : d.provas.length > 0;
      return temAvaliacao && d.creditos > 0;
    });
    
    // Combina todas as disciplinas
    const todasDisciplinas = [
      ...disciplinasCursadas,
      ...disciplinasParciaisComNota.map(d => ({
        id: d.id,
        nome: d.nome,
        nota: d.notaParcial || 0,
        creditos: d.creditos
      }))
    ];

    if (todasDisciplinas.length === 0) return null;

    const somaNotasCreditos = todasDisciplinas.reduce(
      (acc, disciplina) => acc + (disciplina.nota * disciplina.creditos),
      0
    );
    
    const totalCreditos = todasDisciplinas.reduce(
      (acc, disciplina) => acc + disciplina.creditos,
      0
    );

    const cra = totalCreditos > 0 ? somaNotasCreditos / totalCreditos : 0;

    return {
      cra,
      totalCreditos,
      totalDisciplinas: todasDisciplinas.length,
      disciplinasCursadas: disciplinasCursadas.length,
      disciplinasParciais: disciplinasParciaisComNota.length
    };
  }, [disciplinasParciais, periodos]);

  // Calcula simulação para CRA desejado
  const simulacaoCRA = useMemo(() => {
    if (!craDesejado || !mostrarSimulacao || !craAtualizado) return null;

    const craDesejadoNum = parseFloat(craDesejado);
    if (craDesejadoNum < 0 || craDesejadoNum > 100) return null;

    // Disciplinas já cursadas (fixas) - apenas com créditos > 0
    const disciplinasCursadas = periodos.flatMap(periodo => periodo.disciplinas).filter(d => d.creditos > 0);
    const pontosJaCursados = disciplinasCursadas.reduce(
      (acc, d) => acc + (d.nota * d.creditos), 0
    );
    const creditosJaCursados = disciplinasCursadas.reduce(
      (acc, d) => acc + d.creditos, 0
    );

    // Disciplinas parciais - apenas com créditos > 0
    const disciplinasParciaisAtivas = disciplinasParciais.filter(d => {
      const temAvaliacao = d.modalidade === 'pontos' 
        ? d.atividades.length > 0 
        : d.provas.length > 0;
      return temAvaliacao && d.creditos > 0;
    });
    const creditosParciais = disciplinasParciaisAtivas.reduce(
      (acc, d) => acc + d.creditos, 0
    );

    const totalCreditos = creditosJaCursados + creditosParciais;
    const pontosTotaisNecessarios = craDesejadoNum * totalCreditos;
    const pontosNecessariosParciais = pontosTotaisNecessarios - pontosJaCursados;

    // Verifica se é possível (máximo 100 pontos por disciplina parcial)
    const pontosMaximosParciais = disciplinasParciaisAtivas.reduce(
      (acc, d) => acc + (100 * d.creditos), 0
    );

    const possivel = pontosNecessariosParciais <= pontosMaximosParciais;
    const mediaNecessariaParciais = creditosParciais > 0 ? pontosNecessariosParciais / creditosParciais : 0;

    // Pontos atuais das disciplinas parciais
    const pontosAtuaisParciais = disciplinasParciaisAtivas.reduce(
      (acc, d) => acc + ((d.notaParcial || 0) * d.creditos), 0
    );

    const craAtual = totalCreditos > 0 ? (pontosJaCursados + pontosAtuaisParciais) / totalCreditos : 0;

    return {
      craDesejado: craDesejadoNum,
      craAtual,
      possivel,
      mediaNecessariaParciais,
      pontosNecessariosParciais,
      pontosMaximosParciais,
      disciplinasParciaisAtivas,
      jaAtingido: craAtual >= craDesejadoNum
    };
  }, [craDesejado, mostrarSimulacao, craAtualizado, disciplinasParciais, periodos]);

  const handleCalcular = () => {
    if (!craDesejado) {
      alert('Por favor, informe o CRA desejado');
      return;
    }

    const craNum = parseFloat(craDesejado);
    if (craNum < 0 || craNum > 100) {
      alert('O CRA desejado deve estar entre 0 e 100');
      return;
    }

    setMostrarSimulacao(true);
  };

  const getMediaColor = (media: number) => {
    if (media >= 80) return 'text-green-600';
    if (media >= 70) return 'text-blue-600';
    if (media >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMediaBgColor = (media: number) => {
    if (media >= 80) return 'bg-green-50 border-green-200';
    if (media >= 70) return 'bg-blue-50 border-blue-200';
    if (media >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (!craAtualizado) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          CRA Atualizado
        </h2>
        <p className="text-center text-gray-500">
          Adicione disciplinas no "Curso Completo" e atividades no "CR Parcial" para calcular o CRA atualizado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        CRA Atualizado
      </h2>

      {/* Resultado CRA Atualizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg border-2 ${getMediaBgColor(craAtualizado.cra)}`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getMediaColor(craAtualizado.cra)} mb-1`}>
              {craAtualizado.cra.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              CRA Atualizado
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {craAtualizado.totalCreditos}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Total de Créditos
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border-2 bg-indigo-50 border-indigo-200 sm:col-span-2 lg:col-span-1">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {craAtualizado.totalDisciplinas}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Total de Disciplinas
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          <strong>Composição:</strong> {craAtualizado.disciplinasCursadas} disciplinas já cursadas + {craAtualizado.disciplinasParciais} disciplinas em andamento
        </p>
      </div>

      {/* Calculadora de CRA Desejado */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Calculadora de CRA Desejado
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="cra-desejado" className="text-sm font-medium text-gray-700">
              CRA Desejado (0-100)
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="cra-desejado"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={craDesejado}
                onChange={(e) => setCraDesejado(e.target.value)}
                placeholder="Ex: 85.0"
                className="flex-1"
              />
              <Button onClick={handleCalcular} className="bg-blue-600 hover:bg-blue-700">
                <Calculator className="w-4 h-4 mr-2" />
                Calcular
              </Button>
            </div>
          </div>

          {mostrarSimulacao && simulacaoCRA && (
            <div className="space-y-4">
              {simulacaoCRA.jaAtingido ? (
                <div className="p-4 bg-green-100 border border-green-300 rounded">
                  <p className="text-green-800 font-medium">
                    ✅ Meta já atingida!
                  </p>
                  <p className="text-green-700">
                    <strong>Parabéns! Você já alcançou o CRA desejado de {simulacaoCRA.craDesejado.toFixed(2)}.</strong>
                    <span> Seu CRA atual é {simulacaoCRA.craAtual.toFixed(2)}.</span>
                  </p>
                </div>
              ) : simulacaoCRA.possivel ? (
                <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-yellow-800 font-medium">
                    🎯 Meta alcançável!
                  </p>
                  <div className="text-yellow-700 text-sm space-y-1">
                    <p><strong>CRA Atual:</strong> {simulacaoCRA.craAtual.toFixed(2)}</p>
                    <p><strong>CRA Desejado:</strong> {simulacaoCRA.craDesejado.toFixed(2)}</p>
                    <p><strong>Média necessária nas disciplinas parciais:</strong> {simulacaoCRA.mediaNecessariaParciais.toFixed(2)} pontos</p>
                    
                    <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="font-medium text-yellow-800 mb-1">📋 Detalhamento por disciplina:</p>
                      {simulacaoCRA.disciplinasParciaisAtivas.map((disciplina) => {
                        const pontosNecessarios = simulacaoCRA.mediaNecessariaParciais;
                        const contribuicao = pontosNecessarios * disciplina.creditos;
                        return (
                          <p key={disciplina.id} className="text-xs text-yellow-700 mb-1">
                            • <strong>{disciplina.nome}</strong> ({disciplina.creditos} créd.): 
                            <span className="ml-1">
                              {pontosNecessarios.toFixed(1)} pontos = {contribuicao.toFixed(1)} pontos-crédito
                            </span>
                          </p>
                        );
                      })}
                    </div>
                    
                    <p className="text-xs mt-2 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>💡 Explicação:</strong> Todas as disciplinas precisam da mesma nota ({simulacaoCRA.mediaNecessariaParciais.toFixed(2)} pontos), 
                      mas cada uma contribui diferente para o CRA devido aos créditos. 
                      Disciplinas com mais créditos têm maior impacto no resultado final.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-800 font-medium">
                    ❌ Meta não alcançável
                  </p>
                  <p className="text-red-700 text-xs">
                    Mesmo obtendo 100 pontos em todas as disciplinas parciais, não será possível atingir o CRA desejado de {simulacaoCRA.craDesejado.toFixed(2)}.
                    A média necessária seria {simulacaoCRA.mediaNecessariaParciais.toFixed(2)} pontos, mas o máximo é 100.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRAatualizado;
