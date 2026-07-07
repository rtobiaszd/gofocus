/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Municipio, Usuario, Indicador, ResultadoIndicador, Alerta, Missao } from './types';
import { RealDatabaseService } from './lib/supabaseClient';

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
  const [user, setUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('gofocus_logged_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Reactive States
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [resultados, setResultados] = useState<ResultadoIndicador[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real data on mount or user change
  useEffect(() => {
    const initAndLoad = async () => {
      setIsLoading(true);
      await RealDatabaseService.checkAndRunInitialMigrations();
      
      try {
        const [muns, users, inds, res, alts, tasks] = await Promise.all([
          RealDatabaseService.getMunicipios(),
          RealDatabaseService.getUsuarios(),
          RealDatabaseService.getIndicadores(),
          RealDatabaseService.getResultados(),
          RealDatabaseService.getAlertas(),
          RealDatabaseService.getMissoes()
        ]);
        setMunicipios(muns);
        setUsuarios(users);
        setIndicadores(inds);
        setResultados(res);
        setAlertas(alts);
        setMissoes(tasks);
      } catch (err) {
        console.error("Failed to load real database records:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAndLoad();
  }, [user]);

  // Auth Handlers
  const handleLoginSuccess = (authenticatedUser: Usuario) => {
    localStorage.setItem('gofocus_logged_user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('gofocus_logged_user');
    setUser(null);
  };

  // State mutators with DB synchronization
  const handleAddMunicipio = async (newMun: Omit<Municipio, 'id'>) => {
    const id = `m-${Date.now()}`;
    const created: Municipio = { id, ...newMun };
    setMunicipios([created, ...municipios]);
    await RealDatabaseService.saveMunicipio(created);

    // Automatically trigger alert and result mocks for new municipality to make the database incredibly rich
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
    await RealDatabaseService.saveResultado(newResult1);
    await RealDatabaseService.saveResultado(newResult2);
  };

  const handleRemoveMunicipio = async (id: string) => {
    setMunicipios(municipios.filter(m => m.id !== id));
    await RealDatabaseService.removeMunicipio(id);
  };

  const handleEditMunicipio = async (id: string, updatedFields: Partial<Municipio>) => {
    const existing = municipios.find(m => m.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updatedFields };
    setMunicipios(municipios.map(m => m.id === id ? updated : m));
    await RealDatabaseService.saveMunicipio(updated);
  };

  const handleAddUsuario = async (newUser: Omit<Usuario, 'id'>) => {
    const id = `u-${Date.now()}`;
    const created = { id, ...newUser };
    setUsuarios([...usuarios, created]);
    await RealDatabaseService.saveUsuario(created);
  };

  const handleEditUsuario = async (id: string, updatedFields: Partial<Usuario>) => {
    const existing = usuarios.find(u => u.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updatedFields };
    setUsuarios(usuarios.map(u => u.id === id ? updated : u));
    await RealDatabaseService.saveUsuario(updated);
  };

  const handleToggleUsuarioStatus = async (id: string) => {
    const existing = usuarios.find(u => u.id === id);
    if (!existing) return;
    const updated = { ...existing, status: (existing.status === 'Ativo' ? 'Inativo' : 'Ativo') as any };
    setUsuarios(usuarios.map(u => u.id === id ? updated : u));
    await RealDatabaseService.saveUsuario(updated);
  };

  const handleRemoveUsuario = async (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
    await RealDatabaseService.removeUsuario(id);
  };

  const handleAddIndicador = async (newInd: Omit<Indicador, 'id'>) => {
    const id = `ind-${Date.now()}`;
    const created = { id, ...newInd };
    setIndicadores([...indicadores, created]);
    await RealDatabaseService.saveIndicador(created);
  };

  const handleMarkAlertaLido = async (id: string) => {
    const existing = alertas.find(a => a.id === id);
    if (!existing) return;
    const updated = { ...existing, lido: true };
    setAlertas(alertas.map(a => a.id === id ? updated : a));
    await RealDatabaseService.saveAlerta(updated);
  };

  const handleMarkAllLido = async () => {
    const updated = alertas.map(a => ({ ...a, lido: true }));
    setAlertas(updated);
    for (const a of updated) {
      await RealDatabaseService.saveAlerta(a);
    }
  };

  const handleClearAllAlertas = async () => {
    setAlertas([]);
    await RealDatabaseService.clearAllAlertas();
  };

  const handleAddMissao = async (newMissao: Omit<Missao, 'id'>) => {
    const id = `task-${Date.now()}`;
    const created = { id, ...newMissao };
    setMissoes([...missoes, created]);
    await RealDatabaseService.saveMissao(created);
  };

  const handleUpdateMissaoStatus = async (id: string, newStatus: string) => {
    const existing = missoes.find(m => m.id === id);
    if (!existing) return;
    const updated = { ...existing, status: newStatus as any };
    setMissoes(missoes.map(m => m.id === id ? updated : m));
    await RealDatabaseService.saveMissao(updated);
  };

  const handleEditMissao = async (id: string, updatedFields: Partial<Missao>) => {
    const existing = missoes.find(m => m.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updatedFields };
    setMissoes(missoes.map(m => m.id === id ? updated : m));
    await RealDatabaseService.saveMissao(updated);
  };

  const handleRemoveMissao = async (id: string) => {
    setMissoes(missoes.filter(m => m.id !== id));
    await RealDatabaseService.removeMissao(id);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 font-sans">Sincronizando com o banco de dados do Supabase...</p>
      </div>
    );
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
