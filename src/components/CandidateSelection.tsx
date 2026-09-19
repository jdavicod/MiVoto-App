import React, { useState } from 'react';
import { CANDIDATES, Candidate } from '../types';
import { Vote, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

interface CandidateSelectionProps {
  voterDocument: string;
  voterAge: number;
  onVoteConfirmed: (candidateId: string) => void;
  onCancel: () => void;
}

export const CandidateSelection: React.FC<CandidateSelectionProps> = ({
  voterDocument,
  voterAge,
  onVoteConfirmed,
  onCancel
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmVote = () => {
    if (!selectedCandidateId) {
      setError('Debe seleccionar uno de los 3 candidatos antes de confirmar su voto.');
      return;
    }

    onVoteConfirmed(selectedCandidateId);
  };

  return (
    <div id="candidate-selection-container" className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header del Tarjetón */}
      <div className="bg-slate-900 text-white p-5 md:p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>Tarjetón Oficial de Votación</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Alcaldía Municipal</h2>
            <p className="text-sm text-slate-300">Seleccione un único candidato de su preferencia</p>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300">
            <p>Elector: <strong className="text-white font-mono">{voterDocument}</strong></p>
            <p>Edad: <strong className="text-white">{voterAge} años</strong> (Habilitado)</p>
          </div>
        </div>
      </div>

      {/* Candidatos */}
      <div className="p-6 md:p-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CANDIDATES.map((candidate: Candidate) => {
            const isSelected = selectedCandidateId === candidate.id;

            return (
              <div
                key={candidate.id}
                id={`candidate-card-${candidate.id}`}
                onClick={() => {
                  setSelectedCandidateId(candidate.id);
                  setError(null);
                }}
                className={`relative flex flex-col justify-between p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Radio indicator and candidate number */}
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-sm font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {candidate.number}
                  </span>
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </div>

                {/* Candidate Information */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {candidate.name}
                  </h3>
                  <div className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${candidate.badgeColor}`}>
                    {candidate.party}
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{candidate.slogan}"
                  </p>
                </div>

                {/* Selection status badge */}
                <div className="pt-3 border-t border-slate-100 text-center">
                  <span className={`text-xs font-medium ${isSelected ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Seleccionado' : 'Haga clic para seleccionar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div id="candidate-error-msg" className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-cancel-vote"
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancelar y volver</span>
          </button>

          <button
            id="btn-confirm-vote"
            type="button"
            onClick={handleConfirmVote}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-sm transition-colors cursor-pointer text-sm"
          >
            <Vote className="w-5 h-5" />
            <span>Confirmar y Registrar Voto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
