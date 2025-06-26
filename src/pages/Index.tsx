import React from 'react';
import Header from '@/components/Header';
import TipoCalculoSelector from '@/components/TipoCalculoSelector';
import DisciplinaForm from '@/components/DisciplinaForm';
import DisciplinaParcialForm from '@/components/DisciplinaParcialForm';
import DisciplinasList from '@/components/DisciplinasList';
import DisciplinasParciaisList from '@/components/DisciplinasParciaisList';
import DisciplinasMediasList from '@/components/DisciplinasMediasList';
import PeriodoForm from '@/components/PeriodoForm';
import PeriodosList from '@/components/PeriodosList';
import CRAatualizado from '@/components/CRAatualizado';
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
    periodos,
    tipoCalculo,
    resultado,
    adicionarDisciplina,
    adicionarDisciplinaParcial,
    adicionarAtividade,
    editarAtividade,
    removerAtividade,
    adicionarProva,
    editarProva,
    removerProva,
    removerDisciplina,
    removerDisciplinaParcial,
    limparDisciplinas,
    limparDisciplinasParciais,
    adicionarPeriodo,
    removerPeriodo,
    limparPeriodos,
    editarDisciplinaPeriodo,
    adicionarDisciplinaPeriodo,
    removerDisciplinaPeriodo,
    setTipoCalculo,
    adicionarFalta,
    adicionarAulaDupla,
    removerFalta,
    definirFaltas
  } = useCalculadora();

  // Separa disciplinas por modalidade de avaliação
  const disciplinasPontos = disciplinasParciais.filter(d => d.modalidade === 'pontos');
  const disciplinasMedias = disciplinasParciais.filter(d => d.modalidade === 'medias');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <TipoCalculoSelector 
          tipoAtual={tipoCalculo}
          onTipoChange={setTipoCalculo}
        />
        
        {tipoCalculo === 'parcial' ? (
          <>
            <DisciplinaParcialForm onAddDisciplina={adicionarDisciplinaParcial} />
            
            {/* Sistema de Pontos */}
            {disciplinasPontos.length > 0 && (
              <DisciplinasParciaisList 
                disciplinas={disciplinasPontos}
                onRemoveDisciplina={removerDisciplinaParcial}
                onAddAtividade={adicionarAtividade}
                onEditAtividade={editarAtividade}
                onRemoveAtividade={removerAtividade}
                onAdicionarFalta={adicionarFalta}
                onAdicionarAulaDupla={adicionarAulaDupla}
                onRemoverFalta={removerFalta}
                onDefinirFaltas={definirFaltas}
              />
            )}
            
            {/* Sistema de Médias */}
            {disciplinasMedias.length > 0 && (
              <DisciplinasMediasList 
                disciplinas={disciplinasMedias}
                onRemoveDisciplina={removerDisciplinaParcial}
                onAddProva={adicionarProva}
                onEditProva={editarProva}
                onRemoveProva={removerProva}
                onAdicionarFalta={adicionarFalta}
                onAdicionarAulaDupla={adicionarAulaDupla}
                onRemoverFalta={removerFalta}
                onDefinirFaltas={definirFaltas}
              />
            )}
            
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
            
            {/* Box do CR Parcial e Calculadora de CR Desejado agrupados */}
            <div className="bg-white rounded shadow p-4 mb-6">
              <ResultadoCalculos 
                resultado={resultado}
                tipoCalculo={tipoCalculo}
                disciplinasParciais={disciplinasParciais}
              />
              <CRDesejado
                disciplinas={disciplinas}
                disciplinasParciais={disciplinasParciais}
                tipoCalculo={tipoCalculo}
                crAtual={resultado?.mediaGeral}
              />
            </div>
            
            {/* Box separado do CRA Atualizado (períodos + parciais) */}
            <CRAatualizado 
              disciplinasParciais={disciplinasParciais}
              periodos={periodos}
            />
          </>
        ) : tipoCalculo === 'curso' ? (
          <>
            <PeriodoForm onAddPeriodo={adicionarPeriodo} />
            
            <PeriodosList 
              periodos={periodos}
              onRemovePeriodo={removerPeriodo}
              onEditarDisciplinaPeriodo={editarDisciplinaPeriodo}
              onAdicionarDisciplinaPeriodo={adicionarDisciplinaPeriodo}
              onRemoverDisciplinaPeriodo={removerDisciplinaPeriodo}
            />
            
            {periodos.length > 0 && (
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={limparPeriodos}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar Todos os Períodos
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
        
        {/* Componentes para outros tipos de cálculo (período e curso) */}
        {tipoCalculo !== 'parcial' && (
          <>
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
          </>
        )}

        <GerenciadorPersistencia />
      </main>
      
      {/* Calculadora flutuante */}
      <Calculadora />
      
      {/* Indicador de status offline */}
      <OfflineIndicator />
      
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            Calculadora de Rendimento Universitário - Desenvolvida para facilitar seus estudos
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Criada por Skiner Bold - o amor da Aninha
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
