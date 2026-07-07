'use client'

import { useState } from 'react'
import { Municipio, ResultadoIndicador } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { HelpCircle, Activity, Landmark, CheckCircle2, AlertCircle } from 'lucide-react'

interface ResultadosViewProps {
  municipios: Municipio[]
  resultados: ResultadoIndicador[]
}

export default function ResultadosView({ municipios, resultados }: ResultadosViewProps) {
  const activeMunicipios = municipios.filter(m => m.status === 'Ativo')
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<string>(activeMunicipios[0]?.id || 'm-1')
  const selectedMunicipio = municipios.find(m => m.id === selectedMunicipioId)
  const filteredResultados = resultados.filter(r => r.municipioId === selectedMunicipioId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Análise Comparativa de Metas</CardTitle>
            <CardDescription>Selecione o município cliente para renderizar o painel de desvios e metas do período.</CardDescription>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Landmark className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <Select value={selectedMunicipioId} onValueChange={setSelectedMunicipioId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Selecione um município" />
              </SelectTrigger>
              <SelectContent>
                {activeMunicipios.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.nome} ({m.estado})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" aria-label="Ajuda">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Metas vs. Realizado: {selectedMunicipio?.nome}</CardTitle>
                <CardDescription>Comparação visual direta dos índices apurados para cada indicador global</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-slate-300" />
                  Meta
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
                  Realizado
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredResultados.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-xs text-muted-foreground">
                <Activity className="mb-2 h-10 w-10 animate-pulse text-slate-300" />
                <span>Sem resultados registrados para este município.</span>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredResultados.map(res => {
                  const maxVal = Math.max(res.meta, res.realizado) * 1.2
                  const targetPercent = (res.meta / maxVal) * 100
                  const realizedPercent = Math.min((res.realizado / maxVal) * 100, 100)
                  const isUnder = res.realizado < res.meta

                  return (
                    <div key={res.id} className="space-y-1.5">
                      <div className="flex items-end justify-between text-xs font-semibold">
                        <div className="truncate">
                          <span className="font-bold text-foreground">{res.indicadorSigla}</span>
                          <span className="ml-1 font-medium text-muted-foreground">— {res.indicadorNome}</span>
                        </div>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          Realizado:{' '}
                          <strong className={isUnder ? 'text-rose-600' : 'text-emerald-600'}>
                            {res.realizado}{res.unidade === 'porcentagem' ? '%' : ''}
                          </strong>
                          {' / '}Meta: {res.meta}{res.unidade === 'porcentagem' ? '%' : ''}
                        </span>
                      </div>

                      <div className="relative h-7 w-full overflow-hidden rounded-xl border bg-muted">
                        <div
                          className="absolute inset-y-0 z-10 flex items-center border-r-2 border-indigo-500/80 bg-indigo-500/5"
                          style={{ width: `${targetPercent}%` }}
                        >
                          <span className="absolute -top-0 right-1 rounded bg-indigo-100 px-1 text-[8px] font-bold text-indigo-700">
                            META
                          </span>
                        </div>

                        <Progress
                          value={realizedPercent}
                          className={cn(
                            'h-full rounded-none border-0 bg-transparent',
                            '[&>div]:h-full [&>div]:rounded-r-lg [&>div]:shadow-sm [&>div]:transition-all [&>div]:duration-500',
                            isUnder ? '[&>div]:bg-rose-500/90' : '[&>div]:bg-emerald-500/95'
                          )}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Relatório de Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResultados.map(res => {
                  const diff = parseFloat((res.realizado - res.meta).toFixed(1))
                  const success = diff >= 0
                  return (
                    <div key={res.id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div className={cn('rounded-lg p-2 shrink-0', success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                        {success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div className="text-xs">
                        <span className="block font-bold text-foreground">{res.indicadorSigla}</span>
                        <p className="mb-1 text-[10px] text-muted-foreground">{res.mes}</p>
                        <span className={cn('font-semibold', success ? 'text-emerald-700' : 'text-rose-700')}>
                          {success ? `Acima da Meta (+${diff})` : `Abaixo da Meta (${diff})`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </div>
          <div className="p-6 pt-0 mt-auto">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-[11px] leading-relaxed text-amber-800">
              <strong>Fundo Constitucional:</strong> Conforme lei, desvios persistentes em indicadores fiscais de educação podem acarretar em bloqueios na liberação de emendas estaduais.
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de Resultados do Município</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3">Indicador</TableHead>
                <TableHead className="px-6 py-3">Meta Pactuada</TableHead>
                <TableHead className="px-6 py-3">Resultado Apurado</TableHead>
                <TableHead className="px-6 py-3">Período</TableHead>
                <TableHead className="px-6 py-3 text-right">Avaliação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResultados.map(res => {
                const success = res.realizado >= res.meta
                return (
                  <TableRow key={res.id}>
                    <TableCell className="px-6 py-4 font-medium text-foreground">
                      {res.indicadorSigla}{' '}
                      <span className="text-xs font-medium text-muted-foreground">— {res.indicadorNome}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-semibold">
                      {res.meta}{res.unidade === 'porcentagem' ? '%' : ''}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-bold">
                      {res.realizado}{res.unidade === 'porcentagem' ? '%' : ''}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-muted-foreground">{res.mes}</TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Badge
                        variant={success ? 'default' : 'destructive'}
                        className={cn(
                          success && 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        )}
                      >
                        {success ? 'Atingida' : 'Desvio'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
