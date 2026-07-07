/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Missao, Municipio, Usuario } from '../types';
import { 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Check, 
  X, 
  ClipboardList, 
  AlertCircle, 
  Pencil, 
  PlusCircle, 
  Columns, 
  MapPin, 
  Clock, 
  Info,
  ChevronRight,
  GripHorizontal
} from 'lucide-react';

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
  // Search and Filters
  const [search, setSearch] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState<string>('todos');
  
  // Columns management (persisted in localStorage)
  const [columns, setColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('kanban_columns');
    return saved ? JSON.parse(saved) : ['Pendente', 'Em Andamento', 'Concluído'];
  });
  
  // Add/Edit Task Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMissao, setEditingMissao] = useState<Missao | null>(null);
  
  // Form values
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [municipioId, setMunicipioId] = useState(municipios[0]?.id || '');
  const [prioridade, setPrioridade] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [responsavel, setResponsavel] = useState(usuarios[0]?.nome || '');
  const [prazo, setPrazo] = useState('2026-07-31');
  const [status, setStatus] = useState('Pendente');
  const [formError, setFormError] = useState('');

  // Column Creation States
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [columnError, setColumnError] = useState('');

  // Drag and Drop States
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filtered Tasks
  const filteredMissoes = missoes.filter(m => {
    const matchesSearch = m.titulo.toLowerCase().includes(search.toLowerCase()) || 
                          m.descricao.toLowerCase().includes(search.toLowerCase()) ||
                          m.municipioNome.toLowerCase().includes(search.toLowerCase()) ||
                          m.responsavel.toLowerCase().includes(search.toLowerCase());
    const matchesPrioridade = filterPrioridade === 'todos' || m.prioridade === filterPrioridade;
    return matchesSearch && matchesPrioridade;
  });

  // Action: Open Modal for Creating
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

  // Action: Open Modal for Editing
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

  // Close main Modal
  const handleCloseModal = () => {
    setShowAddForm(false);
    setEditingMissao(null);
    setFormError('');
  };

  // Submit Task (Add or Edit)
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
        status: status,
        prazo,
        prioridade,
        responsavel
      });
    }

    handleCloseModal();
  };

  // Create New Column
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

  // Remove Column and safe-move tasks
  const handleRemoveColumn = (colName: string) => {
    if (confirm(`Tem certeza que deseja excluir a coluna "${colName}"? As tarefas ativas nela serão movidas para a coluna "${columns[0] || 'Pendente'}".`)) {
      const defaultCol = columns[0] || 'Pendente';
      
      // Move any tasks that are currently in this deleted column to default
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

  // Colors helpers
  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case 'Alta': return 'bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold';
      case 'Média': return 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold';
      case 'Baixa': return 'bg-slate-100 text-slate-600 border-slate-200 text-xs font-bold';
      default: return 'bg-slate-50 text-slate-500 border-slate-200 text-xs';
    }
  };

  const getColumnDotColor = (colName: string) => {
    const nameLower = colName.toLowerCase();
    if (nameLower.includes('pend') || nameLower.includes('fazer') || nameLower.includes('todo')) return 'bg-rose-500';
    if (nameLower.includes('andamento') || nameLower.includes('progresso') || nameLower.includes('doing')) return 'bg-amber-500';
    if (nameLower.includes('concl') || nameLower.includes('pronto') || nameLower.includes('done') || nameLower.includes('final')) return 'bg-emerald-500';
    return 'bg-indigo-500';
  };

  // Avatar initials and unique colored hash background
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

  // Formats unique card keys to mock Jira task IDs
  const getJiraId = (id: string) => {
    const num = id.replace(/\D/g, '');
    const short = num ? num.slice(-3) : id.slice(-3).toUpperCase();
    return `MIS-${short || '101'}`;
  };

  // Check if task deadline is overdue
  const isOverdue = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    return deadline < today;
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por código, missão, descrição, responsável..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
        </div>

        {/* Filters & Actions buttons */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3 justify-between md:justify-end">
          
          {/* Priority Select */}
          <select 
            value={filterPrioridade}
            onChange={(e) => setFilterPrioridade(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 font-medium"
          >
            <option value="todos">Todas as Prioridades</option>
            <option value="Alta">Prioridade: Alta</option>
            <option value="Média">Prioridade: Média</option>
            <option value="Baixa">Prioridade: Baixa</option>
          </select>

          {/* New Column Quick Toggle */}
          <button
            onClick={() => setShowAddColumn(!showAddColumn)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-350 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Columns className="h-4 w-4 text-indigo-600" />
            <span>Gerenciar Colunas</span>
          </button>

          {/* New Task Button */}
          <button 
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-900/10 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Nova Missão</span>
          </button>
        </div>
      </div>

      {/* Add Column Inline Drawer / Panel */}
      {showAddColumn && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 animate-in slide-in-from-top-4 duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Columns className="h-4 w-4 text-indigo-600" />
              <span>Gerenciar Quadro Kanban</span>
            </h4>
            <button 
              onClick={() => setShowAddColumn(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Create form */}
            <form onSubmit={handleAddColumnSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-slate-250">
              <h5 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Criar Nova Coluna</h5>
              {columnError && (
                <div className="text-rose-600 text-xs flex items-center gap-1.5 bg-rose-50 p-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{columnError}</span>
                </div>
              )}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ex: Em Homologação, Bloqueado..." 
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all text-slate-700"
                  required
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>
            </form>

            {/* Current Columns list with delete option */}
            <div className="bg-white p-4 rounded-xl border border-slate-250 space-y-2">
              <h5 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-2">Colunas Ativas ({columns.length})</h5>
              <div className="flex flex-wrap gap-2">
                {columns.map((col, index) => {
                  const isSystemCol = ['pendente', 'em andamento', 'concluído'].includes(col.toLowerCase());
                  return (
                    <div 
                      key={col} 
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-700 font-medium"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${getColumnDotColor(col)}`}></span>
                      <span>{col}</span>
                      {!isSystemCol && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(col)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors ml-1"
                          title="Excluir Coluna"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
                <Info className="h-3 w-3" />
                <span>Colunas padrões de sistema não podem ser removidas.</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
        <div className="flex gap-6 min-w-max" style={{ minHeight: '520px' }}>
          {columns.map((columnStatus) => {
            const tasksInCol = filteredMissoes.filter(t => t.status === columnStatus);
            const isTargeted = dragOverColumn === columnStatus;
            
            return (
              <div 
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
                className={`w-80 p-4 rounded-2xl border transition-all flex flex-col ${
                  isTargeted 
                    ? 'bg-indigo-50/70 border-indigo-400 border-dashed border-2 ring-4 ring-indigo-500/5 shadow-inner' 
                    : 'bg-slate-100/70 border-slate-200/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${getColumnDotColor(columnStatus)}`}></span>
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight">{columnStatus}</h4>
                  </div>
                  <span className="bg-slate-200/90 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {tasksInCol.length}
                  </span>
                </div>

                {/* Tasks Column Cards Container */}
                <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 scrollbar-thin max-h-[500px]">
                  {tasksInCol.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white/40">
                      Solte as tarefas aqui
                    </div>
                  ) : (
                    tasksInCol.map((task) => {
                      const isTaskDragging = draggingTaskId === task.id;
                      const taskOverdue = isOverdue(task.prazo) && task.status !== 'Concluído';
                      
                      return (
                        <div 
                          key={task.id} 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task.id);
                            setDraggingTaskId(task.id);
                          }}
                          onDragEnd={() => {
                            setDraggingTaskId(null);
                          }}
                          className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition-all flex flex-col space-y-3 cursor-grab active:cursor-grabbing group select-none hover:-translate-y-0.5 hover:shadow-md ${
                            isTaskDragging ? 'opacity-30 border-dashed border-slate-300' : 'opacity-100'
                          }`}
                        >
                          {/* Jira-Style Task Header */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider">
                              {getJiraId(task.id)}
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              {/* Priority badge */}
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${getPriorityStyle(task.prioridade)}`}>
                                {task.prioridade}
                              </span>

                              {/* Dropdown Menu actions for accessibility */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleOpenEditModal(task)}
                                  className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
                                  title="Editar Missão"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => onRemoveMissao(task.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-all"
                                  title="Remover Missão"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Task Description & Info */}
                          <div className="space-y-1.5">
                            <h5 className="font-semibold text-slate-800 text-xs md:text-[13px] leading-snug group-hover:text-indigo-600 transition-colors">
                              {task.titulo}
                            </h5>
                            <p className="text-slate-500 text-[11px] leading-normal line-clamp-3">
                              {task.descricao}
                            </p>
                          </div>

                          {/* Targeted Municipality */}
                          <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50/70 border border-indigo-100/30 px-2 py-0.5 rounded-lg w-max max-w-full">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{task.municipioNome}</span>
                          </div>

                          {/* Task Footer Meta Info */}
                          <div className="border-t border-slate-100/90 pt-3 flex items-center justify-between text-[11px] font-medium">
                            {/* Deadline status with overdue check */}
                            <div className={`flex items-center gap-1 ${
                              taskOverdue 
                                ? 'text-rose-600 font-semibold' 
                                : task.status === 'Concluído' 
                                  ? 'text-emerald-600' 
                                  : 'text-slate-400'
                            }`}>
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span className="text-[10px]">
                                {task.prazo} {taskOverdue && '(Atrasada)'}
                              </span>
                            </div>

                            {/* User Initial Circle Badge */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 max-w-[70px] truncate" title={task.responsavel}>
                                {task.responsavel.split(' ')[0]}
                              </span>
                              <div 
                                className={`h-6 w-6 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarBg(task.responsavel)}`}
                                title={task.responsavel}
                              >
                                {getInitials(task.responsavel)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Add / Edit Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">
                  {editingMissao ? 'Editar Missão de Apoio' : 'Criar Missão de Apoio'}
                </h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Título da Missão *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Auditoria Fiscal de Merenda"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  required
                />
              </div>

              {/* Target Municipality */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Município Alvo *</label>
                <select 
                  value={municipioId}
                  onChange={(e) => setMunicipioId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  required
                >
                  {municipios.filter(m => m.status === 'Ativo').map(m => (
                    <option key={m.id} value={m.id}>{m.nome} ({m.estado})</option>
                  ))}
                </select>
              </div>

              {/* Assigned Responsible */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Responsável pela Ação *</label>
                <select 
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  required
                >
                  {usuarios.map(u => (
                    <option key={u.id} value={u.nome}>{u.nome} ({u.cargo})</option>
                  ))}
                </select>
              </div>

              {/* Deadline & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prazo Limite *</label>
                  <input 
                    type="date" 
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prioridade</label>
                  <select 
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Kanban Column Select (highly useful if on mobile/accessibility) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status / Coluna</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição Detalhada *</label>
                <textarea 
                  placeholder="Instruções de apoio ou plano de execução..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 h-24 resize-none"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-150 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-950/10 transition-all"
                >
                  {editingMissao ? 'Salvar Alterações' : 'Criar Missão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
