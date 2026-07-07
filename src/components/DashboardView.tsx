'use client';

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
import { Municipio, Usuario, Indicador, Alerta, Missao } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
        <Card className="group">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
            <Badge variant="secondary" className="gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> 87.5% Ativos
            </Badge>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Municípios Cadastrados
            </CardDescription>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-bold text-slate-800">{totalMunicipios}</span>
              <span className="text-sm text-slate-500">({ativosMunicipios} ativos)</span>
            </div>
            <Button
              variant="link"
              className="h-auto p-0 mt-3 text-xs font-semibold text-indigo-600"
              onClick={() => onNavigate('municipios')}
            >
              Ver municípios <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Cobertura Saúde */}
        <Card className="group">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-rose-600 bg-rose-50 gap-0.5 border-0">
              <ArrowDownRight className="h-3.5 w-3.5" /> Meta: {saudeIndicador?.meta || 95}%
            </Badge>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cobertura Média de Saúde
            </CardDescription>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-bold text-slate-800">{mediaSaude}%</span>
              <Badge variant="outline" className="text-amber-500 bg-amber-50 border-0">Alerta Moderado</Badge>
            </div>
            <Button
              variant="link"
              className="h-auto p-0 mt-3 text-xs font-semibold text-indigo-600"
              onClick={() => onNavigate('resultados')}
            >
              Resultados & Metas <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Alertas Ativos */}
        <Card className="group">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="h-5 w-5" />
            </div>
            {alertasCriticos > 0 && (
              <Badge variant="destructive" className="uppercase tracking-wider animate-pulse">
                {alertasCriticos} Críticos
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Desvios / Alertas Ativos
            </CardDescription>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-bold text-slate-800">{alertasAtivos}</span>
              <span className="text-sm text-slate-500">não lidos</span>
            </div>
            <Button
              variant="link"
              className="h-auto p-0 mt-3 text-xs font-semibold text-rose-600"
              onClick={() => onNavigate('alertas')}
            >
              Tratar alertas <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 4: Missões de Apoio */}
        <Card className="group">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CheckSquare className="h-5 w-5" />
            </div>
            <Badge variant="secondary">{taxaConclusaoMissoes}% Concluídas</Badge>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Missões em Aberto
            </CardDescription>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl md:text-3xl font-bold text-slate-800">{missoesPendentes}</span>
              <span className="text-sm text-slate-500">ações ativas</span>
            </div>
            <Button
              variant="link"
              className="h-auto p-0 mt-3 text-xs font-semibold text-amber-600"
              onClick={() => onNavigate('missoes')}
            >
              Quadro de Missões <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Sections: Alert Feed & Cities Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Critical Municipalities and General Stats */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Municipalities Map Overview & List */}
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Status dos Municípios Clientes</CardTitle>
                <CardDescription>Visão consolidada da população sob gestão da plataforma</CardDescription>
              </div>
              <Button
                variant="link"
                className="h-auto p-0 text-xs font-semibold text-indigo-600"
                onClick={() => onNavigate('municipios')}
              >
                Gerenciar Lista
              </Button>
            </CardHeader>
            <CardContent>
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
                          <Badge
                            variant={m.status === 'Ativo' ? 'default' : m.status === 'Pendente' ? 'outline' : 'secondary'}
                            className={cn(
                              m.status === 'Ativo' && 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
                              m.status === 'Pendente' && 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
                              m.status === 'Inativo' && 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100'
                            )}
                          >
                            {m.status}
                          </Badge>
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
                <Badge variant="outline" className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border-emerald-200 uppercase">
                  LGPD OK
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics Progress (Mini indicator list) */}
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Desempenho Geral dos Indicadores</CardTitle>
                <CardDescription>Média ponderada dos municípios contra a meta ideal nacional</CardDescription>
              </div>
              <Button
                variant="link"
                className="h-auto p-0 text-xs font-semibold text-indigo-600"
                onClick={() => onNavigate('indicadores')}
              >
                Configurar Metas
              </Button>
            </CardHeader>
            <CardContent>
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
                      <Progress
                        value={percent}
                        className={cn(
                          'h-2.5',
                          percent >= 90 && '[&>div]:bg-emerald-500',
                          percent < 90 && percent >= 75 && '[&>div]:bg-amber-500',
                          percent < 75 && '[&>div]:bg-rose-500'
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Alert Feed & Notification Quick Actions */}
        <div className="space-y-6">

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <CardTitle className="text-base">Alertas Críticos</CardTitle>
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              </div>

              <div className="space-y-3.5">
                {alertas.slice(0, 3).map((alerta) => (
                  <div
                    key={alerta.id}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all text-xs',
                      !alerta.lido
                        ? 'bg-rose-50/50 border-rose-100'
                        : 'bg-slate-50/40 border-slate-100'
                    )}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <Badge
                        variant={alerta.criticidade === 'Alta' ? 'destructive' : 'secondary'}
                        className="uppercase text-[9px] px-2 py-0.5"
                      >
                        {alerta.criticidade}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{alerta.data}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1 leading-snug">{alerta.titulo}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed mb-1">{alerta.mensagem}</p>
                    <Badge variant="outline" className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 border-0">
                      {alerta.municipioNome}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>

            <div className="px-6 pb-6">
              <Button
                variant="outline"
                className="w-full text-xs font-semibold"
                onClick={() => onNavigate('alertas')}
              >
                Ver Painel de Alertas Completo
              </Button>
            </div>
          </Card>

          {/* Quick Stats: Team */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Agentes de Apoio Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usuarios.slice(0, 3).map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar} alt={u.nome} />
                        <AvatarFallback className="text-xs">{u.nome.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">{u.nome}</h4>
                        <p className="text-[10px] text-slate-400 capitalize">{u.cargo.toLowerCase()}</p>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  </div>
                ))}
              </div>
              <Button
                variant="link"
                className="h-auto p-0 text-[11px] font-semibold text-indigo-600 mt-4"
                onClick={() => onNavigate('usuarios')}
              >
                Gerenciar Cargos e Permissões
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
