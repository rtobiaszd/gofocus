'use client'

import React, { useState, useEffect } from 'react'
import { Alerta, Municipio } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  AlertTriangle,
  CheckCircle2,
  Check,
  Trash2,
  Eye,
  X,
  Sparkles,
  MapPin
} from 'lucide-react'

interface AlertasViewProps {
  alertas: Alerta[]
  municipios?: Municipio[]
  onMarkAlertaLido: (id: string) => void
  onMarkAllLido: () => void
  onClearAllAlertas: () => void
}

export default function AlertasView({
  alertas,
  municipios = [],
  onMarkAlertaLido,
  onMarkAllLido,
  onClearAllAlertas
}: AlertasViewProps) {
  const [filterType, setFilterType] = useState<string>('todos')
  const [filterCriticidade, setFilterCriticidade] = useState<string>('todos')
  const [activeAlerta, setActiveAlerta] = useState<Alerta | null>(null)

  const [aiConfig, setAiConfig] = useState(() => ({
    provider: localStorage.getItem('gofocus_ai_provider') || 'local',
    model: localStorage.getItem('gofocus_ai_model') || 'local-ollama-llama3',
    key: localStorage.getItem('gofocus_ai_key') || ''
  }))

  useEffect(() => {
    const handleStorageChange = () => {
      setAiConfig({
        provider: localStorage.getItem('gofocus_ai_provider') || 'local',
        model: localStorage.getItem('gofocus_ai_model') || 'local-ollama-llama3',
        key: localStorage.getItem('gofocus_ai_key') || ''
      })
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const filteredAlertas = alertas.filter(a => {
    const matchesRead = filterType === 'todos' ||
      (filterType === 'nao-lidos' && !a.lido) ||
      (filterType === 'lidos' && a.lido)
    const matchesCriticidade = filterCriticidade === 'todos' || a.criticidade === filterCriticidade
    return matchesRead && matchesCriticidade
  })

  const badgeVariant = (crit: string) => {
    switch (crit) {
      case 'Alta': return 'destructive'
      case 'Média': return 'secondary'
      case 'Baixa': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Todos os Avisos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Avisos</SelectItem>
                <SelectItem value="nao-lidos">Não Lidos</SelectItem>
                <SelectItem value="lidos">Lidos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCriticidade} onValueChange={setFilterCriticidade}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as Severidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Severidades</SelectItem>
                <SelectItem value="Alta">Severidade: Alta</SelectItem>
                <SelectItem value="Média">Severidade: Média</SelectItem>
                <SelectItem value="Baixa">Severidade: Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllLido}
              className="text-xs font-semibold"
            >
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              <span>Ligar Todos</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllAlertas}
              className="text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Zerar Avisos</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {filteredAlertas.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
              <CardTitle className="text-slate-600">Nenhum alerta crítico ativo.</CardTitle>
              <CardDescription className="text-xs mt-1">
                Todos os índices de metas e desvios de municípios estão dentro do pactuado.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          filteredAlertas.map((alerta) => (
            <Card
              key={alerta.id}
              className={cn(
                'border-slate-200 transition-all',
                !alerta.lido
                  ? 'border-l-4 border-l-rose-500 shadow-sm'
                  : 'opacity-75'
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-3 rounded-xl shrink-0',
                      alerta.criticidade === 'Alta'
                        ? 'bg-rose-50 text-rose-600'
                        : alerta.criticidade === 'Média'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-50 text-slate-600'
                    )}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                          {alerta.titulo}
                        </span>
                        <Badge variant={badgeVariant(alerta.criticidade)}>
                          {alerta.criticidade}
                        </Badge>
                        {!alerta.lido && (
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
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

                  <div className="flex shrink-0 w-full md:w-auto justify-end gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveAlerta(alerta)}
                      title="Expandir Alerta e Ver Recomendações"
                      className="text-xs font-bold"
                    >
                      <Eye className="h-4 w-4 text-slate-500" />
                      <span>Ver Detalhes</span>
                    </Button>

                    {!alerta.lido ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onMarkAlertaLido(alerta.id)}
                        className="text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      >
                        <Check className="h-4 w-4" />
                        <span>Marcar Lido</span>
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                        Lido
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {activeAlerta && (() => {
        const municipio = municipios.find(m => m.id === activeAlerta.municipioId)

        const getRecommendations = (msg: string, title: string) => {
          const lower = (msg + ' ' + title).toLowerCase()
          if (lower.includes('vacina') || lower.includes('saúde') || lower.includes('médico')) {
            return [
              { title: 'Mutirão de Saúde nos Bairros', desc: 'Organizar equipes itinerantes de saúde preventiva e vacinação nas zonas com menor cobertura histórica.' },
              { title: 'Busca Ativa de Inadimplentes Clínicos', desc: 'Cruzar dados do prontuário eletrônico para identificar famílias com vacinas pendentes e realizar visitas domiciliares.' },
              { title: 'Campanhas de Conscientização Local', desc: 'Utilizar canais de som, rádio comunitária e mídias sociais do município para alertar sobre a importância da cobertura.' }
            ]
          }
          if (lower.includes('ideb') || lower.includes('educação') || lower.includes('escola') || lower.includes('matrícula')) {
            return [
              { title: 'Plano de Reforço de Aprendizagem', desc: 'Instituir contraturno escolar obrigatório focado em matemática e português para turmas abaixo da média.' },
              { title: 'Busca Ativa Escolar Municipal', desc: 'Engajar assistentes sociais e conselho tutelar para resgatar alunos evadidos ou com faltas recorrentes.' },
              { title: 'Capacitação Pedagógica Continuada', desc: 'Realizar oficinas de nivelamento de metodologias de ensino com o corpo docente focado nos descritores do IDEB.' }
            ]
          }
          if (lower.includes('saneamento') || lower.includes('água') || lower.includes('esgoto')) {
            return [
              { title: 'Mutirão de Saneamento Emergencial', desc: 'Realizar limpeza preventiva de bueiros e redes de escoamento pluvial nos bairros prioritários.' },
              { title: 'Fiscalização da Concessionária de Água', desc: 'Notificar formalmente a empresa responsável pela distribuição sobre perdas de pressão ou falhas de abastecimento relatadas.' },
              { title: 'Instalação de Redes de Extensão', desc: 'Elaborar projeto executivo de extensão da rede coletora de esgoto sanitário para regularizar áreas informais.' }
            ]
          }
          if (lower.includes('gasto') || lower.includes('finança') || lower.includes('folha') || lower.includes('limite')) {
            return [
              { title: 'Auditoria de Fornecedores e Contratos', desc: 'Rever contratos de prestação de serviços continuados visando renegociação de valores com redução de pelo menos 10%.' },
              { title: 'Congelamento de Horas Extras e Nomeações', desc: 'Suspender temporariamente novas contratações discricionárias e limitar o pagamento de regimes especiais.' },
              { title: 'Campanha de Recuperação Fiscal (REFIS)', desc: 'Instituir programa especial de parcelamento de débitos tributários para incrementar a receita própria arrecadada.' }
            ]
          }
          return [
            { title: 'Reunião de Alinhamento Estratégico', desc: 'Convocar o secretário responsável pela pasta municipal afetada para traçar um plano de metas corretivas em 48 horas.' },
            { title: 'Alocação Emergencial de Orçamento', desc: 'Mapear reservas orçamentárias contingentes para focar esforços no indicador que sofreu queda drástica.' },
            { title: 'Criação de Missão Corretiva no GovFocus', desc: 'Cadastrar uma missão urgente atribuída ao gestor local com prazo máximo de conclusão de 15 dias.' }
          ]
        }

        const recs = getRecommendations(activeAlerta.mensagem, activeAlerta.titulo)

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border-slate-200 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b border-slate-200 px-6 py-4 space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'p-2 rounded-lg',
                    activeAlerta.criticidade === 'Alta'
                      ? 'bg-rose-50 text-rose-600'
                      : activeAlerta.criticidade === 'Média'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-50 text-slate-600'
                  )}>
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-base md:text-lg">Painel de Detalhes do Alerta</CardTitle>
                    <CardDescription className="text-xs">Análise diagnóstica detalhada de conformidade de meta</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveAlerta(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto space-y-6">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">{activeAlerta.titulo}</h4>
                    <Badge variant={badgeVariant(activeAlerta.criticidade)} className="whitespace-nowrap uppercase">
                      Nível {activeAlerta.criticidade}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{activeAlerta.mensagem}</p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Gerado em: <strong className="text-slate-600">{activeAlerta.data}</strong></span>
                    <span>Status: <strong className={cn(activeAlerta.lido ? 'text-emerald-600' : 'text-rose-500 animate-pulse')}>{activeAlerta.lido ? 'Lido' : 'Não Lido'}</strong></span>
                  </div>
                </div>

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
                        <span className={cn(
                          'inline-block font-extrabold text-[10px] px-2 py-0.5 rounded-full mt-0.5 uppercase',
                          municipio.status === 'Ativo'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        )}>
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

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      Plano de Ações Corretivas Recomendado (IA GovFocus)
                    </h5>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100/40 rounded-lg text-[9px] font-bold text-indigo-700 uppercase tracking-wide shrink-0">
                      <span>Provedor:</span>
                      <span className="text-slate-800">
                        {aiConfig.provider === 'gemini' ? 'Google Gemini' :
                         aiConfig.provider === 'openai' ? 'OpenAI GPT' :
                         aiConfig.provider === 'claude' ? 'Anthropic Claude' : 'GovFocus Local'}
                      </span>
                      <span>•</span>
                      <span>Modelo:</span>
                      <span className="text-slate-800 font-mono text-[8px]">{aiConfig.model}</span>
                      {aiConfig.provider !== 'local' && aiConfig.key && (
                        <span className="text-emerald-600 font-extrabold">• Chave Ativa</span>
                      )}
                    </div>
                  </div>
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
              </CardContent>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                {!activeAlerta.lido && (
                  <Button
                    onClick={() => {
                      onMarkAlertaLido(activeAlerta.id)
                      setActiveAlerta(prev => prev ? { ...prev, lido: true } : null)
                    }}
                    className="text-xs font-bold shadow-md shadow-indigo-950/10"
                  >
                    <Check className="h-4 w-4" />
                    <span>Marcar como Lido</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setActiveAlerta(null)}
                  className="text-xs font-bold"
                >
                  Fechar Painel
                </Button>
              </div>
            </Card>
          </div>
        )
      })()}
    </div>
  )
}
