import React, { useState } from 'react';
import { DisciplinaParcial } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calendar, 
  Plus, 
  Minus, 
  Edit3, 
  Check, 
  X,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  calcularMaximoFaltas, 
  calcularFaltasRestantes, 
  verificarRiscoFaltas, 
  getStatusFaltasConfig 
} from '@/utils/faltasUtils';

interface ControleFaltasProps {
  disciplina: DisciplinaParcial;
  onAdicionarFalta: (disciplinaId: string) => void;
  onAdicionarAulaDupla: (disciplinaId: string) => void;
  onRemoverFalta: (disciplinaId: string) => void;
  onDefinirFaltas: (disciplinaId: string, quantidade: number) => void;
}

const ControleFaltas = ({ 
  disciplina, 
  onAdicionarFalta, 
  onAdicionarAulaDupla,
  onRemoverFalta, 
  onDefinirFaltas 
}: ControleFaltasProps) => {
  const [editandoFaltas, setEditandoFaltas] = useState(false);
  const [faltasTemp, setFaltasTemp] = useState('');
  const isMobile = useIsMobile();

  const faltasAtuais = disciplina.faltas || 0;
  const maxFaltas = calcularMaximoFaltas(disciplina.creditos);
  const faltasRestantes = calcularFaltasRestantes(disciplina.creditos, faltasAtuais);
  const risco = verificarRiscoFaltas(disciplina.creditos, faltasAtuais);
  const config = getStatusFaltasConfig(risco.status);

  const iniciarEdicao = () => {
    setFaltasTemp(faltasAtuais.toString());
    setEditandoFaltas(true);
  };

  const cancelarEdicao = () => {
    setEditandoFaltas(false);
    setFaltasTemp('');
  };

  const salvarEdicao = () => {
    const novaQuantidade = parseInt(faltasTemp) || 0;
    if (novaQuantidade < 0) {
      alert('O número de faltas não pode ser negativo');
      return;
    }
    onDefinirFaltas(disciplina.id, novaQuantidade);
    setEditandoFaltas(false);
    setFaltasTemp('');
  };

  const handleFalteiHoje = () => {
    if (faltasAtuais >= maxFaltas) {
      const confirmar = confirm(
        `⚠️ ATENÇÃO!\n\nVocê já atingiu o limite máximo de faltas (${maxFaltas}).\n` +
        `Adicionar mais uma falta resultará em REPROVAÇÃO por faltas.\n\n` +
        `Tem certeza que deseja continuar?`
      );
      if (!confirmar) return;
    }
    onAdicionarFalta(disciplina.id);
  };

  if (maxFaltas === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-600 text-center">
          ⚠️ Controle de faltas não disponível para {disciplina.creditos} créditos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status das Faltas */}
      <div className={`p-3 rounded-lg border ${config.fundo}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Controle de Faltas
          </h4>
          <span className={`text-sm font-medium ${config.cor}`}>
            {config.icone} {config.titulo}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Faltas atuais:</strong> {faltasAtuais}</p>
            <p><strong>Máximo permitido:</strong> {maxFaltas}</p>
          </div>
          <div>
            <p><strong>Ainda pode faltar:</strong> 
              <span className={faltasRestantes <= 2 ? 'text-red-600 font-bold ml-1' : 'ml-1'}>
                {faltasRestantes} aulas
              </span>
            </p>
            <p><strong>Uso:</strong> {risco.porcentagem.toFixed(1)}%</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                risco.status === 'seguro' ? 'bg-green-500' :
                risco.status === 'atencao' ? 'bg-yellow-500' :
                risco.status === 'critico' ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(risco.porcentagem, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {faltasAtuais} de {maxFaltas} faltas utilizadas
          </p>
        </div>
      </div>

      {/* Controles de Faltas */}
      <div className="p-3 bg-white rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Gerenciar Faltas</span>
          {!editandoFaltas && (
            <Button
              onClick={iniciarEdicao}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>

        {editandoFaltas ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="faltas-edit" className="text-xs text-gray-600">
                Definir quantidade de faltas
              </Label>
              <Input
                id="faltas-edit"
                type="number"
                min="0"
                value={faltasTemp}
                onChange={(e) => setFaltasTemp(e.target.value)}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={salvarEdicao}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                Salvar
              </Button>
              <Button
                onClick={cancelarEdicao}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <X className="w-3 h-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>        ) : (
          <div className="space-y-2">
            {/* Layout para Mobile - botões lado a lado */}
            {isMobile ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleFalteiHoje}
                  className={`flex-1 ${
                    risco.status === 'reprovado' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : risco.status === 'critico'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                  disabled={risco.status === 'reprovado'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {risco.status === 'reprovado' ? 'Reprovado' : 'Faltei Hoje'}
                </Button>
                
                <Button
                  onClick={() => onRemoverFalta(disciplina.id)}
                  disabled={faltasAtuais === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
            ) : (
              /* Layout para Desktop - layout original */
              <>
                <Button
                  onClick={handleFalteiHoje}
                  className={`w-full ${
                    risco.status === 'reprovado' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : risco.status === 'critico'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                  disabled={risco.status === 'reprovado'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {risco.status === 'reprovado' ? 'Reprovado por Faltas' : 'Faltei Hoje'}
                </Button>
                
                {/* Controles de ajuste fino - apenas desktop */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onRemoverFalta(disciplina.id)}
                    disabled={faltasAtuais === 0}
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Remover
                  </Button>

                  <Button
                    onClick={() => onAdicionarAulaDupla(disciplina.id)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar para aula dupla
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Alertas especiais */}
      {risco.status === 'critico' && faltasRestantes > 0 && (
        <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <strong>Situação crítica!</strong>
          </div>
          <p className="mt-1">
            Você só pode faltar mais {faltasRestantes} aula{faltasRestantes !== 1 ? 's' : ''} 
            antes da reprovação por faltas.
          </p>
        </div>
      )}

      {risco.status === 'reprovado' && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          <div className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <strong>Reprovado por faltas!</strong>
          </div>
          <p className="mt-1">
            Você excedeu o limite máximo de {maxFaltas} faltas para esta disciplina.
          </p>
        </div>
      )}

      {risco.status === 'seguro' && faltasAtuais === 0 && (
        <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <strong>Frequência perfeita!</strong>
          </div>
          <p className="mt-1">
            Você ainda não faltou nenhuma aula. Pode faltar até {maxFaltas} aulas.
          </p>
        </div>
      )}
    </div>
  );
};

export default ControleFaltas;
