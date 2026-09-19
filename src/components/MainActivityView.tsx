import React, { useState } from 'react';
import { hasVoterAlreadyVoted } from '../utils/storage';

interface MainActivityViewProps {
  onStartVotacionActivity: (documento: string, edad: number) => void;
  onStartAdminActivity: () => void;
}

export const MainActivityView: React.FC<MainActivityViewProps> = ({
  onStartVotacionActivity,
  onStartAdminActivity,
}) => {
  const [documento, setDocumento] = useState('');
  const [edad, setEdad] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorDocumento, setErrorDocumento] = useState<string | null>(null);
  const [errorEdad, setErrorEdad] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleValidarYProceder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDocumento(null);
    setErrorEdad(null);

    const docClean = documento.trim();
    const edadClean = edad.trim();

    // HU-01: Validación de campo documento
    if (!docClean) {
      setErrorDocumento('Debe ingresar el número de documento');
      return;
    }

    if (!/^\d+$/.test(docClean)) {
      setErrorDocumento('El documento debe contener solo números');
      return;
    }

    // HU-01: Validación de campo edad
    if (!edadClean) {
      setErrorEdad('Debe ingresar la edad del elector');
      return;
    }

    const edadNum = parseInt(edadClean, 10);
    if (isNaN(edadNum) || edadNum <= 0) {
      setErrorEdad('Edad inválida');
      return;
    }

    // HU-05: Impedir voto duplicado (revisión en Room / SQLite)
    if (hasVoterAlreadyVoted(docClean)) {
      showToast(`El documento ${docClean} ya sufragó en esta elección.`);
      return;
    }

    // HU-02: Validación de mayoría de edad (edad >= 18 años)
    if (edadNum < 18) {
      showToast(`Acceso denegado: El elector tiene ${edadNum} años y debe ser mayor o igual a 18 años para votar.`);
      return;
    }

    // Navegar a VotacionActivity (Intent explícito)
    onStartVotacionActivity(docClean, edadNum);
  };

  return (
    <div className="p-6 flex flex-col min-h-full justify-between relative">
      <div>
        {/* Título Institucional (TextView tvTitulo de activity_main.xml) */}
        <h2 className="text-xl font-bold text-[#1E293B] text-center mb-1 tracking-tight uppercase">
          Elecciones de Alcaldía
        </h2>
        <p className="text-xs text-[#64748B] text-center mb-8 font-medium">
          Módulo de Votación • Validación de Elector
        </p>

        <form onSubmit={handleValidarYProceder} className="space-y-5">
          {/* Campo Documento: TextView lblDocumento + EditText etDocumento */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Documento de Identidad:
            </label>
            <input
              id="etDocumento"
              type="text"
              inputMode="numeric"
              value={documento}
              onChange={(e) => {
                setDocumento(e.target.value);
                setErrorDocumento(null);
              }}
              placeholder="Ingrese número de cédula o T.I."
              className="w-full px-3.5 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {errorDocumento && (
              <span className="text-[11px] text-red-600 font-medium mt-1 block">
                {errorDocumento}
              </span>
            )}
          </div>

          {/* Campo Edad: TextView lblEdad + EditText etEdad */}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Edad del Elector:
            </label>
            <input
              id="etEdad"
              type="text"
              inputMode="numeric"
              value={edad}
              onChange={(e) => {
                setEdad(e.target.value);
                setErrorEdad(null);
              }}
              placeholder="Ingrese edad (debe ser mayor a 18)"
              className="w-full px-3.5 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {errorEdad && (
              <span className="text-[11px] text-red-600 font-medium mt-1 block">
                {errorEdad}
              </span>
            )}
          </div>

          {/* Botón btnValidar de activity_main.xml */}
          <button
            id="btnValidar"
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-[#1976D2] hover:bg-[#1565C0] active:bg-[#0D47A1] text-white font-medium text-sm shadow-md transition-all cursor-pointer uppercase tracking-wider"
          >
            Validar y Proceder a Votar
          </button>
        </form>

        {/* Separador */}
        <div className="w-full h-px bg-slate-200 my-6" />

        {/* Botón btnIrAdmin de activity_main.xml */}
        <button
          id="btnIrAdmin"
          type="button"
          onClick={onStartAdminActivity}
          className="w-full py-3 px-4 rounded-lg border-2 border-[#1976D2] text-[#1976D2] hover:bg-blue-50 active:bg-blue-100 font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          Acceso Módulo Administrador
        </button>
      </div>

      {/* Android Toast Notification emergente */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-slate-900/90 text-white text-xs py-2.5 px-4 rounded-full shadow-lg text-center backdrop-blur-xs z-30 animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
