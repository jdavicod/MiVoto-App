import React, { useState } from 'react';
import { ShieldAlert, UserCheck, AlertTriangle, ArrowRight, User } from 'lucide-react';
import { hasVoterAlreadyVoted } from '../utils/storage';

interface VoterValidationFormProps {
  onValidated: (documentId: string, age: number) => void;
}

export const VoterValidationForm: React.FC<VoterValidationFormProps> = ({ onValidated }) => {
  const [documentId, setDocumentId] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warningBlocked, setWarningBlocked] = useState<string | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarningBlocked(null);

    const docClean = documentId.trim();
    const ageClean = age.trim();

    // HU-01: Validaciones de ingreso
    if (!docClean) {
      setError('Debe ingresar el número de documento de identidad del elector.');
      return;
    }

    if (!/^\d+$/.test(docClean)) {
      setError('El documento de identidad debe contener únicamente dígitos numéricos.');
      return;
    }

    if (!ageClean) {
      setError('Debe ingresar la edad del elector.');
      return;
    }

    if (!/^\d+$/.test(ageClean)) {
      setError('La edad debe ser un número entero válido.');
      return;
    }

    const parsedAge = parseInt(ageClean, 10);

    if (parsedAge <= 0 || parsedAge > 125) {
      setError('Ingrese una edad válida (entre 1 y 125 años).');
      return;
    }

    // HU-05: Impedir voto duplicado
    if (hasVoterAlreadyVoted(docClean)) {
      setWarningBlocked(
        `Elector ya registrado: El documento de identidad N.° ${docClean} ya ejerció su derecho al voto en esta elección. No se admiten votos duplicados.`
      );
      return;
    }

    // HU-02: Validación de mayoría de edad
    if (parsedAge < 18) {
      setWarningBlocked(
        `Acceso bloqueado: El elector tiene ${parsedAge} años y es menor de edad. Por ley electoral colombiana, debe ser mayor o igual a 18 años para votar.`
      );
      return;
    }

    // Si cumple todas las validaciones
    onValidated(docClean, parsedAge);
  };

  return (
    <div id="voter-validation-container" className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Verificación del Elector</h2>
          <p className="text-xs text-slate-500">Módulo de Votación • Elección de Alcalde</p>
        </div>
      </div>

      <form onSubmit={handleValidate} className="mt-6 space-y-5">
        <div>
          <label htmlFor="input-voter-doc" className="block text-sm font-semibold text-slate-700 mb-1">
            Número de Documento (C.C. / T.I.)
          </label>
          <input
            id="input-voter-doc"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={documentId}
            onChange={(e) => {
              setDocumentId(e.target.value);
              setError(null);
              setWarningBlocked(null);
            }}
            placeholder="Ejemplo: 1020456789"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="mt-1 text-xs text-slate-500">Requerido para control de no duplicidad de voto.</p>
        </div>

        <div>
          <label htmlFor="input-voter-age" className="block text-sm font-semibold text-slate-700 mb-1">
            Edad del Elector
          </label>
          <input
            id="input-voter-age"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setError(null);
              setWarningBlocked(null);
            }}
            placeholder="Ejemplo: 24"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="mt-1 text-xs text-slate-500">Debe ser mayor o igual a 18 años para habilitar el voto.</p>
        </div>

        {error && (
          <div id="error-validation-msg" className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {warningBlocked && (
          <div id="blocked-voter-msg" className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3 text-amber-900 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Acceso no habilitado</strong>
              <p>{warningBlocked}</p>
            </div>
          </div>
        )}

        <button
          id="btn-validate-voter"
          type="submit"
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-5 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <UserCheck className="w-5 h-5" />
          <span>Validar y Proceder a Votar</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </form>
    </div>
  );
};
