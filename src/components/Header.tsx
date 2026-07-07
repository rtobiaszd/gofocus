'use client';

import { useState } from 'react';
import { Bell, LogOut, CheckCircle2, Calendar, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Usuario, Alerta } from '@/types';

interface HeaderProps {
  title: string;
  user: Usuario | null;
  onLogout: () => void;
  alertas: Alerta[];
  onMarkAlertaLido: (id: string) => void;
  onGoToView: (view: string) => void;
  onEditPerfil: () => void;
}

const titleIcons: Record<string, string> = {
  'Centro de Decisão': '\u{1F4CA}',
  'Municípios Clientes': '\u{1F5FA}\uFE0F',
  'Controle de Usuários': '\u{1F465}',
  'Indicadores Globais': '\u2699\uFE0F',
  'Resultados & Metas': '\u{1F4C8}',
  'Alerta de Metas': '\u{1F514}',
  'Plano de Missões': '\u2705',
  'Arquitetura Next.js': '\u{1F3D7}\uFE0F',
};

function getTitleIcon(title: string): string {
  return titleIcons[title] || '\u{1F4BC}';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Header({
  title,
  user,
  onLogout,
  alertas,
  onMarkAlertaLido,
  onGoToView,
  onEditPerfil,
}: HeaderProps) {
  const unreadAlerts = alertas.filter((a) => !a.lido);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="icon">
            {getTitleIcon(title)}
          </span>
          <h1 className="text-lg font-semibold text-slate-800 tracking-tight md:text-xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Julho 2026</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>Região: Brasil</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative p-2 rounded-xl border-slate-100 text-slate-600"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadAlerts.length > 0 && (
                <Badge
                  variant="destructive"
                  className={cn(
                    'absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1',
                    'flex items-center justify-center text-[10px] font-bold',
                    'animate-bounce shadow-md'
                  )}
                >
                  {unreadAlerts.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 md:w-96 p-0 overflow-hidden"
          >
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-800">
                Alertas Recentes
              </h3>
              <Button
                variant="link"
                size="sm"
                className="text-xs font-medium text-indigo-600 h-auto p-0"
                onClick={() => {
                  onGoToView('alertas');
                }}
              >
                Ver todos
              </Button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
              {unreadAlerts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="h-8 w-8 text-indigo-500 mx-auto mb-2 opacity-60" />
                  Todos os indicadores sob controle.
                </div>
              ) : (
                unreadAlerts.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="p-3.5 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 uppercase',
                          alerta.criticidade === 'Alta'
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : alerta.criticidade === 'Média'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                        )}
                      >
                        {alerta.criticidade}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {alerta.data}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-800 mb-0.5">
                      {alerta.titulo}
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed mb-2 line-clamp-2">
                      {alerta.mensagem}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-[10px] font-semibold text-indigo-600 h-auto p-0"
                      onClick={() => onMarkAlertaLido(alerta.id)}
                    >
                      Marcar como lido
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden sm:flex items-center gap-2 h-auto py-1 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.nome} />
                    <AvatarFallback className="text-xs font-semibold bg-indigo-100 text-indigo-700">
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-700 leading-tight">
                      {user.nome}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 capitalize leading-tight">
                      {user.cargo.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-slate-400 font-medium">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEditPerfil} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Editar Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
