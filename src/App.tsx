/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Upload, User } from 'lucide-react';
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
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

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

    // Listen to custom database connected event to re-sync state immediately
    window.addEventListener('gofocus_db_connected', initAndLoad);
    return () => {
      window.removeEventListener('gofocus_db_connected', initAndLoad);
    };
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
    
    // If the edited user is the current logged in user, keep session in sync
    if (user && id === user.id) {
      setUser(updated);
      localStorage.setItem('gofocus_logged_user', JSON.stringify(updated));
    }
  };

  const handleUpdateOwnProfile = async (updatedFields: { nome: string; avatar: string }) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('gofocus_logged_user', JSON.stringify(updatedUser));
    
    // update list
    setUsuarios(usuarios.map(u => u.id === user.id ? updatedUser : u));
    await RealDatabaseService.saveUsuario(updatedUser);
    setShowProfileModal(false);
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

  const handleEditIndicador = async (id: string, updatedFields: Partial<Indicador>) => {
    const existing = indicadores.find(i => i.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updatedFields };
    setIndicadores(indicadores.map(i => i.id === id ? updated : i));
    await RealDatabaseService.saveIndicador(updated);
  };

  const handleRemoveIndicador = async (id: string) => {
    setIndicadores(indicadores.filter(i => i.id !== id));
    await RealDatabaseService.removeIndicador(id);
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
          onEditPerfil={() => setShowProfileModal(true)}
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
              onEditIndicador={handleEditIndicador}
              onRemoveIndicador={handleRemoveIndicador}
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
              municipios={municipios}
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

      {/* Global Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
          onSave={handleUpdateOwnProfile} 
        />
      )}

    </div>
  );
}

interface ProfileModalProps {
  user: Usuario;
  onClose: () => void;
  onSave: (fields: { nome: string; avatar: string }) => void;
}

function ProfileModal({ user, onClose, onSave }: ProfileModalProps) {
  const [nome, setNome] = useState(user.nome);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nome.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    onSave({ nome: nome.trim(), avatar: avatar.trim() });
    setSuccess('Perfil do usuário atualizado com sucesso!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <h3 className="font-bold text-slate-800">Painel de Configurações</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tab Header */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 shrink-0">
          <User className="h-4 w-4 text-indigo-600" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Meu Perfil</span>
        </div>

        {/* Modal Body / Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs font-semibold animate-in fade-in duration-150">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail de Trabalho</label>
                <input 
                  type="email" 
                  value={user.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">O e-mail é gerido pelo provedor de identidade do Supabase.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo / Nível de Acesso</label>
                <input 
                  type="text" 
                  value={user.cargo}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-not-allowed capitalize font-bold"
                />
              </div>

              {/* Profile Image Drag-and-Drop and Manual Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Foto de Perfil (Avatar)</label>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer group overflow-hidden ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50/50' 
                      : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {avatar ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <img 
                          src={avatar} 
                          alt="Profile avatar" 
                          className="h-16 w-16 rounded-full object-cover border border-slate-200 shadow-sm"
                          onError={(e)=>{(e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-md group-hover:scale-110 transition-transform">
                          <Upload className="h-3 w-3" />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 group-hover:text-indigo-600 transition-colors font-medium text-center">
                        Arraste uma imagem ou clique para substituir
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="p-3 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors border border-slate-100">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-700">Fazer Upload de Foto</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Arraste e solte ou clique para selecionar</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* URL or Random generation section */}
                <div className="pt-1">
                  <button 
                    type="button" 
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showUrlInput ? 'Esconder link / gerador' : 'Ou colar link da imagem / gerar aleatório'}</span>
                  </button>
                  
                  {showUrlInput && (
                    <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder="Ex: https://images.unsplash.com/..."
                          value={avatar.startsWith('data:') ? '' : avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-mono text-xs"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const id = 1500000000000 + Math.floor(Math.random() * 1000000);
                            setAvatar(`https://images.unsplash.com/photo-${id}?w=150&auto=format&fit=crop&q=80`);
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Gerar Aleatório
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer (Unified Save) */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-150 transition-all cursor-pointer"
            >
              Fechar
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-950/10 transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
