/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, MapPin, Building, Trash2, Edit, Check, AlertCircle, X, Users } from 'lucide-react';
import { Municipio } from '../types';

interface MunicipiosViewProps {
  municipios: Municipio[];
  onAddMunicipio: (municipio: Omit<Municipio, 'id'>) => void;
  onRemoveMunicipio: (id: string) => void;
}

export default function MunicipiosView({
  municipios,
  onAddMunicipio,
  onRemoveMunicipio
}: MunicipiosViewProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [showAddForm, setShowAddForm] = useState(false);

  // New city form states
  const [nome, setNome] = useState('');
  const [estado, setEstado] = useState('SP');
  const [populacao, setPopulacao] = useState('');
  const [prefeito, setPrefeito] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Pendente' | 'Inativo'>('Ativo');
  const [error, setError] = useState('');

  const filteredMunicipios = municipios.filter(m => {
    const matchesSearch = m.nome.toLowerCase().includes(search.toLowerCase()) || 
                          m.prefeito.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !prefeito.trim() || !populacao.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const popNum = parseInt(populacao);
    if (isNaN(popNum) || popNum <= 0) {
      setError('A população deve ser um número positivo.');
      return;
    }

    onAddMunicipio({
      nome: nome.trim(),
      estado,
      populacao: popNum,
      status,
      prefeito: prefeito.trim(),
      dataAtivacao: new Date().toISOString().split('T')[0]
    });

    // Reset Form
    setNome('');
    setPrefeito('');
    setPopulacao('');
    setStatus('Ativo');
    setError('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por município ou prefeito..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 font-medium"
          >
            <option value="todos">Todos os Status</option>
            <option value="Ativo">Status: Ativo</option>
            <option value="Pendente">Status: Pendente</option>
            <option value="Inativo">Status: Inativo</option>
          </select>

          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-900/10 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Novo Município</span>
          </button>
        </div>
      </div>

      {/* Add Municipality Drawer / Modal Mock */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Adicionar Município Cliente</h3>
              </div>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                }}
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

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Município *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Rio Claro"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado *</label>
                  <select 
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  >
                    {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'CE', 'PE', 'BA', 'GO', 'TO', 'MS'].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Prefeito(a) *</label>
                <input 
                  type="text" 
                  placeholder="Nome do governante atual"
                  value={prefeito}
                  onChange={(e) => setPrefeito(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">População Estimada *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 45000"
                    value={populacao}
                    onChange={(e) => setPopulacao(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status Operacional</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-150 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-950/10 transition-all"
                >
                  Salvar Município
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Municipalities cards (Responsive layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMunicipios.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400">
            <Building className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Nenhum município correspondente encontrado.</p>
            <p className="text-xs mt-1">Experimente alterar a sua busca ou adicionar um novo convênio.</p>
          </div>
        ) : (
          filteredMunicipios.map((m) => (
            <div 
              key={m.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors">
                        {m.nome}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">Estado de {m.estado}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    m.status === 'Ativo' 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                      : m.status === 'Pendente' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-100/80 pt-4 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prefeito atual</span>
                    <span className="font-bold text-slate-700">{m.prefeito}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">População</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="h-3 w-3 text-slate-400" />
                      {m.populacao.toLocaleString('pt-BR')} hab
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ativação</span>
                    <span className="font-mono text-slate-500">{m.dataAtivacao}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 border-t border-slate-100 pt-4 justify-end">
                <button 
                  onClick={() => onRemoveMunicipio(m.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Excluir Convênio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
