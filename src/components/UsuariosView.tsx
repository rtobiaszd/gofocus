/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, UserCheck, Shield, Mail, ToggleLeft, ToggleRight, Trash2, X, AlertCircle, Pencil, Upload } from 'lucide-react';
import { Usuario } from '../types';

interface UsuariosViewProps {
  usuarios: Usuario[];
  onAddUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  onToggleUsuarioStatus: (id: string) => void;
  onRemoveUsuario: (id: string) => void;
  onEditUsuario: (id: string, updatedFields: Partial<Usuario>) => void;
}

export default function UsuariosView({
  usuarios,
  onAddUsuario,
  onToggleUsuarioStatus,
  onRemoveUsuario,
  onEditUsuario
}: UsuariosViewProps) {
  const [search, setSearch] = useState('');
  const [filterCargo, setFilterCargo] = useState<string>('todos');
  const [showAddForm, setShowAddForm] = useState(false);

  // New user form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState<'Admin' | 'Gestor' | 'Agente'>('Agente');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleStartEdit = (user: Usuario) => {
    setEditingUsuario(user);
    setNome(user.nome);
    setEmail(user.email);
    setCargo(user.cargo);
    setAvatar(user.avatar || '');
    setShowAddForm(true);
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setEditingUsuario(null);
    setNome('');
    setEmail('');
    setCargo('Agente');
    setAvatar('');
    setError('');
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nome.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesCargo = filterCargo === 'todos' || u.cargo === filterCargo;
    return matchesSearch && matchesCargo;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!email.includes('@')) {
      setError('E-mail inválido.');
      return;
    }

    const finalAvatar = avatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

    if (editingUsuario) {
      onEditUsuario(editingUsuario.id, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cargo,
        avatar: finalAvatar
      });
    } else {
      onAddUsuario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cargo,
        status: 'Ativo',
        avatar: finalAvatar
      });
    }

    handleCloseModal();
  };  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          <select 
            value={filterCargo}
            onChange={(e) => setFilterCargo(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 font-medium"
          >
            <option value="todos">Todos os Cargos</option>
            <option value="Admin">Cargo: Administrador</option>
            <option value="Gestor">Cargo: Gestor</option>
            <option value="Agente">Cargo: Agente Técnico</option>
          </select>

          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-900/10 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Convidar Usuário</span>
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">{editingUsuario ? 'Editar Integrante' : 'Convidar Integrante'}</h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  placeholder="Nome do colaborador"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail Institucional *</label>
                <input 
                  type="email" 
                  placeholder="Ex: nome@gestao.gov.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo / Nível de Acesso</label>
                <select 
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                >
                  <option value="Agente">Agente Técnico (Apenas consulta e preenchimento)</option>
                  <option value="Gestor">Gestor Municipal (Cadastros, Missões e Alertas)</option>
                  <option value="Admin">Administrador Global (Acesso completo e Auditoria)</option>
                </select>
              </div>

              {/* Profile Image Drag-and-Drop and Manual Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Imagem de Perfil (Avatar)</label>
                
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

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-150 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-950/10 transition-all"
                >
                  {editingUsuario ? 'Salvar Alterações' : 'Enviar Convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Usuário</th>
                <th className="py-4 px-6">E-mail</th>
                <th className="py-4 px-6">Nível de Acesso (Cargo)</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsuarios.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'} 
                        alt={user.nome} 
                        className="h-10 w-10 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{user.nome}</span>
                        <span className="text-slate-400 text-xs font-medium">Cadastrado</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.cargo === 'Admin' 
                        ? 'bg-purple-50 text-purple-700' 
                        : user.cargo === 'Gestor' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      <UserCheck className="h-3.5 w-3.5" />
                      {user.cargo}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => onToggleUsuarioStatus(user.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        user.status === 'Ativo' 
                          ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                      title="Clique para alternar o status"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-indigo-500' : 'bg-rose-500'}`}></span>
                      {user.status}
                    </button>
                  </td>
                   <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleStartEdit(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Editar Integrante"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button 
                        onClick={() => onToggleUsuarioStatus(user.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title={user.status === 'Ativo' ? 'Desativar Usuário' : 'Ativar Usuário'}
                      >
                        {user.status === 'Ativo' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                      </button>
                      
                      <button 
                        onClick={() => onRemoveUsuario(user.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Remover Acesso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Nenhum colaborador encontrado.</p>
            <p className="text-xs mt-1">Verifique o filtro de cargo ou faça um novo convite de acesso.</p>
          </div>
        )}
      </div>
    </div>
  );
}
