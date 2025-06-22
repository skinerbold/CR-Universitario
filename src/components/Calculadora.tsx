import React, { useState } from 'react';
import { Calculator, X, Divide, Plus, Minus, Equal, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Calculadora = () => {
  const [display, setDisplay] = useState('0');
  const [operacao, setOperacao] = useState<string | null>(null);
  const [valorAnterior, setValorAnterior] = useState<string | null>(null);
  const [aguardandoOperando, setAguardandoOperando] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const inputNumero = (num: string) => {
    if (aguardandoOperando) {
      setDisplay(num);
      setAguardandoOperando(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (aguardandoOperando) {
      setDisplay('0.');
      setAguardandoOperando(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const limpar = () => {
    setDisplay('0');
    setOperacao(null);
    setValorAnterior(null);
    setAguardandoOperando(false);
  };

  const deletar = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const executarOperacao = (proximaOperacao: string) => {
    const inputValue = parseFloat(display);

    if (valorAnterior === null) {
      setValorAnterior(display);
    } else if (operacao) {
      const valorAtual = parseFloat(valorAnterior);
      let resultado: number;

      switch (operacao) {
        case '+':
          resultado = valorAtual + inputValue;
          break;
        case '-':
          resultado = valorAtual - inputValue;
          break;
        case '*':
          resultado = valorAtual * inputValue;
          break;
        case '/':
          resultado = valorAtual / inputValue;
          break;
        default:
          return;
      }

      setDisplay(String(resultado));
      setValorAnterior(String(resultado));
    }

    setAguardandoOperando(true);
    setOperacao(proximaOperacao);
  };

  const calcular = () => {
    if (operacao && valorAnterior !== null) {
      executarOperacao('=');
      setOperacao(null);
      setValorAnterior(null);
      setAguardandoOperando(true);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="sm"
        >
          <Calculator className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 w-64">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculadora
          </h3>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Display */}
        <div className="bg-gray-900 text-white p-3 rounded-lg mb-3 text-right">
          <div className="text-lg font-mono break-all">
            {display}
          </div>
        </div>

        {/* Botões */}
        <div className="grid grid-cols-4 gap-2">
          {/* Primeira linha */}
          <Button
            onClick={limpar}
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            size="sm"
          >
            C
          </Button>
          <Button
            onClick={deletar}
            variant="outline"
            className="text-orange-600 hover:bg-orange-50"
            size="sm"
          >
            <Delete className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => executarOperacao('/')}
            variant="outline"
            className="text-blue-600 hover:bg-blue-50"
            size="sm"
          >
            <Divide className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => executarOperacao('*')}
            variant="outline"
            className="text-blue-600 hover:bg-blue-50"
            size="sm"
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Segunda linha */}
          <Button onClick={() => inputNumero('7')} variant="outline" size="sm">7</Button>
          <Button onClick={() => inputNumero('8')} variant="outline" size="sm">8</Button>
          <Button onClick={() => inputNumero('9')} variant="outline" size="sm">9</Button>
          <Button
            onClick={() => executarOperacao('-')}
            variant="outline"
            className="text-blue-600 hover:bg-blue-50"
            size="sm"
          >
            <Minus className="w-3 h-3" />
          </Button>

          {/* Terceira linha */}
          <Button onClick={() => inputNumero('4')} variant="outline" size="sm">4</Button>
          <Button onClick={() => inputNumero('5')} variant="outline" size="sm">5</Button>
          <Button onClick={() => inputNumero('6')} variant="outline" size="sm">6</Button>
          <Button
            onClick={() => executarOperacao('+')}
            variant="outline"
            className="text-blue-600 hover:bg-blue-50"
            size="sm"
          >
            <Plus className="w-3 h-3" />
          </Button>

          {/* Quarta linha */}
          <Button onClick={() => inputNumero('1')} variant="outline" size="sm">1</Button>
          <Button onClick={() => inputNumero('2')} variant="outline" size="sm">2</Button>
          <Button onClick={() => inputNumero('3')} variant="outline" size="sm">3</Button>
          <Button
            onClick={calcular}
            className="bg-green-600 hover:bg-green-700 text-white row-span-2"
            size="sm"
          >
            <Equal className="w-3 h-3" />
          </Button>

          {/* Quinta linha */}
          <Button
            onClick={() => inputNumero('0')}
            variant="outline"
            className="col-span-2"
            size="sm"
          >
            0
          </Button>
          <Button onClick={inputDecimal} variant="outline" size="sm">.</Button>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          💡 Para cálculos de CR e notas
        </div>
      </div>
    </div>
  );
};

export default Calculadora;
