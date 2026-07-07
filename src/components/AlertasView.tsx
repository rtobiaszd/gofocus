/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alerta } from '../types';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Check, Trash2, Eye, EyeOff } from 'lucide-react';

interface AlertasViewProps {
  alertas: Alerta[];
  onMarkAlertaLido: (id: string) => void;
  onMarkAllLido: () => void;
  onClearAllAlertas: () => void;
}

export default function AlertasView({
  alertas,
  onMarkAlertaLido,
  onMarkAllLido,
  onClearAllAlertas
}: AlertasViewProps) {
  const [filterType, setFilterType] = useState<'todos' | 'nao-lidos' | 'lidos'>('todos');
  const [filterCriticidade, setFilterCriticidade] = useState<string>('todos');

  const filteredAlertas = alertas.filter(a => {
    const matchesRead = filterType === 'todos' || 
                        (filterType === 'nao-lidos' && !a.lido) ||
                        (filterType === 'lidos' && a.lido);
    const matchesCriticidade = filterCriticidade === 'todos' || a.criticidade === filterCriticidade;
    return matchesRead && matchesCriticidade;
  });

  const getCriticidadeBadge = (crit: string) => {
    switch(crit) {
      case 'Alta': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Média': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Baixa': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Read status filter */}
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todos">Todos os Avisos</option>
            <option value="nao-lidos">Não Lidos</option>
            <option value="lidos">Lidos</option>
          </select>

          {/* Severity filter */}
          <select 
            value={filterCriticidade}
            onChange={(e) => setFilterCriticidade(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todos">Todas as Severidades</option>
            <option value="Alta">Severidade: Alta</option>
            <option value="Média">Severidade: Média</option>
            <option value="Baixa">Severidade: Baixa</option>
          </select>
        </div>

        {/* Global actions */}
        <div className="flex gap-2.5 w-full lg:w-auto justify-end">
          <button 
            onClick={onMarkAllLido}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span>Ligar Todos</span>
          </button>
          
          <button 
            onClick={onClearAllAlertas}
            className="px-4 py-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Zerar Avisos</span>
          </button>
        </div>
      </div>

      {/* Alertas Feed list */}
      <div className="space-y-4">
        {filteredAlertas.length === 0 ? (
          <div className="bg-white border border-slate-200 p-16 rounded-2xl text-center text-slate-400">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">Nenhum alerta crítico ativo.</p>
            <p className="text-xs mt-1">Todos os índices de metas e desvios de municípios estão dentro do pactuado.</p>
          </div>
        ) : (
          filteredAlertas.map((alerta) => (
            <div 
              key={alerta.id} 
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                !alerta.lido 
                  ? 'border-l-4 border-l-rose-500 border-slate-200 shadow-sm' 
                  : 'border-slate-200 opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                  alerta.criticidade === 'Alta' 
                    ? 'bg-rose-50 text-rose-600' 
                    : alerta.criticidade === 'Média' 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-slate-50 text-slate-600'
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                      {alerta.titulo}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCriticidadeBadge(alerta.criticidade)}`}>
                      {alerta.criticidade}
                    </span>
                    {!alerta.lido && (
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    )}
                  </div>
                  
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-3xl">
                    {alerta.mensagem}
                  </p>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                    <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {alerta.municipioNome || 'Geral'}
                    </span>
                    <span>•</span>
                    <span>Aviso gerado em {alerta.data}</span>
                  </div>
                </div>
              </div>

              {/* Individual actions */}
              <div className="flex shrink-0 w-full md:w-auto justify-end gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                {!alerta.lido ? (
                  <button 
                    onClick={() => onMarkAlertaLido(alerta.id)}
                    className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Marcar Lido</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                    Lido
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
