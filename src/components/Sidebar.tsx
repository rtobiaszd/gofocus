/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Sliders, 
  TrendingUp, 
  Bell, 
  CheckSquare, 
  BookOpen, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Landmark
} from 'lucide-react';
import { Usuario } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: Usuario | null;
  onLogout: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  user,
  onLogout,
  collapsed,
  setCollapsed
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Centro de Decisão', icon: LayoutDashboard },
    { id: 'municipios', name: 'Municípios Clientes', icon: Map },
    { id: 'usuarios', name: 'Controle de Usuários', icon: Users },
    { id: 'indicadores', name: 'Indicadores Globais', icon: Sliders },
    { id: 'resultados', name: 'Resultados & Metas', icon: TrendingUp },
    { id: 'alertas', name: 'Alerta de Metas', icon: Bell, badge: true },
    { id: 'missoes', name: 'Plano de Missões', icon: CheckSquare },
    ...(user?.cargo === 'Admin' ? [{ id: 'arquitetura', name: 'Arquitetura Next.js', icon: BookOpen, accent: true }] : [])
  ];

  return (
    <aside 
      className={`bg-white text-slate-600 flex flex-col h-screen fixed md:sticky top-0 left-0 z-30 transition-all duration-300 border-r border-slate-200 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
            <Landmark className="h-4.5 w-4.5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base tracking-tight text-slate-800 truncate">
              GovFocus MVP
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pb-2 transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
          Navegação
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : item.accent 
                    ? 'text-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-800' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                isActive ? 'text-indigo-600' : item.accent ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'
              }`} />
              
              {!collapsed && <span className="truncate">{item.name}</span>}
              
              {/* Tooltip for collapsed view */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl border border-slate-800 z-50">
                  {item.name}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Information Footer */}
      {user && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-2.5 truncate">
              <img 
                src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"} 
                alt={user.nome} 
                className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              {!collapsed && (
                <div className="truncate flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 truncate">{user.nome}</span>
                  <span className="text-[10px] text-slate-500 truncate capitalize">{user.cargo.toLowerCase()}</span>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <button 
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all shrink-0"
                title="Sair do Sistema"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
