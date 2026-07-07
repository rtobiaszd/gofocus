'use client'

import React, { useState } from 'react';
import { Search, Plus, AlertTriangle, Edit, Trash2, Target } from 'lucide-react';
import { Indicador } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface IndicadoresViewProps {
  indicadores: Indicador[];
  onAddIndicador: (indicador: Omit<Indicador, 'id'>) => void;
  onEditIndicador: (id: string, updatedFields: Partial<Indicador>) => void;
  onRemoveIndicador: (id: string) => void;
}

export default function IndicadoresView({
  indicadores,
  onAddIndicador,
  onEditIndicador,
  onRemoveIndicador
}: IndicadoresViewProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [showAddForm, setShowAddForm] = useState(false);

  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [categoria, setCategoria] = useState<'Educação' | 'Saúde' | 'Segurança' | 'Finanças' | 'Saneamento'>('Educação');
  const [descricao, setDescricao] = useState('');
  const [meta, setMeta] = useState('');
  const [valorAtual, setValorAtual] = useState('');
  const [unidade, setUnidade] = useState<'porcentagem' | 'financeiro' | 'taxa' | 'quantidade'>('porcentagem');
  const [error, setError] = useState('');

  const [editingIndicador, setEditingIndicador] = useState<Indicador | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editSigla, setEditSigla] = useState('');
  const [editCategoria, setEditCategoria] = useState<'Educação' | 'Saúde' | 'Segurança' | 'Finanças' | 'Saneamento'>('Educação');
  const [editDescricao, setEditDescricao] = useState('');
  const [editMeta, setEditMeta] = useState('');
  const [editValorAtual, setEditValorAtual] = useState('');
  const [editUnidade, setEditUnidade] = useState<'porcentagem' | 'financeiro' | 'taxa' | 'quantidade'>('porcentagem');
  const [editError, setEditError] = useState('');

  const startEdit = (ind: Indicador) => {
    setEditingIndicador(ind);
    setEditNome(ind.nome);
    setEditSigla(ind.sigla);
    setEditCategoria(ind.categoria);
    setEditDescricao(ind.descricao);
    setEditMeta(ind.meta.toString());
    setEditValorAtual(ind.valorAtual.toString());
    setEditUnidade(ind.unidade);
    setEditError('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndicador) return;

    if (!editNome.trim() || !editSigla.trim() || !editDescricao.trim() || !editMeta.trim() || !editValorAtual.trim()) {
      setEditError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const metaVal = parseFloat(editMeta);
    const atualVal = parseFloat(editValorAtual);

    if (isNaN(metaVal) || isNaN(atualVal)) {
      setEditError('A meta e o valor atual devem ser numéricos.');
      return;
    }

    onEditIndicador(editingIndicador.id, {
      nome: editNome.trim(),
      sigla: editSigla.trim().toUpperCase(),
      categoria: editCategoria,
      descricao: editDescricao.trim(),
      meta: metaVal,
      valorAtual: atualVal,
      unidade: editUnidade
    });

    setEditingIndicador(null);
  };

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

  const clearAddForm = () => {
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

  const clearEditForm = () => {
    setEditingIndicador(null);
    setEditError('');
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Educação': return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-50';
      case 'Saúde': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50';
      case 'Finanças': return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50';
      case 'Segurança': return 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50';
      case 'Saneamento': return 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-50';
      default: return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-50';
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
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, sigla ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Todas as Áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Áreas</SelectItem>
                  <SelectItem value="Educação">Área: Educação</SelectItem>
                  <SelectItem value="Saúde">Área: Saúde</SelectItem>
                  <SelectItem value="Finanças">Área: Finanças</SelectItem>
                  <SelectItem value="Segurança">Área: Segurança</SelectItem>
                  <SelectItem value="Saneamento">Área: Saneamento</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showAddForm} onOpenChange={(open) => {
                if (!open) clearAddForm();
                else setShowAddForm(true);
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" />
                    Novo Indicador
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Indicador</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo indicador estratégico.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-xs flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="nome">Nome do Indicador *</Label>
                        <Input
                          id="nome"
                          placeholder="Ex: Cobertura Vacinal Geral"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sigla">Sigla *</Label>
                        <Input
                          id="sigla"
                          placeholder="Ex: COB_VAC"
                          value={sigla}
                          onChange={(e) => setSigla(e.target.value)}
                          className="font-mono font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria (Área)</Label>
                        <Select value={categoria} onValueChange={(val) => setCategoria(val as any)}>
                          <SelectTrigger id="categoria">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Educação">Educação</SelectItem>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                            <SelectItem value="Finanças">Finanças</SelectItem>
                            <SelectItem value="Segurança">Segurança</SelectItem>
                            <SelectItem value="Saneamento">Saneamento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unidade">Unidade de Medida</Label>
                        <Select value={unidade} onValueChange={(val) => setUnidade(val as any)}>
                          <SelectTrigger id="unidade">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="porcentagem">Porcentagem (%)</SelectItem>
                            <SelectItem value="taxa">Taxa / Índice (Ponto decimal)</SelectItem>
                            <SelectItem value="quantidade">Quantidade Absoluta</SelectItem>
                            <SelectItem value="financeiro">Monetário (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição Técnica / Fórmula *</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Explique como esse indicador é calculado..."
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="h-20 resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="meta">Meta Nacional/Local *</Label>
                        <Input
                          id="meta"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 95"
                          value={meta}
                          onChange={(e) => setMeta(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valorAtual">Valor Atual Médio *</Label>
                        <Input
                          id="valorAtual"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 85"
                          value={valorAtual}
                          onChange={(e) => setValorAtual(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={clearAddForm}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Criar Indicador
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores Estratégicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sigla</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Valor Atual</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIndicadores.map((ind) => {
                const percentOfMeta = Math.min(Math.round((ind.valorAtual / ind.meta) * 100), 100);
                return (
                  <TableRow key={ind.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-black bg-foreground text-background px-2 py-0.5 rounded tracking-wider">
                        {ind.sigla}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{ind.nome}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed max-w-[250px] truncate">{ind.descricao}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('font-semibold text-xs', getCategoryColor(ind.categoria))}>
                        {ind.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        {formatValue(ind.meta, ind.unidade)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'text-sm font-medium',
                        ind.valorAtual >= ind.meta ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {formatValue(ind.valorAtual, ind.unidade)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              percentOfMeta >= 100 ? 'bg-emerald-500' : percentOfMeta >= 85 ? 'bg-amber-500' : 'bg-rose-500'
                            )}
                            style={{ width: `${percentOfMeta}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground shrink-0 w-9 text-right">{percentOfMeta}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(ind)}
                          title="Editar Indicador"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Deseja realmente remover o indicador ${ind.nome}?`)) {
                              onRemoveIndicador(ind.id);
                            }
                          }}
                          title="Excluir Indicador"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredIndicadores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Nenhum indicador cadastrado nesta categoria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingIndicador} onOpenChange={(open) => { if (!open) clearEditForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Indicador</DialogTitle>
            <DialogDescription>
              Altere os dados do indicador selecionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-nome">Nome do Indicador *</Label>
                <Input
                  id="edit-nome"
                  placeholder="Ex: Cobertura Vacinal Geral"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sigla">Sigla *</Label>
                <Input
                  id="edit-sigla"
                  placeholder="Ex: COB_VAC"
                  value={editSigla}
                  onChange={(e) => setEditSigla(e.target.value)}
                  className="font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-categoria">Categoria (Área)</Label>
                <Select value={editCategoria} onValueChange={(val) => setEditCategoria(val as any)}>
                  <SelectTrigger id="edit-categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
                    <SelectItem value="Finanças">Finanças</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Saneamento">Saneamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unidade">Unidade de Medida</Label>
                <Select value={editUnidade} onValueChange={(val) => setEditUnidade(val as any)}>
                  <SelectTrigger id="edit-unidade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentagem">Porcentagem (%)</SelectItem>
                    <SelectItem value="taxa">Taxa / Índice (Ponto decimal)</SelectItem>
                    <SelectItem value="quantidade">Quantidade Absoluta</SelectItem>
                    <SelectItem value="financeiro">Monetário (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição Técnica / Fórmula *</Label>
              <Textarea
                id="edit-descricao"
                placeholder="Explique como esse indicador é calculado..."
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
                className="h-20 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-meta">Meta Nacional/Local *</Label>
                <Input
                  id="edit-meta"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 95"
                  value={editMeta}
                  onChange={(e) => setEditMeta(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-valorAtual">Valor Atual Médio *</Label>
                <Input
                  id="edit-valorAtual"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 85"
                  value={editValorAtual}
                  onChange={(e) => setEditValorAtual(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={clearEditForm}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
