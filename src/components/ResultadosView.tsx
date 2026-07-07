/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Municipio, ResultadoIndicador } from '../types';
import { BarChart3, TrendingUp, HelpCircle, Activity, Landmark, Target, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResultadosViewProps {
  municipios: Municipio[];
  resultados: ResultadoIndicador[];
}

export default function ResultadosView({
  municipios,
  resultados
}: ResultadosViewProps) {
  // Filter by municipality to display comparative graph
  const activeMunicipios = municipios.filter(m => m.status === 'Ativo');
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<string>(activeMunicipios[0]?.id || 'm-1');

  const selectedMunicipio = municipios.find(m => m.id === selectedMunicipioId);
  const filteredResultados = resultados.filter(r => r.municipioId === selectedMunicipioId);

  return (
    <div className="space-y-6">
      {/* Selection Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Análise Comparativa de Metas</h3>
          <p className="text-xs text-slate-400">Selecione o município cliente para renderizar o painel de desvios e metas do período.</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Landmark className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          <select 
            value={selectedMunicipioId}
            onChange={(e) => setSelectedMunicipioId(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700"
          >
            {activeMunicipios.map(m => (
              <option key={m.id} value={m.id}>{m.nome} ({m.estado})</option>
            ))}
          </select>
        </div>
      </div>

      {/* SVG Charts Area - Target vs. Realized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Chart Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Metas vs. Realizado: {selectedMunicipio?.nome}</h4>
              <p className="text-xs text-slate-400">Comparação visual direta dos índices apurados para cada indicador global</p>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-slate-300 rounded"></span> Meta
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-emerald-500 rounded"></span> Realizado
              </span>
            </div>
          </div>

          {/* Render High-Fidelity Custom Charts with pure SVG */}
          {filteredResultados.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Activity className="h-10 w-10 text-slate-300 mb-2 animate-pulse" />
              <span>Sem resultados registrados para este município.</span>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredResultados.map((res) => {
                const maxVal = Math.max(res.meta, res.realizado) * 1.2;
                const targetPercent = (res.meta / maxVal) * 100;
                const realizedPercent = (res.realizado / maxVal) * 100;
                const isUnder = res.realizado < res.meta;

                return (
                  <div key={res.id} className="space-y-1.5">
                    <div className="flex justify-between items-end text-xs font-semibold">
                      <div className="truncate">
                        <span className="text-slate-800 font-bold">{res.indicadorSigla}</span>
                        <span className="text-slate-400 ml-1 font-medium">— {res.indicadorNome}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] shrink-0">
                        Realizado: <strong className={isUnder ? 'text-rose-600' : 'text-emerald-600'}>
                          {res.realizado}{res.unidade === 'porcentagem' ? '%' : ''}
                        </strong>
                        {' '}/ Metado: {res.meta}{res.unidade === 'porcentagem' ? '%' : ''}
                      </span>
                    </div>

                    <div className="relative h-7 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center">
                      {/* Meta bar background marker line */}
                      <div 
                        className="absolute h-full border-r-2 border-indigo-500/80 bg-indigo-500/5 z-10 flex items-center"
                        style={{ width: `${targetPercent}%` }}
                      >
                        <span className="absolute right-1 text-[8px] font-bold text-indigo-700 bg-indigo-100 px-1 rounded -top-0">
                          META
                        </span>
                      </div>

                      {/* Realized filled progress bar */}
                      <div 
                        className={`h-4.5 rounded-r-lg transition-all duration-500 shadow-sm ${
                          isUnder ? 'bg-rose-500/90' : 'bg-emerald-500/95'
                        }`}
                        style={{ width: `${realizedPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Diagnostic Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-4">Relatório de Metas</h4>
            <div className="space-y-4">
              {filteredResultados.map((res) => {
                const diff = parseFloat((res.realizado - res.meta).toFixed(1));
                const success = diff >= 0;

                return (
                  <div key={res.id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className={`p-2 rounded-lg shrink-0 ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">{res.indicadorSigla}</span>
                      <p className="text-slate-400 text-[10px] mb-1">{res.mes}</p>
                      <span className={`font-semibold ${success ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {success ? `Acima da Meta (+${diff})` : `Abaixo da Meta (${diff})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50/70 border border-amber-150 rounded-xl text-[11px] text-amber-800 leading-relaxed">
            <strong>Fundo Constitucional:</strong> Conforme lei, desvios persistentes em indicadores fiscais de educação podem acarretar em bloqueios na liberação de emendas estaduais.
          </div>
        </div>

      </div>

      {/* Comparative Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm">Matriz de Resultados do Município</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-6">Indicador</th>
                <th className="py-3 px-6">Meta Pactuada</th>
                <th className="py-3 px-6">Resultado Apurado</th>
                <th className="py-3 px-6">Período</th>
                <th className="py-3 px-6 text-right">Avaliação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResultados.map((res) => {
                const success = res.realizado >= res.meta;
                return (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {res.indicadorSigla} <span className="text-slate-400 text-xs font-medium">— {res.indicadorNome}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">
                      {res.meta}{res.unidade === 'porcentagem' ? '%' : ''}
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-bold">
                      {res.realizado}{res.unidade === 'porcentagem' ? '%' : ''}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">{res.mes}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        success 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {success ? 'Atingida' : 'Desvio'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
