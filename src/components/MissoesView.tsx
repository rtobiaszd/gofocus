'use client'

import React, { useState } from 'react';
import { Missao, Municipio, Usuario } from '@/types';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Trash2,
  X,
  ClipboardList,
  AlertCircle,
  Pencil,
  Columns,
  MapPin,
  Clock,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface MissoesViewProps {
  missoes: Missao[];
  municipios: Municipio[];
  usuarios: Usuario[];
  onAddMissao: (missao: Omit<Missao, 'id'>) => void;
  onUpdateMissaoStatus: (id: string, newStatus: string) => void;
  onRemoveMissao: (id: string) => void;
  onEditMissao: (id: string, updatedFields: Partial<Missao>) => void;
}

export default function MissoesView({
  missoes,
  municipios,
  usuarios,
  onAddMissao,
  onUpdateMissaoStatus,
  onRemoveMissao,
  onEditMissao
}: MissoesViewProps) {
  const [search, setSearch] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState<string>('todos');

  const [columns, setColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('kanban_columns');
    return saved ? JSON.parse(saved) : ['Pendente', 'Em Andamento', 'Concluído'];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMissao, setEditingMissao] = useState<Missao | null>(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [municipioId, setMunicipioId] = useState(municipios[0]?.id || '');
  const [prioridade, setPrioridade] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [responsavel, setResponsavel] = useState(usuarios[0]?.nome || '');
  const [prazo, setPrazo] = useState('2026-07-31');
  const [status, setStatus] = useState('Pendente');
  const [formError, setFormError] = useState('');

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [columnError, setColumnError] = useState('');

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const filteredMissoes = missoes.filter(m => {
    const matchesSearch = m.titulo.toLowerCase().includes(search.toLowerCase()) ||
                          m.descricao.toLowerCase().includes(search.toLowerCase()) ||
                          m.municipioNome.toLowerCase().includes(search.toLowerCase()) ||
                          m.responsavel.toLowerCase().includes(search.toLowerCase());
    const matchesPrioridade = filterPrioridade === 'todos' || m.prioridade === filterPrioridade;
    return matchesSearch && matchesPrioridade;
  });

  const handleOpenAddModal = () => {
    setEditingMissao(null);
    setTitulo('');
    setDescricao('');
    setMunicipioId(municipios[0]?.id || '');
    setPrioridade('Média');
    setResponsavel(usuarios[0]?.nome || '');
    setPrazo(new Date().toISOString().split('T')[0]);
    setStatus(columns[0] || 'Pendente');
    setFormError('');
    setShowAddForm(true);
  };

  const handleOpenEditModal = (task: Missao) => {
    setEditingMissao(task);
    setTitulo(task.titulo);
    setDescricao(task.descricao);
    setMunicipioId(task.municipioId);
    setPrioridade(task.prioridade);
    setResponsavel(task.responsavel);
    setPrazo(task.prazo);
    setStatus(task.status);
    setFormError('');
    setShowAddForm(true);
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setEditingMissao(null);
    setFormError('');
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim() || !municipioId) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const mun = municipios.find(m => m.id === municipioId);
    if (!mun) return;

    if (editingMissao) {
      onEditMissao(editingMissao.id, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        municipioId,
        municipioNome: mun.nome,
        prioridade,
        responsavel,
        prazo,
        status
      });
    } else {
      onAddMissao({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        municipioId,
        municipioNome: mun.nome,
        status,
        prazo,
        prioridade,
        responsavel
      });
    }

    handleCloseModal();
  };

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newColumnName.trim();
    if (!name) return;

    if (columns.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
      setColumnError('Já existe uma coluna com este nome.');
      return;
    }

    const updated = [...columns, name];
    setColumns(updated);
    localStorage.setItem('kanban_columns', JSON.stringify(updated));
    setNewColumnName('');
    setShowAddColumn(false);
    setColumnError('');
  };

  const handleRemoveColumn = (colName: string) => {
    if (confirm('Tem certeza que deseja excluir a coluna "' + colName + '"? As tarefas ativas nela serão movidas para a coluna "' + (columns[0] || 'Pendente') + '".')) {
      const defaultCol = columns[0] || 'Pendente';

      missoes.forEach(m => {
        if (m.status === colName) {
          onUpdateMissaoStatus(m.id, defaultCol);
        }
      });

      const updated = columns.filter(c => c !== colName);
      setColumns(updated);
      localStorage.setItem('kanban_columns', JSON.stringify(updated));
    }
  };

  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case 'Alta': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Média': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Baixa': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getColumnDotColor = (colName: string) => {
    const nameLower = colName.toLowerCase();
    if (nameLower.includes('pend') || nameLower.includes('fazer') || nameLower.includes('todo')) return 'bg-rose-500';
    if (nameLower.includes('andamento') || nameLower.includes('progresso') || nameLower.includes('doing')) return 'bg-amber-500';
    if (nameLower.includes('concl') || nameLower.includes('pronto') || nameLower.includes('done') || nameLower.includes('final')) return 'bg-emerald-500';
    return 'bg-indigo-500';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-sky-100 text-sky-700 border-sky-200',
      'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      'bg-violet-100 text-violet-700 border-violet-200'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getJiraId = (id: string) => {
    const num = id.replace(/\D/g, '');
    const short = num ? num.slice(-3) : id.slice(-3).toUpperCase();
    return 'MIS-' + (short || '101');
  };

  const isOverdue = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por código, missão, descrição, responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>

          <div className="flex flex-wrap w-full md:w-auto items-center gap-3 justify-between md:justify-end">
            <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as Prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Prioridades</SelectItem>
                <SelectItem value="Alta">Prioridade: Alta</SelectItem>
                <SelectItem value="Média">Prioridade: Média</SelectItem>
                <SelectItem value="Baixa">Prioridade: Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setShowAddColumn(!showAddColumn)}>
              <Columns className="h-4 w-4" />
              Gerenciar Colunas
            </Button>

            <Button onClick={handleOpenAddModal}>
              <Plus className="h-4.5 w-4.5" />
              Nova Missão
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAddColumn && (
        <Card className="bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Columns className="h-4 w-4 text-primary" />
              Gerenciar Quadro Kanban
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAddColumn(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider">Criar Nova Coluna</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <form onSubmit={handleAddColumnSubmit} className="space-y-3">
                    {columnError && (
                      <div className="text-destructive text-xs flex items-center gap-1.5 bg-destructive/10 p-2 rounded-lg">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{columnError}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Ex: Em Homologação, Bloqueado..."
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        required
                      />
                      <Button type="submit" size="sm">
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider">
                    Colunas Ativas ({columns.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {columns.map((col) => {
                      const isSystemCol = ['pendente', 'em andamento', 'concluído'].includes(col.toLowerCase());
                      return (
                        <div
                          key={col}
                          className="flex items-center gap-1.5 bg-muted border rounded-lg py-1 px-2.5 text-xs text-foreground font-medium"
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', getColumnDotColor(col))} />
                          <span>{col}</span>
                          {!isSystemCol && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-destructive ml-1"
                              onClick={() => handleRemoveColumn(col)}
                              title="Excluir Coluna"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>Colunas padrões de sistema não podem ser removidas.</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-6 min-w-max" style={{ minHeight: '520px' }}>
          {columns.map((columnStatus) => {
            const tasksInCol = filteredMissoes.filter(t => t.status === columnStatus);
            const isTargeted = dragOverColumn === columnStatus;

            return (
              <Card
                key={columnStatus}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverColumn(columnStatus);
                }}
                onDragLeave={() => {
                  setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (taskId) {
                    onUpdateMissaoStatus(taskId, columnStatus);
                  }
                  setDragOverColumn(null);
                }}
                className={cn(
                  'w-80 flex flex-col',
                  isTargeted
                    ? 'bg-accent/50 border-primary border-dashed border-2 ring-4 ring-primary/5 shadow-inner'
                    : 'bg-muted/50'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 rounded-full', getColumnDotColor(columnStatus))} />
                      <CardTitle className="text-sm tracking-tight">{columnStatus}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-bold">
                      {tasksInCol.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3.5 overflow-y-auto pr-1 max-h-[500px]">
                  {tasksInCol.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground text-xs border border-dashed rounded-xl bg-background/40">
                      Solte as tarefas aqui
                    </div>
                  ) : (
                    tasksInCol.map((task) => {
                      const isTaskDragging = draggingTaskId === task.id;
                      const taskOverdue = isOverdue(task.prazo) && task.status !== 'Concluído';

                      return (
                        <Card
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task.id);
                            setDraggingTaskId(task.id);
                          }}
                          onDragEnd={() => {
                            setDraggingTaskId(null);
                          }}
                          className={cn(
                            'cursor-grab active:cursor-grabbing select-none transition-all hover:-translate-y-0.5 hover:shadow-md',
                            isTaskDragging ? 'opacity-30 border-dashed border-muted-foreground/30' : ''
                          )}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-muted-foreground tracking-wider">
                                {getJiraId(task.id)}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <Badge className={cn(getPriorityStyle(task.prioridade), 'uppercase')}>
                                  {task.prioridade}
                                </Badge>

                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    onClick={() => handleOpenEditModal(task)}
                                    title="Editar Missão"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => onRemoveMissao(task.id)}
                                    title="Remover Missão"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <h5 className="font-semibold text-foreground text-xs md:text-[13px] leading-snug group-hover:text-primary transition-colors">
                                {task.titulo}
                              </h5>
                              <p className="text-muted-foreground text-[11px] leading-normal line-clamp-3">
                                {task.descricao}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-lg w-max max-w-full">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{task.municipioNome}</span>
                            </div>

                            <div className="border-t pt-3 flex items-center justify-between text-[11px] font-medium">
                              <div className={cn(
                                'flex items-center gap-1',
                                taskOverdue
                                  ? 'text-destructive font-semibold'
                                  : task.status === 'Concluído'
                                    ? 'text-emerald-600'
                                    : 'text-muted-foreground'
                              )}>
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-[10px]">
                                  {task.prazo} {taskOverdue && '(Atrasada)'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground max-w-[70px] truncate" title={task.responsavel}>
                                  {task.responsavel.split(' ')[0]}
                                </span>
                                <div
                                  className={cn('h-6 w-6 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0', getAvatarBg(task.responsavel))}
                                  title={task.responsavel}
                                >
                                  {getInitials(task.responsavel)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={showAddForm} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {editingMissao ? 'Editar Missão de Apoio' : 'Criar Missão de Apoio'}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes para {editingMissao ? 'editar a' : 'criar uma nova'} missão de apoio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTask}>
            <div className="space-y-4">
              {formError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Missão *</Label>
                <Input
                  id="titulo"
                  type="text"
                  placeholder="Ex: Auditoria Fiscal de Merenda"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipio">Município Alvo *</Label>
                <Select value={municipioId} onValueChange={setMunicipioId}>
                  <SelectTrigger id="municipio">
                    <SelectValue placeholder="Selecione um município" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.filter(m => m.status === 'Ativo').map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nome} ({m.estado})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável pela Ação *</Label>
                <Select value={responsavel} onValueChange={setResponsavel}>
                  <SelectTrigger id="responsavel">
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map(u => (
                      <SelectItem key={u.id} value={u.nome}>{u.nome} ({u.cargo})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prazo">Prazo Limite *</Label>
                  <Input
                    id="prazo"
                    type="date"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select value={prioridade} onValueChange={(value) => setPrioridade(value as 'Alta' | 'Média' | 'Baixa')}>
                    <SelectTrigger id="prioridade">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status / Coluna</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Detalhada *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Instruções de apoio ou plano de execução..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="h-24 resize-none"
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMissao ? 'Salvar Alterações' : 'Criar Missão'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}