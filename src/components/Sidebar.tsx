'use client'

import React, { useState } from 'react'
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
  Landmark,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Usuario } from '@/types'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  user: Usuario | null
  onLogout: () => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const menuItems = [
  { id: 'dashboard', name: 'Centro de Decisão', icon: LayoutDashboard },
  { id: 'municipios', name: 'Municípios Clientes', icon: Map },
  { id: 'usuarios', name: 'Controle de Usuários', icon: Users },
  { id: 'indicadores', name: 'Indicadores Globais', icon: Sliders },
  { id: 'resultados', name: 'Resultados & Metas', icon: TrendingUp },
  { id: 'alertas', name: 'Alerta de Metas', icon: Bell, badge: true },
  { id: 'missoes', name: 'Plano de Missões', icon: CheckSquare }
]

interface SidebarContentProps {
  currentView: string
  onViewChange: (view: string) => void
  user: Usuario | null
  onLogout: () => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  mobile?: boolean
}

function SidebarContent({
  currentView,
  onViewChange,
  user,
  onLogout,
  collapsed,
  setCollapsed,
  mobile
}: SidebarContentProps) {
  const items = [
    ...menuItems,
    ...(user?.cargo === 'Admin'
      ? [{ id: 'arquitetura', name: 'Arquitetura Next.js', icon: BookOpen, accent: true as const }]
      : [])
  ]

  return (
    <div className={cn('flex flex-col h-full bg-white text-slate-600')}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100">
            <Landmark className="h-4.5 w-4.5 text-white" />
          </div>
          {(!collapsed || mobile) && (
            <span className="font-bold text-base tracking-tight text-slate-800 truncate">
              GovFocus MVP
            </span>
          )}
        </div>

        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex text-slate-400 hover:text-slate-700"
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />
            }
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && !mobile && (
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pb-2">
            Navegação
          </div>
        )}

        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          const isAdminItem = 'accent' in item && item.accent
          const showSeparator = isAdminItem && index > 0

          const button = (
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-50'
                  : isAdminItem
                    ? 'text-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                collapsed && !mobile && 'justify-center px-0'
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon
                className={cn(
                  'h-4.5 w-4.5 shrink-0',
                  isActive || isAdminItem ? 'text-indigo-600' : 'text-slate-500'
                )}
              />
              {(!collapsed || mobile) && (
                <span className="truncate">{item.name}</span>
              )}
            </Button>
          )

          return (
            <React.Fragment key={item.id}>
              {showSeparator && <Separator className="my-2" />}
              {collapsed && !mobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ) : (
                button
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* User Information Footer */}
      {user && (
        <div className={cn(
          'p-4 border-t border-slate-200 bg-slate-50',
          collapsed && !mobile && 'p-3'
        )}>
          <div className={cn(
            'flex items-center gap-3 overflow-hidden',
            collapsed && !mobile ? 'justify-center' : 'justify-between'
          )}>
            <div className="flex items-center gap-2.5 truncate">
              <Avatar className="h-8 w-8 shrink-0 border border-slate-200">
                <AvatarImage
                  src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                  alt={user.nome}
                />
                <AvatarFallback className="text-xs bg-slate-200 text-slate-600">
                  {user.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || mobile) && (
                <div className="truncate flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 truncate">{user.nome}</span>
                  <span className="text-[10px] text-slate-500 truncate capitalize">{user.cargo.toLowerCase()}</span>
                </div>
              )}
            </div>

            {(!collapsed || mobile) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                title="Sair do Sistema"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({
  currentView,
  onViewChange,
  user,
  onLogout,
  collapsed,
  setCollapsed
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <TooltipProvider>
      {/* Mobile: Sheet Drawer */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-md">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent
              currentView={currentView}
              onViewChange={(view) => {
                onViewChange(view)
                setMobileOpen(false)
              }}
              user={user}
              onLogout={onLogout}
              collapsed={false}
              setCollapsed={setCollapsed}
              mobile
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-300 border-r border-slate-200 bg-white text-slate-600',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        <SidebarContent
          currentView={currentView}
          onViewChange={onViewChange}
          user={user}
          onLogout={onLogout}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </aside>
    </TooltipProvider>
  )
}
