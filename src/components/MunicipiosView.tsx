'use client'

import React, { useState } from 'react'
import { Search, Plus, MapPin, Building, Trash2, Edit, AlertCircle, X, Users, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Municipio } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'

interface MunicipiosViewProps {
  municipios: Municipio[]
  onAddMunicipio: (municipio: Omit<Municipio, 'id'>) => void
  onRemoveMunicipio: (id: string) => void
  onEditMunicipio: (id: string, updatedFields: Partial<Municipio>) => void
}

const ESTADOS = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'CE', 'PE', 'BA', 'GO', 'TO', 'MS'] as const

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'Ativo':
      return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-50'
    case 'Pendente':
      return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100'
  }
}

export default function MunicipiosView({
  municipios,
  onAddMunicipio,
  onRemoveMunicipio,
  onEditMunicipio,
}: MunicipiosViewProps) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const [nome, setNome] = useState('')
  const [estado, setEstado] = useState('SP')
  const [populacao, setPopulacao] = useState('')
  const [prefeito, setPrefeito] = useState('')
  const [status, setStatus] = useState<'Ativo' | 'Pendente' | 'Inativo'>('Ativo')
  const [error, setError] = useState('')

  const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editNome, setEditNome] = useState('')
  const [editEstado, setEditEstado] = useState('SP')
  const [editPopulacao, setEditPopulacao] = useState('')
  const [editPrefeito, setEditPrefeito] = useState('')
  const [editStatus, setEditStatus] = useState<'Ativo' | 'Pendente' | 'Inativo'>('Ativo')
  const [editError, setEditError] = useState('')

  const handleOpenDetail = (m: Municipio, editImmediately = false) => {
    setEditingMunicipio(m)
    setEditNome(m.nome)
    setEditEstado(m.estado)
    setEditPrefeito(m.prefeito)
    setEditPopulacao(m.populacao.toString())
    setEditStatus(m.status)
    setIsEditMode(editImmediately)
    setEditError('')
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMunicipio) return

    if (!editNome.trim() || !editPrefeito.trim() || !editPopulacao.trim()) {
      setEditError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const popNum = parseInt(editPopulacao)
    if (isNaN(popNum) || popNum <= 0) {
      setEditError('A população deve ser um número positivo.')
      return
    }

    onEditMunicipio(editingMunicipio.id, {
      nome: editNome.trim(),
      estado: editEstado,
      populacao: popNum,
      status: editStatus,
      prefeito: editPrefeito.trim(),
    })

    setEditingMunicipio(null)
    setIsEditMode(false)
    setEditError('')
  }

  const filteredMunicipios = municipios.filter((m) => {
    const matchesSearch =
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.prefeito.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || m.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !prefeito.trim() || !populacao.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const popNum = parseInt(populacao)
    if (isNaN(popNum) || popNum <= 0) {
      setError('A população deve ser um número positivo.')
      return
    }

    onAddMunicipio({
      nome: nome.trim(),
      estado,
      populacao: popNum,
      status,
      prefeito: prefeito.trim(),
      dataAtivacao: new Date().toISOString().split('T')[0],
    })

    setNome('')
    setPrefeito('')
    setPopulacao('')
    setStatus('Ativo')
    setError('')
    setShowAddDialog(false)
  }

  const resetAddForm = () => {
    setNome('')
    setPrefeito('')
    setPopulacao('')
    setEstado('SP')
    setStatus('Ativo')
    setError('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por município ou prefeito..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Ativo">Status: Ativo</SelectItem>
                <SelectItem value="Pendente">Status: Pendente</SelectItem>
                <SelectItem value="Inativo">Status: Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Dialog
              open={showAddDialog}
              onOpenChange={(open) => {
                setShowAddDialog(open)
                if (!open) resetAddForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Novo Município
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Adicionar Município Cliente
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="nome">Nome do Município *</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Rio Claro"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado *</Label>
                      <Select value={estado} onValueChange={setEstado}>
                        <SelectTrigger id="estado">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map((st) => (
                            <SelectItem key={st} value={st}>
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prefeito">Nome do Prefeito(a) *</Label>
                    <Input
                      id="prefeito"
                      placeholder="Nome do governante atual"
                      value={prefeito}
                      onChange={(e) => setPrefeito(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="populacao">População Estimada *</Label>
                      <Input
                        id="populacao"
                        type="number"
                        placeholder="Ex: 45000"
                        value={populacao}
                        onChange={(e) => setPopulacao(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-status">Status Operacional</Label>
                      <Select
                        value={status}
                        onValueChange={(v) => setStatus(v as 'Ativo' | 'Pendente' | 'Inativo')}
                      >
                        <SelectTrigger id="add-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={resetAddForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Município</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMunicipios.length === 0 ? (
          <div className="col-span-full bg-card border rounded-xl p-12 text-center text-muted-foreground">
            <Building className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-card-foreground">
              Nenhum município correspondente encontrado.
            </p>
            <p className="text-xs mt-1">
              Experimente alterar a sua busca ou adicionar um novo convênio.
            </p>
          </div>
        ) : (
          filteredMunicipios.map((m) => (
            <Card key={m.id} className="flex flex-col justify-between group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-muted text-muted-foreground rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm md:text-base group-hover:text-indigo-600 transition-colors">
                        {m.nome}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium">Estado de {m.estado}</p>
                    </div>
                  </div>

                  <Badge className={cn('pointer-events-none', statusBadgeClass(m.status))}>
                    {m.status}
                  </Badge>
                </div>

                <div className="space-y-2 border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/60">Prefeito atual</span>
                    <span className="font-bold text-foreground">{m.prefeito}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/60">População</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {m.populacao.toLocaleString('pt-BR')} hab
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/60">Ativação</span>
                    <span className="font-mono text-muted-foreground">{m.dataAtivacao}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 border-t pt-4 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDetail(m, false)}
                    title="Visualizar Detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDetail(m, true)}
                    title="Editar Município"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMunicipio(m.id)}
                    title="Excluir Convênio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={editingMunicipio !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMunicipio(null)
            setIsEditMode(false)
            setEditError('')
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {editingMunicipio && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  {isEditMode ? 'Editar Município' : 'Detalhes do Município'}
                </DialogTitle>
              </DialogHeader>

              {isEditMode ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {editError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="edit-nome">Nome do Município *</Label>
                      <Input
                        id="edit-nome"
                        placeholder="Ex: Rio Claro"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-estado">Estado *</Label>
                      <Select value={editEstado} onValueChange={setEditEstado}>
                        <SelectTrigger id="edit-estado">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map((st) => (
                            <SelectItem key={st} value={st}>
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-prefeito">Nome do Prefeito(a) *</Label>
                    <Input
                      id="edit-prefeito"
                      placeholder="Nome do governante atual"
                      value={editPrefeito}
                      onChange={(e) => setEditPrefeito(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-populacao">População Estimada *</Label>
                      <Input
                        id="edit-populacao"
                        type="number"
                        placeholder="Ex: 45000"
                        value={editPopulacao}
                        onChange={(e) => setEditPopulacao(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status Operacional</Label>
                      <Select
                        value={editStatus}
                        onValueChange={(v) =>
                          setEditStatus(v as 'Ativo' | 'Pendente' | 'Inativo')
                        }
                      >
                        <SelectTrigger id="edit-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false)
                        setEditError('')
                      }}
                    >
                      Voltar para Visualização
                    </Button>
                    <Button type="submit">Salvar Alterações</Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-xl border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-lg">{editingMunicipio.nome}</h4>
                        <p className="text-xs text-muted-foreground font-semibold">
                          Estado de {editingMunicipio.estado}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn('pointer-events-none', statusBadgeClass(editingMunicipio.status))}>
                      {editingMunicipio.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-xl border space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Prefeito(a) Atual
                      </span>
                      <span className="font-bold text-sm">{editingMunicipio.prefeito}</span>
                    </div>
                    <div className="p-4 bg-muted rounded-xl border space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        População Estimada
                      </span>
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {editingMunicipio.populacao.toLocaleString('pt-BR')} habitantes
                      </span>
                    </div>
                    <div className="p-4 bg-muted rounded-xl border space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Data de Adesão / Ativação
                      </span>
                      <span className="font-bold text-sm">{editingMunicipio.dataAtivacao}</span>
                    </div>
                  </div>

                  <DialogFooter className="pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingMunicipio(null)
                      }}
                    >
                      Fechar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar Dados
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
