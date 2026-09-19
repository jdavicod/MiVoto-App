import React, { useState } from 'react';
import {
  Settings,
  Users,
  Vote,
  Trash2,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  Lock,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import {
  VoteRecord,
  CANDIDATES,
  Candidate,
  ElectionResultsSummary
} from '../types';
import {
  getStoredVotes,
  getMaxElectors,
  saveMaxElectors,
  deleteVoteFromStorage,
  calculateElectionResults
} from '../utils/storage';

interface AdminModuleProps {
  onDataChanged: () => void;
  onNavigateToVoting: () => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
  onDataChanged,
  onNavigateToVoting
}) => {
  // Estado de autenticación para acceso restringido
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'results' | 'votes' | 'config'>('results');

  // Configuración de electores (HU-06)
  const currentMaxElectors = getMaxElectors();
  const [electorsInput, setElectorsInput] = useState<string>(
    currentMaxElectors ? currentMaxElectors.toString() : ''
  );
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Lista de votos y eliminación (HU-07 & HU-08)
  const [votesList, setVotesList] = useState<VoteRecord[]>(getStoredVotes());
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [filterCandidate, setFilterCandidate] = useState<string>('all');

  // Resultados (HU-09 & HU-10)
  const [results, setResults] = useState<ElectionResultsSummary>(calculateElectionResults());

  // Manejar Login del Administrador (Usuario y Contraseña: "admin")
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const user = usernameInput.trim();
    const pass = passwordInput;

    if (!user || !pass) {
      setLoginError('Por favor ingrese tanto el usuario como la contraseña.');
      return;
    }

    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      setLoginError(null);
      refreshAllData();
    } else {
      setLoginError('Credenciales incorrectas. Verifique usuario y contraseña.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
    setLoginError(null);
  };

  // Actualizar datos
  const refreshAllData = () => {
    const freshVotes = getStoredVotes();
    setVotesList(freshVotes);
    setResults(calculateElectionResults());
    onDataChanged();
  };

  // HU-06: Guardar número total de electores habilitados
  const handleSaveElectors = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    setConfigSuccess(null);

    const valClean = electorsInput.trim();
    if (!valClean) {
      setConfigError('Debe ingresar un valor numérico para los electores habilitados.');
      return;
    }

    if (!/^\d+$/.test(valClean)) {
      setConfigError('Solo se permiten números enteros positivos.');
      return;
    }

    const parsed = parseInt(valClean, 10);
    if (parsed <= 0) {
      setConfigError('El número de electores habilitados debe ser mayor a cero.');
      return;
    }

    saveMaxElectors(parsed);
    setConfigSuccess(`Censo electoral configurado exitosamente: ${parsed.toLocaleString('es-CO')} electores habilitados.`);
    refreshAllData();
  };

  // HU-08: Eliminar un voto (sin poder editarlo)
  const handleDeleteVote = (voteId: string) => {
    const vote = votesList.find(v => v.id === voteId);
    if (!vote) return;

    const cand = CANDIDATES.find(c => c.id === vote.candidateId);
    const candName = cand ? cand.name : 'candidato';

    const confirmed = window.confirm(
      `¿Está seguro de eliminar el voto "${vote.id}" (${candName})? Esta acción anulará el registro y recalculará los resultados inmediatamente.`
    );

    if (confirmed) {
      const ok = deleteVoteFromStorage(voteId);
      if (ok) {
        setDeleteSuccess(`El voto ${voteId} fue eliminado correctamente.`);
        setSelectedVoteId(null);
        refreshAllData();
        setTimeout(() => setDeleteSuccess(null), 4000);
      }
    }
  };

  // Filtrado de votos para auditoría
  const filteredVotes = votesList.filter(v => {
    if (filterCandidate === 'all') return true;
    return v.candidateId === filterCandidate;
  });

  // Si no está autenticado, mostrar formulario de login restringido
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-6 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Acceso Restringido
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Módulo Administrador de la Elección. Ingrese sus credenciales autorizadas para continuar.
          </p>
        </div>

        {loginError && (
          <div
            id="admin-login-error"
            className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Usuario Administrador
            </label>
            <input
              id="admin-username"
              type="text"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              placeholder="Ingrese usuario"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Ingrese contraseña"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              id="btn-submit-admin-login"
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ingresar al Módulo Administrador</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToVoting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
            >
              <span>Volver a Módulo de Votación</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Credenciales de acceso: Usuario: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">admin</code> | Contraseña: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">admin</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-module-container" className="space-y-6">
      {/* Barra de pestañas administrativas y botón de cerrar sesión */}
      <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            id="tab-admin-results"
            onClick={() => {
              setActiveTab('results');
              refreshAllData();
            }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'results'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Resultados y Conteo (HU-09 / HU-10)</span>
          </button>

          <button
            id="tab-admin-votes"
            onClick={() => {
              setActiveTab('votes');
              refreshAllData();
            }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'votes'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Auditoría de Votos (HU-07 / HU-08)</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'votes' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {votesList.length}
            </span>
          </button>

          <button
            id="tab-admin-config"
            onClick={() => {
              setActiveTab('config');
              refreshAllData();
            }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración del Censo (HU-06)</span>
          </button>
        </div>

        <button
          id="btn-admin-logout"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200/60"
          title="Cerrar sesión de administrador"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* PESTAÑA 1: RESULTADOS (HU-09 & HU-10) */}
      {/* ============================================================ */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Header de Resultados */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                <Scale className="w-4 h-4" />
                <span>Boletín Electoral Oficial en Tiempo Real</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Escrutinio de la Elección</h2>
              <p className="text-sm text-slate-500">
                Total de votos contabilizados en urna: <strong className="text-slate-900">{results.totalVotes}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshAllData}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Actualizar escrutinio"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar Conteo</span>
              </button>

              <button
                onClick={onNavigateToVoting}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                <Vote className="w-3.5 h-3.5" />
                <span>Ir al Módulo de Votación</span>
              </button>
            </div>
          </div>

          {/* Tarjeta de Ganador / Empate / Sin Votos (HU-09 & HU-10) */}
          {results.status === 'winner' && results.winner && (
            <div id="winner-card" className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 mb-1">
                      CANDIDATO GANADOR
                    </span>
                    <h3 className="text-2xl font-extrabold text-emerald-950">
                      {results.winner.name}
                    </h3>
                    <p className="text-sm font-semibold text-emerald-800">
                      {results.winner.party} (Tarjetón #{results.winner.number})
                    </p>
                  </div>
                </div>

                {/* HU-10: Diferencia de votos del ganador */}
                <div className="bg-white/80 backdrop-blur-xs border border-emerald-300 rounded-xl p-4 text-center sm:text-right w-full sm:w-auto">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide block">
                    Diferencia con el 2.° lugar
                  </span>
                  <div className="flex items-baseline justify-center sm:justify-end gap-1.5 mt-0.5">
                    <span id="vote-difference-val" className="text-3xl font-black text-emerald-700">
                      +{results.voteDifference}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">voto(s)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {results.runnerUp
                      ? `Sobre ${results.runnerUp.name}`
                      : 'Sin contrincante inmediato'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {results.status === 'tie' && (
            <div id="tie-card" className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 mb-1">
                    EMPATE TÉCNICO REGISTRADO
                  </span>
                  <h3 className="text-xl font-bold text-amber-950">
                    Empate entre los candidatos con mayor votación
                  </h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Candidatos con igualdad de sufragios: {results.tiedCandidates.map(c => `${c.name} (${c.number})`).join(' y ')}.
                  </p>
                  <p className="text-xs text-amber-900 font-bold mt-2">
                    Diferencia de votos (HU-10): 0 votos de ventaja.
                  </p>
                </div>
              </div>
            </div>
          )}

          {results.status === 'no_votes' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <Vote className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No se han registrado votos aún</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                La urna está lista para recibir sufragios. Ingrese electores desde el módulo de votación para comenzar a ver el conteo.
              </p>
              <button
                onClick={onNavigateToVoting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Ir al Módulo de Votación</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tarjetas de Conteo por Candidato (HU-09) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {results.candidatesResults.map(({ candidate, votes, percentage }) => {
              const isWinner = results.status === 'winner' && results.winner?.id === candidate.id;
              const isTied = results.status === 'tie' && results.tiedCandidates.some(c => c.id === candidate.id);

              return (
                <div
                  key={candidate.id}
                  id={`result-candidate-${candidate.id}`}
                  className={`bg-white rounded-xl p-5 border-2 shadow-xs flex flex-col justify-between ${
                    isWinner
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : isTied
                      ? 'border-amber-400'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                        {candidate.number}
                      </span>
                      {isWinner && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Trophy className="w-3 h-3" />
                          Ganador
                        </span>
                      )}
                      {isTied && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Empatado
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-tight">
                      {candidate.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 mb-4">
                      {candidate.party}
                    </p>
                  </div>

                  {/* Barra de progreso y conteo */}
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900">
                        {votes} <span className="text-xs font-normal text-slate-500">votos</span>
                      </span>
                      <span className="text-sm font-bold text-blue-700">
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWinner ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estadísticas de Participación Electoral (HU-06) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Participación del Censo Electoral</h4>
                <p className="text-xs text-slate-500">
                  {results.maxElectors
                    ? `${results.totalVotes} votos emitidos de un total de ${results.maxElectors.toLocaleString('es-CO')} electores habilitados.`
                    : 'Aún no se ha fijado el límite total de electores habilitados (HU-06).'}
                </p>
              </div>
            </div>

            {results.maxElectors && results.participationRate !== null ? (
              <div className="text-right">
                <span className="text-2xl font-black text-blue-800">
                  {results.participationRate}%
                </span>
                <span className="text-xs text-slate-500 block">Tasa de sufragio</span>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('config')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                Configurar censo en HU-06 →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA 2: AUDITORÍA DE VOTOS Y ELIMINACIÓN (HU-07 & HU-08) */}
      {/* ============================================================ */}
      {activeTab === 'votes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Listado de Votos Registrados</h3>
              <p className="text-xs text-slate-500">
                Auditoría del proceso. Puede eliminar registros inválidos sin posibilidad de edición (HU-08).
              </p>
            </div>

            {/* Filtro por candidato */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                id="select-filter-candidate"
                value={filterCandidate}
                onChange={(e) => setFilterCandidate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los candidatos ({votesList.length})</option>
                {CANDIDATES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.number}. {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {deleteSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{deleteSuccess}</span>
            </div>
          )}

          {/* Tabla / Lista de votos */}
          {filteredVotes.length === 0 ? (
            <div id="empty-votes-msg" className="bg-white rounded-xl p-8 border border-slate-200 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">
                No hay votos registrados {filterCandidate !== 'all' ? 'para este candidato' : 'en el sistema'}.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Los nuevos votos registrados desde el módulo de votación aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <tr>
                      <th className="px-4 py-3">Folio Voto</th>
                      <th className="px-4 py-3">Elector (Doc)</th>
                      <th className="px-4 py-3">Candidato Votado</th>
                      <th className="px-4 py-3">Fecha y Hora</th>
                      <th className="px-4 py-3 text-right">Acción (HU-08)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredVotes.map((vote) => {
                      const candidate = CANDIDATES.find(c => c.id === vote.candidateId);
                      const isSelected = selectedVoteId === vote.id;

                      return (
                        <tr
                          key={vote.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            {vote.id}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            •••• {vote.voterDocument.slice(-4) || vote.voterDocument}
                          </td>
                          <td className="px-4 py-3">
                            {candidate ? (
                              <div>
                                <strong className="text-slate-900 block font-semibold">
                                  {candidate.number}. {candidate.name}
                                </strong>
                                <span className="text-[10px] text-slate-500">
                                  {candidate.party}
                                </span>
                              </div>
                            ) : (
                              <span className="text-rose-600">Candidato no encontrado</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(vote.timestamp).toLocaleString('es-CO', {
                              dateStyle: 'short',
                              timeStyle: 'medium'
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {/* HU-08: Eliminar voto sin opción de edición */}
                            <button
                              id={`btn-delete-vote-${vote.id}`}
                              onClick={() => handleDeleteVote(vote.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              title="Eliminar este voto (recalcula el conteo inmediatamente)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA 3: CONFIGURACIÓN DEL CENSO ELECTORAL (HU-06) */}
      {/* ============================================================ */}
      {activeTab === 'config' && (
        <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Censo Electoral de la Elección</h3>
              <p className="text-xs text-slate-500">HU-06: Configuración del número total de electores habilitados</p>
            </div>
          </div>

          <form onSubmit={handleSaveElectors} className="mt-6 space-y-5">
            <div>
              <label htmlFor="input-max-electors" className="block text-sm font-semibold text-slate-700 mb-1">
                Número Total de Electores Habilitados
              </label>
              <input
                id="input-max-electors"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={electorsInput}
                onChange={(e) => {
                  setElectorsInput(e.target.value);
                  setConfigError(null);
                  setConfigSuccess(null);
                }}
                placeholder="Ejemplo: 500"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Establece el tope de participación y permite calcular el porcentaje oficial de asistencia electoral.
              </p>
            </div>

            {configError && (
              <div id="config-error-msg" className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{configError}</span>
              </div>
            )}

            {configSuccess && (
              <div id="config-success-msg" className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{configSuccess}</span>
              </div>
            )}

            <button
              id="btn-save-max-electors"
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-5 rounded-lg transition-colors cursor-pointer shadow-sm text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Configuración del Censo</span>
            </button>
          </form>

          {currentMaxElectors && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Valor configurado actual:</span>
              <strong className="text-slate-900 font-bold font-mono">
                {currentMaxElectors.toLocaleString('es-CO')} electores
              </strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
