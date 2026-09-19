export interface Candidate {
  id: string;
  number: string;
  name: string;
  party: string;
  slogan: string;
  badgeColor: string;
}

export interface Voter {
  documentId: string;
  age: number;
  votedAt: string;
}

export interface VoteRecord {
  id: string;
  voterDocument: string;
  candidateId: string;
  timestamp: string;
}

export const CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    number: '01',
    name: 'Carlos Alberto Gómez',
    party: 'Movimiento Progreso Municipal',
    slogan: 'Transparencia y obras para el desarrollo local',
    badgeColor: 'border-blue-600 bg-blue-50 text-blue-800'
  },
  {
    id: 'c2',
    number: '02',
    name: 'María Fernanda Restrepo',
    party: 'Coalición Transformación Ciudadana',
    slogan: 'Educación, salud digna y bienestar comunitario',
    badgeColor: 'border-emerald-600 bg-emerald-50 text-emerald-800'
  },
  {
    id: 'c3',
    number: '03',
    name: 'Andrés Felipe Morales',
    party: 'Alianza por el Futuro',
    slogan: 'Seguridad, empleo joven e innovación sostenible',
    badgeColor: 'border-amber-600 bg-amber-50 text-amber-800'
  }
];

export interface CandidateResult {
  candidate: Candidate;
  votes: number;
  percentage: number;
}

export interface ElectionResultsSummary {
  totalVotes: number;
  maxElectors: number | null;
  participationRate: number | null;
  candidatesResults: CandidateResult[];
  status: 'no_votes' | 'winner' | 'tie';
  winner: Candidate | null;
  tiedCandidates: Candidate[];
  voteDifference: number | null;
  runnerUp: Candidate | null;
}

