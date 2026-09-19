import React, { useState, useEffect } from 'react';
import {
  VoteRecord,
  Candidate,
  CANDIDATES,
  ElectionResultsSummary,
} from '../types';
import {
  getStoredVotes,
  getMaxElectors,
  saveMaxElectors,
  deleteVoteFromStorage,
  calculateElectionResults,
  resetAllCounts,
} from '../utils/storage';

interface AdminActivityViewProps {
  onFinishActivity: () => void;
  onDataChanged: () => void;
}

export const AdminActivityView: React.FC<AdminActivityViewProps> = ({
  onFinishActivity,
  onDataChanged,
}) => {
  // Autenticación obligatoria (Usuario: admin, Contraseña: admin)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados de datos
  const [censoInput, setCensoInput] = useState('');
  const [censoActual, setCensoActual] = useState<number | null>(null);
  const [votos, setVotos] = useState<VoteRecord[]>([]);
  const [resultados, setResultados] = useState<ElectionResultsSummary>(calculateElectionResults());
  const [votoParaEliminar, setVotoParaEliminar] = useState<VoteRecord | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const recargarDatos = () => {
    const v = getStoredVotes();
    setVotos(v);
    const c = getMaxElectors();
    setCensoActual(c);
    if (c !== null) setCensoInput(c.toString());
    setResultados(calculateElectionResults());
    onDataChanged();
  };

  useEffect(() => {
    recargarDatos();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === 'admin' && passInput === 'admin') {
      setIsAuthenticated(true);
      showToast('Acceso concedido al Módulo Administrador');
      recargarDatos();
    } else {
      setLoginError('Credenciales incorrectas. Acceso denegado.');
    }
  };

  const handleGuardarCenso = () => {
    const val = parseInt(censoInput.trim(), 10);
    if (isNaN(val) || val <= 0) {
      showToast('Ingrese un número de electores válido (> 0)');
      return;
    }
    saveMaxElectors(val);
    setCensoActual(val);
    showToast(`Censo configurado: ${val} electores habilitados`);
    recargarDatos();
  };

  const handleEliminarVotoConfirmado = () => {
    if (votoParaEliminar) {
      deleteVoteFromStorage(votoParaEliminar.id);
      showToast(`Voto del elector ${votoParaEliminar.voterDocument} eliminado.`);
      setVotoParaEliminar(null);
      recargarDatos();
    }
  };

  const handleConfirmarReinicioConteos = () => {
    resetAllCounts();
    setShowResetConfirmation(false);
    showToast('Se han reiniciado todos los conteos de la elección.');
    recargarDatos();
  };

  // Diálogo de Login Nativo de Android (AlertDialog de solicitud de credenciales)
  if (!isAuthenticated) {
    return (
      <div className="p-6 flex flex-col justify-center items-center min-h-full">
        <div className="w-full bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">
              Acceso Restringido
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ingrese credenciales de administrador (admin / admin):
            </p>
          </div>

          {loginError && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Usuario
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="admin"
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1976D2] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Contraseña
              </label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="admin"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1976D2] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onFinishActivity}
                className="w-1/2 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 relative">
      {/* SECCIÓN 1: HU-06 Configuración de Electores Habilitados */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <h3 className="text-xs font-bold text-[#1976D2] uppercase tracking-wider mb-2">
          1. Configuración de Censo (HU-06)
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Establece el número máximo de electores habilitados para la elección:
        </p>

        <div className="flex gap-2">
          <input
            id="etCenso"
            type="number"
            min="1"
            value={censoInput}
            onChange={(e) => setCensoInput(e.target.value)}
            placeholder="Total electores (ej: 100)"
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:outline-none"
          />
          <button
            id="btnGuardarCenso"
            onClick={handleGuardarCenso}
            className="px-4 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs cursor-pointer"
          >
            Guardar
          </button>
        </div>

        {censoActual && (
          <div className="mt-2 text-[11px] text-slate-600">
            Censo configurado: <strong>{censoActual}</strong> electores | Votos emitidos: <strong>{votos.length}</strong> ({((votos.length / censoActual) * 100).toFixed(1)}%)
          </div>
        )}
      </div>

      {/* SECCIÓN 2: HU-09 y HU-10 Resultados del Escrutinio */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-[#1976D2] uppercase tracking-wider">
          2. Escrutinio y Resultados (HU-09 / HU-10)
        </h3>

        <div className="space-y-2 text-xs">
          {CANDIDATES.map((c: Candidate) => {
            const candResult = resultados.candidatesResults.find((cr) => cr.candidate.id === c.id);
            const count = candResult ? candResult.votes : 0;
            const pct = candResult ? candResult.percentage : 0;
            const isWinner = resultados.status === 'winner' && resultados.winner?.id === c.id;

            return (
              <div
                key={c.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  isWinner ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    {c.name} {isWinner && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-mono">GANADOR</span>}
                  </div>
                  <div className="text-[10px] text-slate-500">{c.party}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-slate-800">{count}</span>
                  <span className="text-[10px] text-slate-500 ml-1">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* HU-10: Diferencia al segundo candidato */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <div className="font-bold">Boletín Oficial:</div>
          <p className="text-[11px] mt-0.5">
            {resultados.status === 'winner' && resultados.winner && (
              <span>Candidato ganador: <strong>{resultados.winner.name}</strong></span>
            )}
            {resultados.status === 'tie' && (
              <span>Empate técnico en el primer lugar entre los candidatos con mayor votación.</span>
            )}
            {resultados.status === 'no_votes' && (
              <span>No se han emitido votos aún en la urna electoral.</span>
            )}
          </p>
          {resultados.voteDifference !== null && (
            <div className="mt-1 font-semibold text-[11px]">
              Diferencia de votos frente al 2.° lugar: <strong className="font-mono">{resultados.voteDifference}</strong> votos
            </div>
          )}
        </div>

        {/* Botón para reiniciar todos los conteos */}
        <button
          id="btnReiniciarConteos"
          onClick={() => setShowResetConfirmation(true)}
          className="w-full py-2.5 px-3 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          Reiniciar Todos los Conteos
        </button>
      </div>

      {/* SECCIÓN 3: HU-07 y HU-08 Auditoría y Eliminación de Votos */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1976D2] uppercase tracking-wider">
            3. Lista de Votos (HU-07)
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            {votos.length} registrados
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Toque cualquier voto para anular/eliminar (HU-08, sin opción de edición):
        </p>

        {votos.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
            No hay votos registrados en la base de datos Room.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
            {votos.map((v) => {
              const cand = CANDIDATES.find((c) => c.id === v.candidateId);
              return (
                <div
                  key={v.id}
                  onClick={() => setVotoParaEliminar(v)}
                  className="p-2.5 hover:bg-red-50/60 active:bg-red-100/60 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">
                      C.C.: <span className="font-mono">{v.voterDocument}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Votó por: <strong className="text-slate-700">{cand?.name}</strong> • {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón Volver a Votación */}
      <button
        id="btnVolverVotacion"
        onClick={onFinishActivity}
        className="w-full py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
      >
        Volver a Pantalla de Votación
      </button>

      {/* Diálogo de Confirmación para Eliminar Voto (HU-08) */}
      {votoParaEliminar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              ¿Eliminar Voto?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Está seguro de eliminar el voto del elector <strong className="font-mono">{votoParaEliminar.voterDocument}</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">
                Esta acción es irreversible y recalculará inmediatamente los resultados del escrutinio (HU-08).
              </span>
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setVotoParaEliminar(null)}
                className="w-1/2 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarVotoConfirmado}
                className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmación para Reiniciar Todos los Conteos */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-xl space-y-3 animate-scale-in">
            <h4 className="text-sm font-bold text-slate-900">
              ¿Reiniciar Todos los Conteos?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Está seguro de que desea reiniciar todos los conteos de la elección?
              <br /><br />
              <span className="text-red-600 font-medium">
                Esta acción vaciará completamente la urna electoral y eliminará todos los votos registrados.
              </span>
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="w-1/2 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btnConfirmarReinicio"
                onClick={handleConfirmarReinicioConteos}
                className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Android */}
      {toastMessage && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[85%] bg-slate-900/90 text-white text-xs py-2 px-3 rounded-full shadow-lg text-center backdrop-blur-xs z-40 pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
