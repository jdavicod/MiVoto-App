import { VoteRecord, Voter, CANDIDATES, ElectionResultsSummary, CandidateResult } from '../types';

const VOTES_STORAGE_KEY = 'conteo_electoral_votes';
const VOTERS_STORAGE_KEY = 'conteo_electoral_voters';
const MAX_ELECTORS_KEY = 'conteo_electoral_max_electors';

export function getStoredVotes(): VoteRecord[] {
  try {
    const data = localStorage.getItem(VOTES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredVotes(votes: VoteRecord[]): void {
  try {
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  } catch (error) {
    console.error('Error saving votes to localStorage', error);
  }
}

export function getStoredVoters(): Voter[] {
  try {
    const data = localStorage.getItem(VOTERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredVoters(voters: Voter[]): void {
  try {
    localStorage.setItem(VOTERS_STORAGE_KEY, JSON.stringify(voters));
  } catch (error) {
    console.error('Error saving voters to localStorage', error);
  }
}

export function getMaxElectors(): number | null {
  try {
    const data = localStorage.getItem(MAX_ELECTORS_KEY);
    if (!data) return null;
    const parsed = parseInt(data, 10);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  } catch {
    return null;
  }
}

export function saveMaxElectors(count: number | null): void {
  try {
    if (count === null || count <= 0) {
      localStorage.removeItem(MAX_ELECTORS_KEY);
    } else {
      localStorage.setItem(MAX_ELECTORS_KEY, count.toString());
    }
  } catch (error) {
    console.error('Error saving max electors', error);
  }
}

export function hasVoterAlreadyVoted(documentId: string): boolean {
  const voters = getStoredVoters();
  const trimmed = documentId.trim();
  return voters.some(v => v.documentId.toLowerCase() === trimmed.toLowerCase());
}

export function registerVoteInStorage(voterDocument: string, age: number, candidateId: string): VoteRecord {
  const newVote: VoteRecord = {
    id: 'VOTO-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    voterDocument: voterDocument.trim(),
    candidateId,
    timestamp: new Date().toISOString()
  };

  const newVoter: Voter = {
    documentId: voterDocument.trim(),
    age,
    votedAt: new Date().toISOString()
  };

  const votes = getStoredVotes();
  votes.push(newVote);
  saveStoredVotes(votes);

  const voters = getStoredVoters();
  voters.push(newVoter);
  saveStoredVoters(voters);

  return newVote;
}

export function deleteVoteFromStorage(voteId: string): boolean {
  const votes = getStoredVotes();
  const index = votes.findIndex(v => v.id === voteId);
  if (index === -1) return false;

  const targetVote = votes[index];
  votes.splice(index, 1);
  saveStoredVotes(votes);

  // También se actualiza el registro de electores para mantener consistencia
  const voters = getStoredVoters();
  const voterIndex = voters.findIndex(
    v => v.documentId.toLowerCase() === targetVote.voterDocument.toLowerCase()
  );
  if (voterIndex !== -1) {
    voters.splice(voterIndex, 1);
    saveStoredVoters(voters);
  }

  return true;
}

export function calculateElectionResults(): ElectionResultsSummary {
  const votes = getStoredVotes();
  const maxElectors = getMaxElectors();
  const totalVotes = votes.length;

  // Conteo individual de votos por candidato
  const counts: Record<string, number> = {};
  CANDIDATES.forEach(c => {
    counts[c.id] = 0;
  });

  votes.forEach(v => {
    if (counts[v.candidateId] !== undefined) {
      counts[v.candidateId]++;
    }
  });

  const candidatesResults: CandidateResult[] = CANDIDATES.map(candidate => {
    const candVotes = counts[candidate.id] || 0;
    const percentage = totalVotes > 0 ? (candVotes / totalVotes) * 100 : 0;
    return {
      candidate,
      votes: candVotes,
      percentage: Number(percentage.toFixed(1))
    };
  });

  // Ordenar de mayor a menor votos
  const sorted = [...candidatesResults].sort((a, b) => b.votes - a.votes);

  let status: 'no_votes' | 'winner' | 'tie' = 'no_votes';
  let winner = null;
  let tiedCandidates: typeof CANDIDATES = [];
  let voteDifference: number | null = null;
  let runnerUp = null;

  if (totalVotes === 0) {
    status = 'no_votes';
  } else {
    const highestVotes = sorted[0].votes;
    const topCandidates = sorted.filter(c => c.votes === highestVotes);

    if (topCandidates.length > 1) {
      status = 'tie';
      tiedCandidates = topCandidates.map(c => c.candidate);
      voteDifference = 0; // Criterio HU-10: en empate muestra "0" o mensaje de empate
    } else {
      status = 'winner';
      winner = sorted[0].candidate;
      runnerUp = sorted[1]?.candidate || null;
      const secondPlaceVotes = sorted[1]?.votes || 0;
      voteDifference = sorted[0].votes - secondPlaceVotes; // Criterio HU-10: diferencia respecto al 2do lugar
    }
  }

  const participationRate =
    maxElectors && maxElectors > 0
      ? Number(((totalVotes / maxElectors) * 100).toFixed(1))
      : null;

  return {
    totalVotes,
    maxElectors,
    participationRate,
    candidatesResults,
    status,
    winner,
    tiedCandidates,
    voteDifference,
    runnerUp
  };
}

