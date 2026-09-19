import React, { useState, useEffect } from 'react';
import { VoterValidationForm } from './components/VoterValidationForm';
import { CandidateSelection } from './components/CandidateSelection';
import { VoteConfirmation } from './components/VoteConfirmation';
import { AdminModule } from './components/AdminModule';
import { VoteRecord } from './types';
import { getStoredVotes, getMaxElectors, registerVoteInStorage } from './utils/storage';
import {
  Landmark,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<'voter' | 'admin'>('voter');
  const [step, setStep] = useState<'validation' | 'selection' | 'confirmation'>('validation');
  const [currentVoterDoc, setCurrentVoterDoc] = useState<string>('');
  const [currentVoterAge, setCurrentVoterAge] = useState<number>(0);
  const [lastVote, setLastVote] = useState<VoteRecord | null>(null);
  const [totalVotesCount, setTotalVotesCount] = useState<number>(0);
  const [maxElectors, setMaxElectors] = useState<number | null>(null);

  // Cargar conteo actual de votos y censo en almacenamiento
  const syncStorage = () => {
    const votes = getStoredVotes();
    setTotalVotesCount(votes.length);
    setMaxElectors(getMaxElectors());
  };

  useEffect(() => {
    syncStorage();
  }, [step, activeModule]);

  // Manejar validación exitosa (HU-01, HU-02, HU-05)
  const handleVoterValidated = (documentId: string, age: number) => {
    setCurrentVoterDoc(documentId);
    setCurrentVoterAge(age);
    setStep('selection');
  };

  // Manejar registro confirmado de voto (HU-03, HU-04)
  const handleVoteConfirmed = (candidateId: string) => {
    const newRecord = registerVoteInStorage(currentVoterDoc, currentVoterAge, candidateId);
    setLastVote(newRecord);
    setTotalVotesCount(prev => prev + 1);
    setStep('confirmation');
  };

  // Regresar de la selección
  const handleCancelSelection = () => {
    setStep('validation');
  };

  // Habilitar siguiente elector (HU-04)
  const handleNextVoter = () => {
    setCurrentVoterDoc('');
    setCurrentVoterAge(0);
    setLastVote(null);
    setStep('validation');
  };

  // Reiniciar datos de prueba si se requiere
  const handleResetData = () => {
    if (window.confirm('¿Desea reiniciar todos los votos, electores y configuraciones para pruebas limpias?')) {
      localStorage.removeItem('conteo_electoral_votes');
      localStorage.removeItem('conteo_electoral_voters');
      localStorage.removeItem('conteo_electoral_max_electors');
      syncStorage();
      handleNextVoter();
    }
  };

  const isCensoCompleted = maxElectors !== null && totalVotesCount >= maxElectors;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Barra tricolor institucional */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/2 bg-amber-400" />
        <div className="h-full w-1/4 bg-blue-600" />
        <div className="h-full w-1/4 bg-red-600" />
      </div>

      {/* Cabecera institucional */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-lg bg-blue-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Elecciones de Alcaldía Municipal
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Conteo y Registro Electoral • República de Colombia
              </p>
            </div>
          </div>

          {/* Selector de Módulos (Épica 1 vs Épica 2) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold">
              <button
                id="btn-nav-voter-module"
                onClick={() => setActiveModule('voter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeModule === 'voter'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Módulo Votación</span>
              </button>

              <button
                id="btn-nav-admin-module"
                onClick={() => {
                  setActiveModule('admin');
                  syncStorage();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeModule === 'admin'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Módulo Administrador</span>
              </button>
            </div>

            <button
              onClick={handleResetData}
              title="Reiniciar urna y censo para pruebas"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Barra de estado rápido */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-300">
              Sistema Electoral Activo: {activeModule === 'voter' ? 'Módulo de Votación (Épica 1)' : 'Módulo Administrador (Épica 2)'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span>
              Votos en Urna: <strong className="text-white font-mono">{totalVotesCount}</strong>
            </span>
            {maxElectors && (
              <span>
                Censo: <strong className="text-white font-mono">{maxElectors}</strong> electores
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeModule === 'voter' ? (
          <div className="space-y-6">
            {/* Aviso si el censo configurado en HU-06 ya se completó */}
            {isCensoCompleted && (
              <div className="max-w-md mx-auto p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Aviso del Censo:</strong> Se ha alcanzado el 100% de los {maxElectors} electores configurados por la administración.
                </span>
              </div>
            )}

            {/* Indicador de pasos de Épica 1 */}
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl py-3 px-6 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div className={`flex items-center gap-1.5 font-semibold ${step === 'validation' ? 'text-blue-700' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    step === 'validation' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    1
                  </span>
                  <span>Identificación</span>
                </div>

                <div className="h-0.5 w-6 bg-slate-200" />

                <div className={`flex items-center gap-1.5 font-semibold ${step === 'selection' ? 'text-blue-700' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    step === 'selection' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    2
                  </span>
                  <span>Tarjetón</span>
                </div>

                <div className="h-0.5 w-6 bg-slate-200" />

                <div className={`flex items-center gap-1.5 font-semibold ${step === 'confirmation' ? 'text-emerald-700' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    step === 'confirmation' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    3
                  </span>
                  <span>Confirmación</span>
                </div>
              </div>
            </div>

            {/* Pasos de Votación */}
            {step === 'validation' && (
              <VoterValidationForm onValidated={handleVoterValidated} />
            )}

            {step === 'selection' && (
              <CandidateSelection
                voterDocument={currentVoterDoc}
                voterAge={currentVoterAge}
                onVoteConfirmed={handleVoteConfirmed}
                onCancel={handleCancelSelection}
              />
            )}

            {step === 'confirmation' && lastVote && (
              <VoteConfirmation
                voteRecord={lastVote}
                onNextVoter={handleNextVoter}
              />
            )}
          </div>
        ) : (
          <AdminModule
            onDataChanged={syncStorage}
            onNavigateToVoting={() => {
              setActiveModule('voter');
              handleNextVoter();
            }}
          />
        )}
      </main>

      {/* Pie de página institucional */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>Sistema de Conteo Electoral • Épica 1 (Votación) & Épica 2 (Administración)</p>
      </footer>
    </div>
  );
}
