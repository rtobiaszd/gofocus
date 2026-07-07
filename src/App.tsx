/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Municipio, Usuario, Indicador, ResultadoIndicador, Alerta, Missao } from './types';
import { 
  mockMunicipios, 
  mockUsuarios, 
  mockIndicadores, 
  mockResultados, 
  mockAlertas, 
  mockMissoes 
} from './mockData';

// Modular Component Views
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import MunicipiosView from './components/MunicipiosView';
import UsuariosView from './components/UsuariosView';
import IndicadoresView from './components/IndicadoresView';
import ResultadosView from './components/ResultadosView';
import AlertasView from './components/AlertasView';
import MissoesView from './components/MissoesView';
import ArchitectureView from './components/ArchitectureView';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<Usuario | null>(mockUsuarios[0]); // Default to logged in as Dr. Roberto for demonstration, but allow logout to test login screen!
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Reactive States mimicking persistent tables
  const [municipios, setMunicipios] = useState<Municipio[]>(mockMunicipios);
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [indicadores, setIndicadores] = useState<Indicador[]>(mockIndicadores);
  const [resultados, setResultados] = useState<ResultadoIndicador[]>(mockResultados);
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
  const [missoes, setMissoes] = useState<Missao[]>(mockMissoes);

  // Auth Handlers
  const handleLoginSuccess = (authenticatedUser: Usuario) => {
    setUser(authenticatedUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  // State mutators mimicking DB operations
  const handleAddMunicipio = (newMun: Omit<Municipio, 'id'>) => {
    const id = `m-${Date.now()}`;
    const created: Municipio = { id, ...newMun };
    setMunicipios([created, ...municipios]);

    // Automatically trigger alert and result mocks for new municipality to make the demo incredibly rich
    const newResult1: ResultadoIndicador = {
      id: `r-${Date.now()}-1`,
      indicadorId: 'ind-1',
      indicadorNome: 'IDEB',
      indicadorSigla: 'IDEB',
      municipioId: id,
      municipioNome: newMun.nome,
      meta: 6.5,
      realizado: parseFloat((5.5 + Math.random() * 1.5).toFixed(1)),
      mes: '2025/Anual',
      unidade: 'taxa'
    };
    
    const newResult2: ResultadoIndicador = {
      id: `r-${Date.now()}-2`,
      indicadorId: 'ind-2',
      indicadorNome: 'Cobertura de Saúde',
      indicadorSigla: 'COB_SAUDE',
      municipioId: id,
      municipioNome: newMun.nome,
      meta: 95.0,
      realizado: Math.round(80 + Math.random() * 18),
      mes: 'Maio/2026',
      unidade: 'porcentagem'
    };

    setResultados([...resultados, newResult1, newResult2]);
  };

  const handleRemoveMunicipio = (id: string) => {
    setMunicipios(municipios.filter(m => m.id !== id));
  };

  const handleEditMunicipio = (id: string, updatedFields: Partial<Municipio>) => {
    setMunicipios(municipios.map(m => m.id === id ? { ...m, ...updatedFields } : m));
  };

  const handleAddUsuario = (newUser: Omit<Usuario, 'id'>) => {
    const id = `u-${Date.now()}`;
    setUsuarios([...usuarios, { id, ...newUser }]);
  };

  const handleEditUsuario = (id: string, updatedFields: Partial<Usuario>) => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, ...updatedFields } : u));
  };

  const handleToggleUsuarioStatus = (id: string) => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u));
  };

  const handleRemoveUsuario = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
  };

  const handleAddIndicador = (newInd: Omit<Indicador, 'id'>) => {
    const id = `ind-${Date.now()}`;
    setIndicadores([...indicadores, { id, ...newInd }]);
  };

  const handleMarkAlertaLido = (id: string) => {
    setAlertas(alertas.map(a => a.id === id ? { ...a, lido: true } : a));
  };

  const handleMarkAllLido = () => {
    setAlertas(alertas.map(a => ({ ...a, lido: true })));
  };

  const handleClearAllAlertas = () => {
    setAlertas([]);
  };

  const handleAddMissao = (newMissao: Omit<Missao, 'id'>) => {
    const id = `task-${Date.now()}`;
    setMissoes([...missoes, { id, ...newMissao }]);
  };

  const handleUpdateMissaoStatus = (id: string, newStatus: string) => {
    setMissoes(missoes.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  const handleEditMissao = (id: string, updatedFields: Partial<Missao>) => {
    setMissoes(missoes.map(m => m.id === id ? { ...m, ...updatedFields } : m));
  };

  const handleRemoveMissao = (id: string) => {
    setMissoes(missoes.filter(m => m.id !== id));
  };

  // Switcher to get clean visual title
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Centro de Decisão';
      case 'municipios': return 'Municípios Clientes';
      case 'usuarios': return 'Controle de Usuários';
      case 'indicadores': return 'Indicadores Globais';
      case 'resultados': return 'Resultados & Metas';
      case 'alertas': return 'Alerta de Metas';
      case 'missoes': return 'Plano de Missões';
      case 'arquitetura': return 'Arquitetura Next.js';
      default: return 'Visão Geral';
    }
  };

  // Rendering logic
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      
      {/* Lateral Menu / Sidebar */}
      <Sidebar 
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setMobileMenuOpen(false); // Close mobile tray on click
        }}
        user={user}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden"
        ></div>
      )}

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={getViewTitle()} 
          user={user}
          onLogout={handleLogout}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          alertas={alertas}
          onMarkAlertaLido={handleMarkAlertaLido}
          onGoToView={(view) => setCurrentView(view)}
        />

        {/* Dynamic Inner Panel View based on State Selection */}
        <main className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {currentView === 'dashboard' && (
            <DashboardView 
              municipios={municipios}
              usuarios={usuarios}
              indicadores={indicadores}
              alertas={alertas}
              missoes={missoes}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'municipios' && (
            <MunicipiosView 
              municipios={municipios}
              onAddMunicipio={handleAddMunicipio}
              onRemoveMunicipio={handleRemoveMunicipio}
              onEditMunicipio={handleEditMunicipio}
            />
          )}

          {currentView === 'usuarios' && (
            <UsuariosView 
              usuarios={usuarios}
              onAddUsuario={handleAddUsuario}
              onToggleUsuarioStatus={handleToggleUsuarioStatus}
              onRemoveUsuario={handleRemoveUsuario}
              onEditUsuario={handleEditUsuario}
            />
          )}

          {currentView === 'indicadores' && (
            <IndicadoresView 
              indicadores={indicadores}
              onAddIndicador={handleAddIndicador}
            />
          )}

          {currentView === 'resultados' && (
            <ResultadosView 
              municipios={municipios}
              resultados={resultados}
            />
          )}

          {currentView === 'alertas' && (
            <AlertasView 
              alertas={alertas}
              onMarkAlertaLido={handleMarkAlertaLido}
              onMarkAllLido={handleMarkAllLido}
              onClearAllAlertas={handleClearAllAlertas}
            />
          )}

          {currentView === 'missoes' && (
            <MissoesView 
              missoes={missoes}
              municipios={municipios}
              usuarios={usuarios}
              onAddMissao={handleAddMissao}
              onUpdateMissaoStatus={handleUpdateMissaoStatus}
              onRemoveMissao={handleRemoveMissao}
              onEditMissao={handleEditMissao}
            />
          )}

          {currentView === 'arquitetura' && (
            <ArchitectureView user={user} />
          )}
        </main>
      </div>

    </div>
  );
}
