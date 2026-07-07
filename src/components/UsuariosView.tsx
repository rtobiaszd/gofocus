'use client'

import React, { useState } from 'react';
import { Search, Plus, UserCheck, Mail, Trash2, Pencil, Upload, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Usuario } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface UsuariosViewProps {
  usuarios: Usuario[];
  onAddUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  onToggleUsuarioStatus: (id: string) => void;
  onRemoveUsuario: (id: string) => void;
  onEditUsuario: (id: string, updatedFields: Partial<Usuario>) => void;
}

export default function UsuariosView({
  usuarios,
  onAddUsuario,
  onToggleUsuarioStatus,
  onRemoveUsuario,
  onEditUsuario
}: UsuariosViewProps) {
  const [search, setSearch] = useState('');
  const [filterCargo, setFilterCargo] = useState<string>('todos');
  const [showAddForm, setShowAddForm] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState<'Admin' | 'Gestor' | 'Agente'>('Agente');
  const [avatar, setAvatar] = useState('');
  const [senha, setSenha] = useState('');
  const [revealSenha, setRevealSenha] = useState(false);
  const [error, setError] = useState('');
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = (user: Usuario) => {
    setEditingUsuario(user);
    setNome(user.nome);
    setEmail(user.email);
    setCargo(user.cargo);
    setAvatar(user.avatar || '');
    setSenha(user.senha || 'senha123');
    setShowAddForm(true);
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setEditingUsuario(null);
    setNome('');
    setEmail('');
    setCargo('Agente');
    setAvatar('');
    setSenha('');
    setError('');
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesCargo = filterCargo === 'todos' || u.cargo === filterCargo;
    return matchesSearch && matchesCargo;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!email.includes('@')) {
      setError('E-mail inválido.');
      return;
    }

    if (!senha.trim()) {
      setError('Por favor, defina uma senha de acesso.');
      return;
    }

    const finalAvatar = avatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    if (editingUsuario) {
      onEditUsuario(editingUsuario.id, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cargo,
        avatar: finalAvatar,
        senha: senha.trim()
      });
    } else {
      onAddUsuario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        cargo,
        status: 'Ativo',
        avatar: finalAvatar,
        senha: senha.trim()
      });
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
              <Select value={filterCargo} onValueChange={setFilterCargo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os Cargos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Cargos</SelectItem>
                  <SelectItem value="Admin">Cargo: Administrador</SelectItem>
                  <SelectItem value="Gestor">Cargo: Gestor</SelectItem>
                  <SelectItem value="Agente">Cargo: Agente Técnico</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showAddForm} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" />
                    Convidar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-indigo-600" />
                      {editingUsuario ? 'Editar Integrante' : 'Convidar Integrante'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingUsuario
                        ? 'Atualize os dados de acesso do colaborador.'
                        : 'Preencha os dados para criar um novo acesso ao sistema.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Nome do colaborador"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail Institucional *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ex: nome@gestao.gov.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo / Nível de Acesso</Label>
                      <Select value={cargo} onValueChange={(value: 'Admin' | 'Gestor' | 'Agente') => setCargo(value)}>
                        <SelectTrigger id="cargo">
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Agente">Agente Técnico (Apenas consulta e preenchimento)</SelectItem>
                          <SelectItem value="Gestor">Gestor Municipal (Cadastros, Missões e Alertas)</SelectItem>
                          <SelectItem value="Admin">Administrador Global (Acesso completo e Auditoria)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha de Acesso *</Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={revealSenha ? 'text' : 'password'}
                          placeholder="Defina a senha de acesso"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          className="pr-10 font-mono"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setRevealSenha(!revealSenha)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                        >
                          {revealSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Essa senha será utilizada pelo colaborador para fazer login.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Imagem de Perfil (Avatar)</Label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer group overflow-hidden',
                          isDragging
                            ? 'border-indigo-500 bg-indigo-50/50'
                            : 'border-border hover:border-indigo-400 bg-muted/50 hover:bg-muted'
                        )}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />

                        {avatar ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={avatar} alt="Profile avatar" />
                                <AvatarFallback>Avatar</AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-md group-hover:scale-110 transition-transform">
                                <Upload className="h-3 w-3" />
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground group-hover:text-indigo-600 transition-colors font-medium text-center">
                              Arraste uma imagem ou clique para substituir
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <div className="p-3 bg-background rounded-full shadow-sm text-muted-foreground group-hover:text-indigo-600 transition-colors border">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-foreground">Fazer Upload de Foto</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Arraste e solte ou clique para selecionar</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-1">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-[10px] font-bold uppercase tracking-wider h-auto p-0"
                        >
                          {showUrlInput ? 'Esconder link / gerador' : 'Ou colar link da imagem / gerar aleatório'}
                        </Button>

                        {showUrlInput && (
                          <div className="mt-2 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                placeholder="Ex: https://images.unsplash.com/..."
                                value={avatar.startsWith('data:') ? '' : avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                className="font-mono text-xs"
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  const id = 1500000000000 + Math.floor(Math.random() * 1000000);
                                  setAvatar(`https://images.unsplash.com/photo-${id}?w=150&auto=format&fit=crop&q=80`);
                                }}
                                className="whitespace-nowrap"
                              >
                                Gerar Aleatório
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseModal}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingUsuario ? 'Salvar Alterações' : 'Enviar Convite'}
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-6">Usuário</th>
                <th className="py-4 px-6">E-mail</th>
                <th className="py-4 px-6">Nível de Acesso (Cargo)</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsuarios.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'} alt={user.nome} />
                        <AvatarFallback>{user.nome.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-bold text-foreground block text-sm">{user.nome}</span>
                        <span className="text-muted-foreground text-xs font-medium">Cadastrado</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={cn(
                      'font-bold',
                      user.cargo === 'Admin'
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'
                        : user.cargo === 'Gestor'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
                          : 'bg-muted text-muted-foreground hover:bg-muted border-border'
                    )}>
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      {user.cargo}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleUsuarioStatus(user.id)}
                      className={cn(
                        'rounded-full text-xs font-semibold',
                        user.status === 'Ativo'
                          ? 'text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50'
                          : 'text-rose-700 hover:text-rose-800 hover:bg-rose-50'
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5', user.status === 'Ativo' ? 'bg-indigo-500' : 'bg-rose-500')} />
                      {user.status}
                    </Button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(user)}
                        title="Editar Integrante"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Switch
                        checked={user.status === 'Ativo'}
                        onCheckedChange={() => onToggleUsuarioStatus(user.id)}
                        title={user.status === 'Ativo' ? 'Desativar Usuário' : 'Ativar Usuário'}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveUsuario(user.id)}
                        title="Remover Acesso"
                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsuarios.length === 0 && (
          <div className="p-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">Nenhum colaborador encontrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Verifique o filtro de cargo ou faça um novo convite de acesso.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
