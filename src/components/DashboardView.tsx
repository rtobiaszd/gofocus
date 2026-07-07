/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Zap,
  CheckSquare
} from 'lucide-react';
import { Municipio, Usuario, Indicador, Alerta, Missao } from '../types';

interface DashboardViewProps {
  municipios: Municipio[];
  usuarios: Usuario[];
  indicadores: Indicador[];
  alertas: Alerta[];
  missoes: Missao[];
  onNavigate: (view: string) => void;
}

export default function DashboardView({
  municipios,
  usuarios,
  indicadores,
  alertas,
  missoes,
  onNavigate
}: DashboardViewProps) {
  // Calculated KPIs
  const totalMunicipios = municipios.length;
  const ativosMunicipios = municipios.filter(m => m.status === 'Ativo').length;
  const totalPopulacao = municipios
    .filter(m => m.status === 'Ativo')
    .reduce((acc, curr) => acc + curr.populacao, 0);

  const alertasAtivos = alertas.filter(a => !a.lido).length;
  const alertasCriticos = alertas.filter(a => !a.lido && a.criticidade === 'Alta').length;
  
  const missoesPendentes = missoes.filter(m => m.status !== 'Concluído').length;
  const taxaConclusaoMissoes = missoes.length > 0 
    ? Math.round((missoes.filter(m => m.status === 'Concluído').length / missoes.length) * 100)
    : 0;

  // Average health coverage from mock data as a quick summary metric
  const saudeIndicador = indicadores.find(i => i.sigla === 'COB_SAUDE');
  const mediaSaude = saudeIndicador ? saudeIndicador.valorAtual : 87.2;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-slate-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-500/30">
            <Zap className="h-3.5 w-3.5" /> Monitoramento Estratégico
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Olá, Dr. Roberto! 👋
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Bem-vindo ao Centro de Decisão Estratégica. Aqui você monitora os principais indicadores, controla os limites fiscais e coordena as missões de apoio para <span className="text-indigo-400 font-semibold">{ativosMunicipios} municípios ativos</span>.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Municípios */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> 87.5% Ativos
            </span>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Municípios Cadastrados</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-800">{totalMunicipios}</span>
            <span className="text-sm text-slate-500">({ativosMunicipios} ativos)</span>
          </div>
          <button 
            onClick={() => onNavigate('municipios')}
            className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold mt-3 flex items-center gap-1 group/btn"
          >
            Ver municípios <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Card 2: Cobertura Saúde */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full flex items-center gap-0.5">
              <ArrowDownRight className="h-3.5 w-3.5" /> Meta: {saudeIndicador?.meta || 95}%
            </span>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Cobertura Média de Saúde</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-800">{mediaSaude}%</span>
            <span className="text-xs text-amber-500 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Alerta Moderado</span>
          </div>
          <button 
            onClick={() => onNavigate('resultados')}
            className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold mt-3 flex items-center gap-1 group/btn"
          >
            Resultados & Metas <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Card 3: Alertas Ativos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="h-5 w-5" />
            </div>
            {alertasCriticos > 0 && (
              <span className="text-[10px] font-bold text-white bg-rose-600 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                {alertasCriticos} Críticos
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Desvios / Alertas Ativos</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-800">{alertasAtivos}</span>
            <span className="text-sm text-slate-500">não lidos</span>
          </div>
          <button 
            onClick={() => onNavigate('alertas')}
            className="text-rose-600 hover:text-rose-700 text-xs font-semibold mt-3 flex items-center gap-1 group/btn"
          >
            Tratar alertas <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Card 4: Missões de Apoio */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {taxaConclusaoMissoes}% Concluídas
            </span>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Missões em Aberto</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-800">{missoesPendentes}</span>
            <span className="text-sm text-slate-500">ações ativas</span>
          </div>
          <button 
            onClick={() => onNavigate('missoes')}
            className="text-amber-600 hover:text-amber-700 text-xs font-semibold mt-3 flex items-center gap-1 group/btn"
          >
            Quadro de Missões <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
          </button>
        </div>

      </div>

      {/* Main Content Sections: Alert Feed & Cities Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Critical Municipalities and General Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Municipalities Map Overview & List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">Status dos Municípios Clientes</h3>
                <p className="text-xs text-slate-400">Visão consolidada da população sob gestão da plataforma</p>
              </div>
              <button 
                onClick={() => onNavigate('municipios')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Gerenciar Lista
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Município</th>
                    <th className="pb-3">Prefeito</th>
                    <th className="pb-3">População</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {municipios.slice(0, 4).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2 font-semibold text-slate-800">
                        {m.nome} <span className="text-slate-400 text-xs font-medium">({m.estado})</span>
                      </td>
                      <td className="py-3.5 text-slate-500 text-xs">{m.prefeito}</td>
                      <td className="py-3.5 text-slate-600 font-medium text-xs">
                        {m.populacao.toLocaleString('pt-BR')} hab
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          m.status === 'Ativo' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : m.status === 'Pendente' 
                              ? 'bg-amber-50 text-amber-700' 
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-5 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-800">Criptografia & Auditoria de Logs</h4>
                  <p className="text-[10px] text-slate-400">Todos os dados monitorados são auditados e assinados eletronicamente</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">LGPD OK</span>
            </div>
          </div>

          {/* Quick Metrics Progress (Mini indicator list) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800">Desempenho Geral dos Indicadores</h3>
                <p className="text-xs text-slate-400">Média ponderada dos municípios contra a meta ideal nacional</p>
              </div>
              <button 
                onClick={() => onNavigate('indicadores')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Configurar Metas
              </button>
            </div>

            <div className="space-y-4">
              {indicadores.slice(0, 3).map((ind) => {
                const percent = Math.min(Math.round((ind.valorAtual / ind.meta) * 100), 100);
                const isUnder = ind.valorAtual < ind.meta;
                
                return (
                  <div key={ind.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{ind.sigla}</span>
                        <span className="text-slate-400 ml-2">— {ind.nome}</span>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {ind.valorAtual} / <span className="text-slate-400">{ind.meta} {ind.unidade === 'porcentagem' ? '%' : ''}</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 90 ? 'bg-emerald-500' : percent >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Alert Feed & Notification Quick Actions */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-800">Alertas Críticos</h3>
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              </div>

              <div className="space-y-3.5">
                {alertas.slice(0, 3).map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`p-3.5 rounded-xl border transition-all text-xs ${
                      !alerta.lido 
                        ? 'bg-rose-50/50 border-rose-100' 
                        : 'bg-slate-50/40 border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={`font-bold px-2 py-0.5 rounded-full uppercase text-[9px] ${
                        alerta.criticidade === 'Alta' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {alerta.criticidade}
                      </span>
                      <span className="text-[10px] text-slate-400">{alerta.data}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1 leading-snug">{alerta.titulo}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed mb-1">{alerta.mensagem}</p>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      {alerta.municipioNome}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onNavigate('alertas')}
              className="w-full text-center py-2.5 mt-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition-all"
            >
              Ver Painel de Alertas Completo
            </button>
          </div>

          {/* Quick Stats: Team */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Agentes de Apoio Online</h3>
            <div className="space-y-3">
              {usuarios.slice(0, 3).map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={u.avatar} 
                      alt={u.nome} 
                      className="h-8 w-8 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">{u.nome}</h4>
                      <p className="text-[10px] text-slate-400 capitalize">{u.cargo.toLowerCase()}</p>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate('usuarios')}
              className="w-full text-center text-[11px] font-semibold text-indigo-600 hover:underline mt-4 block"
            >
              Gerenciar Cargos e Permissões
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
