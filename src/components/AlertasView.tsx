/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alerta, Municipio } from '../types';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Check, Trash2, Eye, EyeOff, X, Sparkles, MapPin, Target, ShieldCheck, HelpCircle } from 'lucide-react';

interface AlertasViewProps {
  alertas: Alerta[];
  municipios?: Municipio[];
  onMarkAlertaLido: (id: string) => void;
  onMarkAllLido: () => void;
  onClearAllAlertas: () => void;
}

export default function AlertasView({
  alertas,
  municipios = [],
  onMarkAlertaLido,
  onMarkAllLido,
  onClearAllAlertas
}: AlertasViewProps) {
  const [filterType, setFilterType] = useState<'todos' | 'nao-lidos' | 'lidos'>('todos');
  const [filterCriticidade, setFilterCriticidade] = useState<string>('todos');
  const [activeAlerta, setActiveAlerta] = useState<Alerta | null>(null);

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
                <button 
                  onClick={() => setActiveAlerta(alerta)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Expandir Alerta e Ver Recomendações"
                >
                  <Eye className="h-4 w-4 text-slate-500" />
                  <span>Ver Detalhes</span>
                </button>

                {!alerta.lido ? (
                  <button 
                    onClick={() => onMarkAlertaLido(alerta.id)}
                    className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* Alerta Detail Modal */}
      {activeAlerta && (() => {
        const municipio = municipios.find(m => m.id === activeAlerta.municipioId);
        
        // Generate contextual recommended actions
        const getRecommendations = (msg: string, title: string) => {
          const lower = (msg + " " + title).toLowerCase();
          if (lower.includes("vacina") || lower.includes("saúde") || lower.includes("médico")) {
            return [
              { title: "Mutirão de Saúde nos Bairros", desc: "Organizar equipes itinerantes de saúde preventiva e vacinação nas zonas com menor cobertura histórica." },
              { title: "Busca Ativa de Inadimplentes Clínicos", desc: "Cruzar dados do prontuário eletrônico para identificar famílias com vacinas pendentes e realizar visitas domiciliares." },
              { title: "Campanhas de Conscientização Local", desc: "Utilizar canais de som, rádio comunitária e mídias sociais do município para alertar sobre a importância da cobertura." }
            ];
          }
          if (lower.includes("ideb") || lower.includes("educação") || lower.includes("escola") || lower.includes("matrícula")) {
            return [
              { title: "Plano de Reforço de Aprendizagem", desc: "Instituir contraturno escolar obrigatório focado em matemática e português para turmas abaixo da média." },
              { title: "Busca Ativa Escolar Municipal", desc: "Engajar assistentes sociais e conselho tutelar para resgatar alunos evadidos ou com faltas recorrentes." },
              { title: "Capacitação Pedagógica Continuada", desc: "Realizar oficinas de nivelamento de metodologias de ensino com o corpo docente focado nos descritores do IDEB." }
            ];
          }
          if (lower.includes("saneamento") || lower.includes("água") || lower.includes("esgoto")) {
            return [
              { title: "Mutirão de Saneamento Emergencial", desc: "Realizar limpeza preventiva de bueiros e redes de escoamento pluvial nos bairros prioritários." },
              { title: "Fiscalização da Concessionária de Água", desc: "Notificar formalmente a empresa responsável pela distribuição sobre perdas de pressão ou falhas de abastecimento relatadas." },
              { title: "Instalação de Redes de Extensão", desc: "Elaborar projeto executivo de extensão da rede coletora de esgoto sanitário para regularizar áreas informais." }
            ];
          }
          if (lower.includes("gasto") || lower.includes("finança") || lower.includes("folha") || lower.includes("limite")) {
            return [
              { title: "Auditoria de Fornecedores e Contratos", desc: "Rever contratos de prestação de serviços continuados visando renegociação de valores com redução de pelo menos 10%." },
              { title: "Congelamento de Horas Extras e Nomeações", desc: "Suspender temporariamente novas contratações discricionárias e limitar o pagamento de regimes especiais." },
              { title: "Campanha de Recuperação Fiscal (REFIS)", desc: "Instituir programa especial de parcelamento de débitos tributários para incrementar a receita própria arrecadada." }
            ];
          }
          // Default fallbacks
          return [
            { title: "Reunião de Alinhamento Estratégico", desc: "Convocar o secretário responsável pela pasta municipal afetada para traçar um plano de metas corretivas em 48 horas." },
            { title: "Alocação Emergencial de Orçamento", desc: "Mapear reservas orçamentárias contingentes para focar esforços no indicador que sofreu queda drástica." },
            { title: "Criação de Missão Corretiva no GovFocus", desc: "Cadastrar uma missão urgente atribuída ao gestor local com prazo máximo de conclusão de 15 dias." }
          ];
        };

        const recs = getRecommendations(activeAlerta.mensagem, activeAlerta.titulo);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${
                    activeAlerta.criticidade === 'Alta' 
                      ? 'bg-rose-50 text-rose-600' 
                      : activeAlerta.criticidade === 'Média' 
                        ? 'bg-amber-50 text-amber-600' 
                        : 'bg-slate-50 text-slate-600'
                  }`}>
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base md:text-lg">Painel de Detalhes do Alerta</h3>
                    <p className="text-xs text-slate-400">Análise diagnóstica detalhada de conformidade de meta</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveAlerta(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Alert Core Stats */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">{activeAlerta.titulo}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap ${getCriticidadeBadge(activeAlerta.criticidade)}`}>
                      Nível {activeAlerta.criticidade}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{activeAlerta.mensagem}</p>
                  
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Gerado em: <strong className="text-slate-600">{activeAlerta.data}</strong></span>
                    <span>Status: <strong className={activeAlerta.lido ? "text-emerald-600" : "text-rose-500 animate-pulse"}>{activeAlerta.lido ? "Lido" : "Não Lido"}</strong></span>
                  </div>
                </div>

                {/* Associated Municipality Info */}
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Município Responsável
                  </h5>
                  {municipio ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Nome</span>
                        <span className="font-bold text-slate-800 text-sm">{municipio.nome} - {municipio.estado}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Prefeito</span>
                        <span className="font-bold text-slate-800 text-sm truncate block">{municipio.prefeito}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">População</span>
                        <span className="font-bold text-slate-800 text-sm">{municipio.populacao.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Status de Ativação</span>
                        <span className={`inline-block font-extrabold text-[10px] px-2 py-0.5 rounded-full mt-0.5 uppercase ${
                          municipio.status === 'Ativo' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {municipio.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400 font-medium">
                      Este é um alerta global e não está vinculado a um município específico.
                    </div>
                  )}
                </div>

                {/* AI-Driven Diagnostic Recommendations */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Plano de Ações Corretivas Recomendado (IA GovFocus)
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Com base no cruzamento histórico de indicadores regionais e análise preditiva, o assistente recomenda as seguintes ações prioritárias:
                  </p>
                  
                  <div className="space-y-3">
                    {recs.map((rec, i) => (
                      <div key={i} className="flex gap-3 bg-indigo-50/40 border border-indigo-500/10 p-3.5 rounded-xl hover:bg-indigo-50/70 transition-all">
                        <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <h6 className="font-bold text-slate-800 text-xs md:text-sm">{rec.title}</h6>
                          <p className="text-slate-500 text-[11px] md:text-xs leading-relaxed mt-0.5">{rec.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3 shrink-0">
                {!activeAlerta.lido && (
                  <button 
                    onClick={() => {
                      onMarkAlertaLido(activeAlerta.id);
                      setActiveAlerta(prev => prev ? { ...prev, lido: true } : null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Marcar como Lido</span>
                  </button>
                )}
                <button 
                  onClick={() => setActiveAlerta(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Fechar Painel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
