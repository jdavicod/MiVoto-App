import React, { useState } from 'react';
import { CANDIDATES } from '../types';

interface VotacionActivityViewProps {
  documento: string;
  edad: number;
  onVoteRegistered: (candidateId: string) => void;
  onFinishActivity: () => void;
}

export const VotacionActivityView: React.FC<VotacionActivityViewProps> = ({
  documento,
  edad,
  onVoteRegistered,
  onFinishActivity,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleVotar = () => {
    if (!selectedCandidateId) {
      showToast('Debe seleccionar un candidato para votar');
      return;
    }

    onVoteRegistered(selectedCandidateId);
    setShowSuccessDialog(true);
  };

  return (
    <div className="p-5 flex flex-col justify-between min-h-full relative">
      <div>
        {/* tvTituloTarjeton de activity_votacion.xml */}
        <h2 className="text-xl font-bold text-[#1E293B] text-center mb-1 uppercase tracking-tight">
          Tarjetón Electoral
        </h2>

        {/* tvDatosElector de activity_votacion.xml */}
        <p className="text-xs text-[#0288D1] text-center font-medium mb-6">
          Elector: <span className="font-mono font-bold">{documento}</span> • Edad: {edad} años (Habilitado)
        </p>

        <p className="text-xs font-bold text-slate-700 mb-3">
          Seleccione un candidato para la Alcaldía Municipal:
        </p>

        {/* RadioGroup rgCandidatos de activity_votacion.xml */}
        <div className="space-y-3 mb-6">
          {CANDIDATES.map((candidato, index) => {
            const isSelected = selectedCandidateId === candidato.id;
            return (
              <label
                key={candidato.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1976D2] bg-blue-50/50 shadow-xs ring-1 ring-[#1976D2]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="candidato_tarjeton"
                  value={candidato.id}
                  checked={isSelected}
                  onChange={() => setSelectedCandidateId(candidato.id)}
                  className="mt-1 w-4 h-4 text-[#1976D2] border-slate-300 focus:ring-[#1976D2]"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 text-sm">
                    {index + 1}. {candidato.name}
                  </div>
                  <div className="text-slate-500 font-medium">
                    {candidato.party}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Botón btnVotar de activity_votacion.xml */}
        <button
          id="btnVotar"
          onClick={handleVotar}
          className="w-full py-3 px-4 rounded-lg bg-[#1976D2] hover:bg-[#1565C0] active:bg-[#0D47A1] text-white font-medium text-sm shadow-md transition-all cursor-pointer uppercase tracking-wider mb-3"
        >
          Confirmar y Depositar Voto
        </button>

        {/* Botón btnCancelar de activity_votacion.xml */}
        <button
          id="btnCancelar"
          onClick={onFinishActivity}
          className="w-full py-2.5 px-4 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          Cancelar y Volver
        </button>
      </div>

      {/* AlertDialog nativo de Android para confirmación de voto (HU-04) */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              ¡Voto Registrado con Éxito!
            </h3>
            <p className="text-xs text-slate-600 text-center leading-relaxed">
              Certificado de votación emitido para el documento <strong className="font-mono">{documento}</strong>. Su voto ha sido contabilizado en la urna municipal.
            </p>
            <button
              onClick={() => {
                setShowSuccessDialog(false);
                onFinishActivity();
              }}
              className="w-full py-2.5 rounded-lg bg-[#1976D2] hover:bg-[#1565C0] text-white font-semibold text-xs tracking-wider uppercase shadow-sm cursor-pointer"
            >
              Finalizar
            </button>
          </div>
        </div>
      )}

      {/* Toast Android */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-slate-900/90 text-white text-xs py-2.5 px-4 rounded-full shadow-lg text-center backdrop-blur-xs z-30 pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
