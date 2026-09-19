import React, { useState } from 'react';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { MainActivityView } from './components/MainActivityView';
import { VotacionActivityView } from './components/VotacionActivityView';
import { AdminActivityView } from './components/AdminActivityView';
import { registerVoteInStorage } from './utils/storage';

export default function App() {
  // Pila de navegación de Android Activities
  const [currentActivity, setCurrentActivity] = useState<'MainActivity' | 'VotacionActivity' | 'AdminActivity'>('MainActivity');
  
  // Intent Extras pasados a VotacionActivity
  const [voterDoc, setVoterDoc] = useState<string>('');
  const [voterAge, setVoterAge] = useState<number>(0);

  // Intent explícito: MainActivity -> VotacionActivity
  const handleStartVotacionActivity = (documento: string, edad: number) => {
    setVoterDoc(documento);
    setVoterAge(edad);
    setCurrentActivity('VotacionActivity');
  };

  // Intent explícito: MainActivity -> AdminActivity
  const handleStartAdminActivity = () => {
    setCurrentActivity('AdminActivity');
  };

  // Android finish() o botón Atrás
  const handleFinishCurrentActivity = () => {
    setCurrentActivity('MainActivity');
  };

  // Registro de Voto (SQLite en VotacionActivity)
  const handleVoteRegistered = (candidateId: string) => {
    registerVoteInStorage(voterDoc, voterAge, candidateId);
  };

  // Título dinámico para el ActionBar según el Activity activo
  const getActivityTitle = () => {
    switch (currentActivity) {
      case 'MainActivity':
        return 'Conteo Electoral';
      case 'VotacionActivity':
        return 'Tarjetón Electoral';
      case 'AdminActivity':
        return 'Módulo Administrador';
      default:
        return 'Conteo Electoral';
    }
  };

  return (
    <AndroidDeviceFrame
      title={getActivityTitle()}
      showBackButton={currentActivity !== 'MainActivity'}
      onBackPress={handleFinishCurrentActivity}
      onHomePress={() => setCurrentActivity('MainActivity')}
    >
      {currentActivity === 'MainActivity' && (
        <MainActivityView
          onStartVotacionActivity={handleStartVotacionActivity}
          onStartAdminActivity={handleStartAdminActivity}
        />
      )}

      {currentActivity === 'VotacionActivity' && (
        <VotacionActivityView
          documento={voterDoc}
          edad={voterAge}
          onVoteRegistered={handleVoteRegistered}
          onFinishActivity={handleFinishCurrentActivity}
        />
      )}

      {currentActivity === 'AdminActivity' && (
        <AdminActivityView
          onFinishActivity={handleFinishCurrentActivity}
          onDataChanged={() => {}}
        />
      )}
    </AndroidDeviceFrame>
  );
}
