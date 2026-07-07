/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, Bell, LogOut, CheckCircle2, Shield, Calendar, Landmark } from 'lucide-react';
import { Usuario, Alerta } from '../types';

interface HeaderProps {
  title: string;
  user: Usuario | null;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
  alertas: Alerta[];
  onMarkAlertaLido: (id: string) => void;
  onGoToView: (view: string) => void;
}

export default function Header({
  title,
  user,
  onLogout,
  onMobileMenuToggle,
  alertas,
  onMarkAlertaLido,
  onGoToView
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadAlerts = alertas.filter(a => !a.lido);

  const getTitleIcon = () => {
    switch(title) {
      case 'Centro de Decisão': return '📊';
      case 'Municípios Clientes': return '🗺️';
      case 'Controle de Usuários': return '👥';
      case 'Indicadores Globais': return '⚙️';
      case 'Resultados & Metas': return '📈';
      case 'Alerta de Metas': return '🔔';
      case 'Plano de Missões': return '✅';
      case 'Arquitetura Next.js': return '🏗️';
      default: return '💼';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="icon">
            {getTitleIcon()}
          </span>
          <h1 className="text-lg font-semibold text-slate-800 tracking-tight md:text-xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Server Indicator (Minimal and Clean, strictly for real info/UTC) */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Julho 2026</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Região: Brasil</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-100 transition-all relative"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay Backdrop */}
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
              
              <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-100">
                <div className="p-4 bg-slate-50 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-800">Alertas Recentes</h3>
                  <button 
                    onClick={() => {
                      onGoToView('alertas');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Ver todos
                  </button>
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {unreadAlerts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="h-8 w-8 text-indigo-500 mx-auto mb-2 opacity-60" />
                      Todos os indicadores sob controle.
                    </div>
                  ) : (
                    unreadAlerts.map((alerta) => (
                      <div key={alerta.id} className="p-3.5 hover:bg-slate-50/80 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            alerta.criticidade === 'Alta' 
                              ? 'bg-rose-100 text-rose-700' 
                              : alerta.criticidade === 'Média' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {alerta.criticidade}
                          </span>
                          <span className="text-[10px] text-slate-400">{alerta.data}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-800 mb-0.5">{alerta.titulo}</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed mb-2 line-clamp-2">{alerta.mensagem}</p>
                        <button 
                          onClick={() => onMarkAlertaLido(alerta.id)}
                          className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          Marcar como lido
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Account / Sign Out */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-700">{user.nome}</span>
              <span className="text-[11px] font-medium text-slate-400 capitalize">{user.cargo.toLowerCase()}</span>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
