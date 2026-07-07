/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Sliders, Settings, CheckSquare, Target, AlertTriangle, X, Check, Award } from 'lucide-react';
import { Indicador } from '../types';

interface IndicadoresViewProps {
  indicadores: Indicador[];
  onAddIndicador: (indicador: Omit<Indicador, 'id'>) => void;
}

export default function IndicadoresView({
  indicadores,
  onAddIndicador
}: IndicadoresViewProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Indicator Form State
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [categoria, setCategoria] = useState<'Educação' | 'Saúde' | 'Segurança' | 'Finanças' | 'Saneamento'>('Educação');
  const [descricao, setDescricao] = useState('');
  const [meta, setMeta] = useState('');
  const [valorAtual, setValorAtual] = useState('');
  const [unidade, setUnidade] = useState<'porcentagem' | 'financeiro' | 'taxa' | 'quantidade'>('porcentagem');
  const [error, setError] = useState('');

  const filteredIndicadores = indicadores.filter(ind => {
    const matchesSearch = ind.nome.toLowerCase().includes(search.toLowerCase()) || 
                          ind.sigla.toLowerCase().includes(search.toLowerCase()) ||
                          ind.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'todos' || ind.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !sigla.trim() || !descricao.trim() || !meta.trim() || !valorAtual.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const metaVal = parseFloat(meta);
    const atualVal = parseFloat(valorAtual);

    if (isNaN(metaVal) || isNaN(atualVal)) {
      setError('A meta e o valor atual devem ser numéricos.');
      return;
    }

    onAddIndicador({
      nome: nome.trim(),
      sigla: sigla.trim().toUpperCase(),
      categoria,
      descricao: descricao.trim(),
      meta: metaVal,
      valorAtual: atualVal,
      unidade
    });

    setNome('');
    setSigla('');
    setDescricao('');
    setMeta('');
    setValorAtual('');
    setCategoria('Educação');
    setUnidade('porcentagem');
    setError('');
    setShowAddForm(false);
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Educação': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Saúde': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Finanças': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Segurança': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Saneamento': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const formatValue = (val: number, uni: string) => {
    switch(uni) {
      case 'porcentagem': return `${val}%`;
      case 'financeiro': return `R$ ${val.toLocaleString('pt-BR')}`;
      default: return val.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, sigla ou descrição..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 font-medium"
          >
            <option value="todos">Todas as Áreas</option>
            <option value="Educação">Área: Educação</option>
            <option value="Saúde">Área: Saúde</option>
            <option value="Finanças">Área: Finanças</option>
            <option value="Segurança">Área: Segurança</option>
            <option value="Saneamento">Área: Saneamento</option>
          </select>

          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-900/10 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Novo Indicador</span>
          </button>
        </div>
      </div>

      {/* Add Indicator Dialog Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Cadastrar Novo Indicador</h3>
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
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Indicador *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Cobertura Vacinal Geral"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sigla *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: COB_VAC"
                    value={sigla}
                    onChange={(e) => setSigla(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria (Área)</label>
                  <select 
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  >
                    <option value="Educação">Educação</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Finanças">Finanças</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Saneamento">Saneamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unidade de Medida</label>
                  <select 
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  >
                    <option value="porcentagem">Porcentagem (%)</option>
                    <option value="taxa">Taxa / Índice (Ponto decimal)</option>
                    <option value="quantidade">Quantidade Absoluta</option>
                    <option value="financeiro">Monetário (R$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição Técnica / Fórmula *</label>
                <textarea 
                  placeholder="Explique como esse indicador é calculated..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 h-20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Meta Nacional/Local *</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="Ex: 95"
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Valor Atual Médio *</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="Ex: 85"
                    value={valorAtual}
                    onChange={(e) => setValorAtual(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    required
                  />
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
                  Criar Indicador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of registered indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIndicadores.map((ind) => {
          const percentOfMeta = Math.min(Math.round((ind.valorAtual / ind.meta) * 100), 100);
          
          return (
            <div 
              key={ind.id} 
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black bg-slate-900 text-slate-100 px-2 py-0.5 rounded tracking-wider">
                      {ind.sigla}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryColor(ind.categoria)}`}>
                      {ind.categoria}
                    </span>
                  </div>
                  
                  <span className="text-slate-400">
                    <Award className="h-4 w-4" />
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 text-base mb-1.5">{ind.nome}</h4>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{ind.descricao}</p>
              </div>

              {/* Targets Progress Panel */}
              <div className="border-t border-slate-100/80 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider mb-0.5">Meta Ideal</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-indigo-500" />
                      {formatValue(ind.meta, ind.unidade)}
                    </span>
                  </div>
                  <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider mb-0.5">Média Atual</span>
                    <span className={`font-bold flex items-center gap-1 ${ind.valorAtual >= ind.meta ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <Settings className="h-3.5 w-3.5" />
                      {formatValue(ind.valorAtual, ind.unidade)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>Atingimento da Meta</span>
                    <span>{percentOfMeta}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentOfMeta >= 100 
                          ? 'bg-emerald-500' 
                          : percentOfMeta >= 85 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${percentOfMeta}%` }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          );
        })}

        {filteredIndicadores.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400">
            <Sliders className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Nenhum indicador cadastrado nesta categoria.</p>
            <p className="text-xs mt-1">Crie um indicador global clicando no botão "Novo Indicador".</p>
          </div>
        )}
      </div>
    </div>
  );
}
