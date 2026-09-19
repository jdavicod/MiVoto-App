import React from 'react';
import { CheckCircle2, ShieldCheck, User, Calendar, FileText, ArrowRight } from 'lucide-react';
import { VoteRecord } from '../types';

interface VoteConfirmationProps {
  voteRecord: VoteRecord;
  onNextVoter: () => void;
}

export const VoteConfirmation: React.FC<VoteConfirmationProps> = ({ voteRecord, onNextVoter }) => {
  const formattedDate = new Date(voteRecord.timestamp).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  return (
    <div id="vote-confirmation-container" className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Banner de Éxito */}
      <div className="bg-emerald-600 text-white p-6 text-center">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>
        <h2 id="confirmation-title" className="text-2xl font-bold tracking-tight">¡Voto Registrado con Éxito!</h2>
        <p className="text-emerald-100 text-sm mt-1">
          Su sufragio ha sido depositado y contabilizado en el sistema electoral.
        </p>
      </div>

      {/* Detalle del comprobante */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Certificado de Votación
            </span>
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
              VÁLIDO
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Identificador de Voto</span>
              <strong className="font-mono text-slate-800 text-xs">{voteRecord.id}</strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Documento Elector</span>
              <strong className="font-mono text-slate-800 text-xs">
                •••• {voteRecord.voterDocument.slice(-4) || voteRecord.voterDocument}
              </strong>
            </div>

            <div className="col-span-2">
              <span className="text-xs text-slate-500 block">Fecha y Hora de Emisión</span>
              <span className="text-slate-700 text-xs flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-blue-50/80 border border-blue-100 rounded-lg text-xs text-blue-900">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <p>
            El voto es secreto y personal. Los datos han quedado almacenados de forma segura e inalterable.
          </p>
        </div>

        {/* Botón para siguiente elector */}
        <button
          id="btn-next-elector"
          type="button"
          onClick={onNextVoter}
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-5 rounded-lg transition-colors cursor-pointer shadow-sm text-sm"
        >
          <span>Habilitar Siguiente Elector</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
