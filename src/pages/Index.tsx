
import React from 'react';
import Header from '@/components/Header';
import TipoCalculoSelector from '@/components/TipoCalculoSelector';
import DisciplinaForm from '@/components/DisciplinaForm';
import DisciplinaParcialForm from '@/components/DisciplinaParcialForm';
import DisciplinasList from '@/components/DisciplinasList';
import DisciplinasParciaisList from '@/components/DisciplinasParciaisList';
import ResultadoCalculos from '@/components/ResultadoCalculos';
import CRDesejado from '@/components/CRDesejado';
import Calculadora from '@/components/Calculadora';
import GerenciadorPersistencia from '@/components/GerenciadorPersistencia';
import OfflineIndicator from '@/components/OfflineIndicator';
import { useCalculadora } from '@/hooks/useCalculadora';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const Index = () => {
  const {
    disciplinas,
    disciplinasParciais,
    tipoCalculo,
    resultado,
    adicionarDisciplina,
    adicionarDisciplinaParcial,
    adicionarAtividade,
    editarAtividade,
    removerAtividade,
    removerDisciplina,
    removerDisciplinaParcial,
    limparDisciplinas,
    limparDisciplinasParciais,
    setTipoCalculo,
    adicionarFalta,
    adicionarAulaDupla,
    removerFalta,
    definirFaltas
  } = useCalculadora();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-6 py-8">
        <TipoCalculoSelector 
          tipoAtual={tipoCalculo}
          onTipoChange={setTipoCalculo}
        />
        
        {tipoCalculo === 'parcial' ? (
          <>
            <DisciplinaParcialForm onAddDisciplina={adicionarDisciplinaParcial} />
            
            <DisciplinasParciaisList 
              disciplinas={disciplinasParciais}
              onRemoveDisciplina={removerDisciplinaParcial}
              onAddAtividade={adicionarAtividade}
              onEditAtividade={editarAtividade}
              onRemoveAtividade={removerAtividade}
              onAdicionarFalta={adicionarFalta}
              onAdicionarAulaDupla={adicionarAulaDupla}
              onRemoverFalta={removerFalta}
              onDefinirFaltas={definirFaltas}
            />
            
            {disciplinasParciais.length > 0 && (
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={limparDisciplinasParciais}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar Todas as Disciplinas
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <DisciplinaForm onAddDisciplina={adicionarDisciplina} />
            
            <DisciplinasList 
              disciplinas={disciplinas}
              onRemoveDisciplina={removerDisciplina}
            />
            
            {disciplinas.length > 0 && (
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={limparDisciplinas}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar Todas as Disciplinas
                </Button>
              </div>
            )}
          </>
        )}
        
        <ResultadoCalculos 
          resultado={resultado}
          tipoCalculo={tipoCalculo}
        />

        <CRDesejado
          disciplinas={disciplinas}
          disciplinasParciais={disciplinasParciais}
          tipoCalculo={tipoCalculo}
          crAtual={resultado?.mediaGeral}
        />

        <GerenciadorPersistencia />
      </main>
      
      {/* Calculadora flutuante */}
      <Calculadora />
      
      {/* Indicador de status offline */}
      <OfflineIndicator />
      
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <p className="text-gray-400">
            Calculadora de Rendimento Universitário - Desenvolvida para facilitar seus estudos
          </p>
          <p className="text-gray-400">
            Criada por Skiner Bold - o amor da Aninha
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
