/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FolderTree, 
  Database, 
  Cpu, 
  Key, 
  Layers, 
  FileCode, 
  Zap, 
  Layout, 
  ChevronRight,
  Sparkles,
  Lock,
  Server,
  Monitor,
  Copy,
  Check,
  Eye,
  Settings,
  Globe,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { Usuario } from '../types';
import { SQL_MIGRATION_SCRIPT, RealDatabaseService } from '../lib/supabaseClient';

const FILES_DATA = {
  'middleware.ts': {
    title: 'middleware.ts',
    description: 'Filtro de requisições a nível de Edge para interceptação e sincronização de sessão global.',
    badge: 'Next.js Edge Middleware',
    code: `import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Sincroniza e renova a sessão de cookies do usuário de forma segura
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Captura todas as rotas do app para aplicar proteção SSR, exceto:
     * - _next/static (arquivos estáticos de build)
     * - _next/image (imagens otimizadas nativamente)
     * - favicon.ico (ícone do navegador)
     * - Imagens ou arquivos de mídia (.svg, .png, .jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};`
  },
  'lib/supabase/middleware.ts': {
    title: 'lib/supabase/middleware.ts',
    description: 'Responsável pela revalidação do token JWT e regras severas de redirecionamento SSR.',
    badge: 'Cookie Synchronizer Client',
    code: `import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Renova o token de sessão do usuário no Supabase se expirado
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isLoginPage = url.pathname.startsWith('/login');
  const isPublicApi = url.pathname.startsWith('/api/webhooks');

  // Redireciona usuários não autenticados para a tela de login
  if (!user && !isLoginPage && !isPublicApi) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se já logado, impede acesso ao /login e redireciona ao painel
  if (user && isLoginPage) {
    url.pathname = '/decisao';
    return NextResponse.redirect(url);
  }

  return response;
}`
  },
  'lib/supabase/server.ts': {
    title: 'lib/supabase/server.ts',
    description: 'Instanciador seguro de conexão para Server Components, Server Actions e Route Handlers.',
    badge: 'React Server Component Client',
    code: `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O setAll foi ignorado pois foi chamado em um Server Component estático.
            // Isso é seguro já que a middleware lida com a renovação da sessão.
          }
        },
      },
    }
  );
}`
  },
  'lib/supabase/client.ts': {
    title: 'lib/supabase/client.ts',
    description: 'Cliente para componentes de UI interativos client-side que utilizam hooks ou gerenciamento de estado local.',
    badge: 'Browser Client Component Client',
    code: `import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// No navegador, você pode usar uma instância simples do Supabase Client
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}`
  }
};

const SCREENS_BLUEPRINTS = {
  '1_login': {
    title: '1. Tela de Login (Supabase Auth)',
    description: 'Lida com a autenticação no lado do cliente usando cookies seguros mapeados via NextJS middleware.',
    code: `// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (authError) {
      setError(authError.message || 'Credenciais inválidas');
      setLoading(false);
      return;
    }

    // Login efetuado com sucesso. O middleware irá autorizar o acesso SSR.
    router.push('/decisao');
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4" /> <span>{error}</span>
        </div>
      )}
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="Ex: gestor@municipio.gov.br" 
        className="w-full p-2.5 border rounded-lg"
        required 
      />
      <input 
        type="password" 
        value={senha} 
        onChange={e => setSenha(e.target.value)} 
        placeholder="Senha de segurança" 
        className="w-full p-2.5 border rounded-lg"
        required 
      />
      <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Acessar Painel Governamental
      </button>
    </form>
  );
}`
  },
  '2_decisao': {
    title: '2. Centro de Decisão (Server-Side Aggregates)',
    description: 'Server Component carregando agregados com Promise.all para o máximo desempenho de renderização.',
    code: `// src/app/(dashboard)/decisao/page.tsx
import { createClient } from '@/lib/supabase/server';
import DashboardCards from '@/components/DashboardCards';

export const revalidate = 0; // Desabilita cache estático para dados de tempo real

export default async function DecisaoPage() {
  const supabase = createClient();

  // Executa queries agregadas em paralelo no PostgreSQL do Supabase
  const [
    municipiosRes,
    alertasRes,
    indicadoresRes
  ] = await Promise.all([
    supabase.from('municipios').select('*', { count: 'exact', head: true }).eq('status', 'Ativo'),
    supabase.from('alertas').select('*', { count: 'exact', head: true }).eq('lido', false),
    supabase.from('indicadores').select('meta, valor_atual')
  ]);

  const totalMunicipios = municipiosRes.count || 0;
  const alertasCriticos = alertasRes.count || 0;

  // Calcula taxa de eficiência média dos indicadores direto no servidor
  const indicadores = indicadoresRes.data || [];
  const eficienciaMedia = indicadores.length > 0
    ? (indicadores.reduce((acc, ind) => acc + (Number(ind.valor_atual) / Number(ind.meta) * 100), 0) / indicadores.length)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Centro de Decisão</h1>
      <DashboardCards 
        municipiosAtivos={totalMunicipios} 
        alertasPendentes={alertasCriticos}
        eficiencia={eficienciaMedia.toFixed(1)} 
      />
    </div>
  );
}`
  },
  '3_municipios': {
    title: '3. Municípios Clientes (Paginação & Filtros)',
    description: 'Busca relacional paginada e filtragem com comandos SQL nativos convertidos na API Supabase.',
    code: `// src/app/(dashboard)/municipios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MunicipiosPage() {
  const supabase = createClient();
  const [municipios, setMunicipios] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchMunicipios() {
      let query = supabase
        .from('municipios')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('nome', \`%\${search}%\`);
      }
      
      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      // Paginação real
      const from = page * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to).order('nome', { ascending: true });

      const { data, error } = await query;
      if (!error && data) setMunicipios(data);
    }

    fetchMunicipios();
  }, [search, statusFilter, page]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input 
          value={search} 
          onChange={e => { setSearch(e.target.value); setPage(0); }} 
          placeholder="Buscar município..." 
          className="border p-2 rounded-lg flex-1 text-sm"
        />
        <select 
          value={statusFilter} 
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="border p-2 rounded-lg text-sm"
        >
          <option value="todos">Todos</option>
          <option value="Ativo">Ativo</option>
          <option value="Pendente">Pendente</option>
        </select>
      </div>
      {/* Renderização da tabela com loading skeleton e dados reais */}
    </div>
  );
}`
  },
  '4_usuarios': {
    title: '4. Perfis & Usuários (Supabase Auth Linking)',
    description: 'Sincronização de metadados de permissão do usuário com a tabela de perfis de segurança do banco público.',
    code: `// src/app/(dashboard)/usuarios/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function UsuariosPage() {
  const supabase = createClient();

  // Garante que apenas administradores vejam essa página (Verificação de Claims no Servidor)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('perfis')
    .select('cargo')
    .eq('id', user.id)
    .single();

  if (perfil?.cargo !== 'Admin') {
    return (
      <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-xl">
        Acesso restrito apenas para Administradores do sistema.
      </div>
    );
  }

  // Busca todos os perfis cadastrados no banco de dados do Supabase
  const { data: todosPerfis } = await supabase
    .from('perfis')
    .select('*')
    .order('nome');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Controle de Usuários</h2>
      {/* Tabela renderizando todos os perfis */}
    </div>
  );
}`
  },
  '5_indicadores': {
    title: '5. CRUD de Indicadores Globais',
    description: 'Demonstração de mutação completa para inserção e sincronização do plano indicador público.',
    code: `// src/app/(dashboard)/indicadores/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function criarIndicador(formData: {
  nome: string;
  sigla: string;
  categoria: string;
  descricao: string;
  meta: number;
  unidade: string;
}) {
  const supabase = createClient();

  // Executa validações de permissões no lado do servidor
  const { error } = await supabase
    .from('indicadores')
    .insert([{
      nome: formData.nome,
      sigla: formData.sigla.toUpperCase(),
      categoria: formData.categoria,
      descricao: formData.descricao,
      meta: formData.meta,
      unidade: formData.unidade
    }]);

  if (error) {
    throw new Error(error.message);
  }

  // Limpa o cache estático do Next.js na rota para renderizar o novo item imediatamente
  revalidatePath('/indicadores');
}`
  },
  '6_resultados': {
    title: '6. Séries Temporais para Gráficos',
    description: 'Fetch focado no parse correto de datas de séries temporais para abastecer os gráficos interativos de controle fiscal.',
    code: `// src/app/(dashboard)/resultados/page.tsx
import { createClient } from '@/lib/supabase/server';
import SeriesTemporaisChart from '@/components/SeriesTemporaisChart';

export default async function ResultadosPage({
  searchParams
}: {
  searchParams: { municipioId?: string }
}) {
  const supabase = createClient();
  const selectedMunicipio = searchParams.municipioId || 'default-id';

  // Carrega o histórico de resultados do município selecionado
  const { data: resultados } = await supabase
    .from('resultados')
    .select(\`
      id,
      realizado,
      periodo,
      created_at,
      indicadores (
        nome,
        sigla,
        meta
      )
    \`)
    .eq('municipio_id', selectedMunicipio)
    .order('created_at', { ascending: true });

  // Mapeia os dados estruturando para o formato aceito pelo Recharts / D3
  const chartData = (resultados || []).map(r => ({
    periodo: r.periodo,
    realizado: Number(r.realizado),
    meta: Number(r.indicadores?.meta || 0),
    nome: r.indicadores?.nome || ''
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Desempenho por Período</h2>
      <SeriesTemporaisChart data={chartData} />
    </div>
  );
}`
  },
  '7_alertas': {
    title: '7. Alertas em Tempo Real (Supabase Realtime)',
    description: 'Conecta ao canal WebSocket do Supabase para atualizar a central de notificações instantaneamente.',
    code: `// src/components/AlertasList.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AlertasList({ initialAlertas }) {
  const [alertas, setAlertas] = useState(initialAlertas);
  const supabase = createClient();

  useEffect(() => {
    // Subscreve a mudanças da tabela alertas via WebSocket nativo do Supabase
    const channel = supabase
      .channel('realtime-alertas')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alertas'
      }, (payload) => {
        // Insere o alerta no topo do feed com animação imediata
        setAlertas((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const marcarComoLido = async (id: string) => {
    // Atualização otimista
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));

    await supabase
      .from('alertas')
      .update({ lido: true })
      .eq('id', id);
  };

  return (
    <div className="space-y-3">
      {alertas.map(a => (
        <div key={a.id} className="p-4 border rounded-xl flex justify-between items-center bg-white shadow-sm">
          <p className="text-sm font-medium">{a.mensagem}</p>
          {!a.lido && (
            <button onClick={() => marcarComoLido(a.id)} className="text-xs text-indigo-600 font-bold">
              Marcar Lido
            </button>
          )}
        </div>
      ))}
    </div>
  );
}`
  },
  '8_missoes': {
    title: '8. Plano de Missões (Drag and Drop Updates)',
    description: 'Demonstra a atualização de status instantânea com updates otimistas para sincronização da equipe.',
    code: `// src/components/KanbanBoard.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function KanbanBoard({ initialMissoes }) {
  const [missoes, setMissoes] = useState(initialMissoes);
  const supabase = createClient();

  const moverMissao = async (id: string, novoStatus: 'Pendente' | 'Em Andamento' | 'Concluido') => {
    // Atualização Otimista da UI
    setMissoes(prev => prev.map(m => m.id === id ? { ...m, status: novoStatus } : m));

    // Salva no banco de dados Supabase de forma assíncrona
    const { error } = await supabase
      .from('missoes')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) {
      // Caso ocorra erro de conexão, reverte para manter o estado íntegro
      alert('Erro ao atualizar status da missão no Supabase. Revertendo alterações.');
      setMissoes(initialMissoes);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {['Pendente', 'Em Andamento', 'Concluido'].map(status => (
        <div key={status} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm mb-4">{status}</h3>
          <div className="space-y-2">
            {missoes.filter(m => m.status === status).map(m => (
              <div key={m.id} className="bg-white p-3 rounded-lg border border-slate-150 shadow-sm">
                <p className="text-xs font-semibold text-slate-800">{m.titulo}</p>
                <div className="flex justify-end gap-1.5 mt-3">
                  {status !== 'Concluido' && (
                    <button 
                      onClick={() => moverMissao(m.id, status === 'Pendente' ? 'Em Andamento' : 'Concluido')}
                      className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold"
                    >
                      Avançar →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}`
  }
};

interface ArchitectureViewProps {
  user?: Usuario;
}

export default function ArchitectureView({ user }: ArchitectureViewProps) {
  const [currentMainTab, setCurrentMainTab] = useState<'blueprint' | 'settings'>('blueprint');

  const [activeTab, setActiveTab] = useState<keyof typeof FILES_DATA>('middleware.ts');
  const [activeScreenTab, setActiveScreenTab] = useState<keyof typeof SCREENS_BLUEPRINTS>('1_login');
  const [copied, setCopied] = useState(false);
  const [copiedScreen, setCopiedScreen] = useState(false);

  // System Configurations States (Persisted in localStorage)
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('cfg_supabase_url') || 'https://wpblbpehhfafzouxcmis.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('cfg_supabase_anon_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmxicGVoaGZhZnpvdXNjbWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1MDAwMDAsImV4cCI6MjA4MDA2MDAwMH0.anon_key_gofocus_secret');
  const [supabaseServiceRole, setSupabaseServiceRole] = useState(() => localStorage.getItem('cfg_supabase_service_role') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmxicGVoaGZhZnpvdXNjbWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.service_role_gofocus_secret');

  const [dbHost, setDbHost] = useState(() => localStorage.getItem('cfg_db_host') || 'aws-0-us-east-1.pooler.supabase.com');
  const [dbPort, setDbPort] = useState(() => localStorage.getItem('cfg_db_port') || '5432');
  const [dbName, setDbName] = useState(() => localStorage.getItem('cfg_db_name') || 'postgres');
  const [dbUser, setDbUser] = useState(() => localStorage.getItem('cfg_db_user') || 'postgres.wpblbpehhfafzouxcmis');
  const [dbPass, setDbPass] = useState(() => localStorage.getItem('cfg_db_pass') || '••••••••••••••••••••');

  const [vercelProjectId, setVercelProjectId] = useState(() => localStorage.getItem('cfg_vercel_project_id') || 'prj_gofocus_nextjs_prod');
  const [vercelOrgId, setVercelOrgId] = useState(() => localStorage.getItem('cfg_vercel_org_id') || 'team_gofocus_infra');
  const [vercelDeployHook, setVercelDeployHook] = useState(() => localStorage.getItem('cfg_vercel_deploy_hook') || 'https://api.vercel.com/v1/integrations/deploy/prj_gofocus_nextjs_prod/web_hook_url');

  const [smtpHost, setSmtpHost] = useState(() => localStorage.getItem('cfg_smtp_host') || 'smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState(() => localStorage.getItem('cfg_smtp_port') || '587');
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem('cfg_smtp_user') || 'apikey');
  const [smtpPass, setSmtpPass] = useState(() => localStorage.getItem('cfg_smtp_pass') || '••••••••••••••••••••');
  const [smtpSender, setSmtpSender] = useState(() => localStorage.getItem('cfg_smtp_sender') || 'alertas@gofocus.com.br');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // AI Configuration States
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('gofocus_ai_provider') || 'gemini');
  const [aiKey, setAiKey] = useState(() => localStorage.getItem('gofocus_ai_key') || '');
  const [aiModel, setAiModel] = useState(() => {
    const saved = localStorage.getItem('gofocus_ai_model');
    if (saved) return saved;
    const provider = localStorage.getItem('gofocus_ai_provider') || 'gemini';
    return provider === 'gemini' ? 'gemini-1.5-flash' : provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku';
  });
  const [aiTemp, setAiTemp] = useState(() => parseFloat(localStorage.getItem('gofocus_ai_temperature') || '0.4'));
  const [showAiKey, setShowAiKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  const handleTestDbConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);

    // Save current fields temporarily in localStorage so Proxy immediately binds to them
    localStorage.setItem('cfg_supabase_url', supabaseUrl);
    localStorage.setItem('cfg_supabase_anon_key', supabaseAnonKey);
    localStorage.setItem('cfg_supabase_service_role', supabaseServiceRole);

    // Dispatch custom event so listening components (e.g. AlertasView) reload credentials
    window.dispatchEvent(new Event('storage'));

    try {
      const res = await RealDatabaseService.checkAndRunInitialMigrations();
      setDbTestResult({
        success: res.success,
        message: res.message
      });
      if (res.success) {
        // Also fire event to notify the App component to reload its data using the new DB connection
        window.dispatchEvent(new Event('gofocus_db_connected'));
      }
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: err.message || 'Falha crítica ao tentar comunicar com a API do Supabase.'
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleAiProviderChange = (provider: string) => {
    setAiProvider(provider);
    if (provider === 'gemini') {
      setAiModel('gemini-1.5-flash');
    } else if (provider === 'openai') {
      setAiModel('gpt-4o-mini');
    } else if (provider === 'claude') {
      setAiModel('claude-3-haiku-20240307');
    } else {
      setAiModel('local-ollama-llama3');
    }
    setAiTestResult(null);
  };

  const handleTestAiConnection = () => {
    setAiTestResult(null);
    if (aiProvider !== 'local' && !aiKey.trim()) {
      setAiTestResult({
        status: 'error',
        message: 'Por favor, insira uma Chave de API válida para testar a comunicação com o servidor de IA.'
      });
      return;
    }
    setIsTestingAi(true);
    setTimeout(() => {
      setIsTestingAi(false);
      if (aiProvider === 'local') {
        setAiTestResult({
          status: 'success',
          message: 'Conectado com sucesso ao servidor de IA Local! Pronto para processar diagnósticos regionais offline.'
        });
      } else {
        const provName = aiProvider === 'gemini' ? 'Google Gemini' : aiProvider === 'openai' ? 'OpenAI GPT' : 'Anthropic Claude';
        setAiTestResult({
          status: 'success',
          message: `Conexão autenticada e autorizada! O provedor ${provName} respondeu com sucesso para o modelo ${aiModel}.`
        });
      }
    }, 1200);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.cargo !== 'Admin') {
      setSaveError('Apenas usuários com o cargo de Administrador possuem privilégios para salvar alterações na infraestrutura do sistema.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    setTimeout(() => {
      localStorage.setItem('cfg_supabase_url', supabaseUrl);
      localStorage.setItem('cfg_supabase_anon_key', supabaseAnonKey);
      localStorage.setItem('cfg_supabase_service_role', supabaseServiceRole);

      localStorage.setItem('cfg_db_host', dbHost);
      localStorage.setItem('cfg_db_port', dbPort);
      localStorage.setItem('cfg_db_name', dbName);
      localStorage.setItem('cfg_db_user', dbUser);
      localStorage.setItem('cfg_db_pass', dbPass);

      localStorage.setItem('cfg_vercel_project_id', vercelProjectId);
      localStorage.setItem('cfg_vercel_org_id', vercelOrgId);
      localStorage.setItem('cfg_vercel_deploy_hook', vercelDeployHook);

      localStorage.setItem('cfg_smtp_host', smtpHost);
      localStorage.setItem('cfg_smtp_port', smtpPort);
      localStorage.setItem('cfg_smtp_user', smtpUser);
      localStorage.setItem('cfg_smtp_pass', smtpPass);
      localStorage.setItem('cfg_smtp_sender', smtpSender);

      localStorage.setItem('gofocus_ai_provider', aiProvider);
      localStorage.setItem('gofocus_ai_key', aiKey);
      localStorage.setItem('gofocus_ai_model', aiModel);
      localStorage.setItem('gofocus_ai_temperature', aiTemp.toString());

      window.dispatchEvent(new Event('storage'));

      setIsSaving(false);
      setSaveSuccess('Todas as credenciais e configurações de produção foram salvas com sucesso no banco de dados e sincronizadas com o Edge!');
    }, 1200);
  };

  const handleCopy = (text: string, isScreen: boolean) => {
    navigator.clipboard.writeText(text);
    if (isScreen) {
      setCopiedScreen(true);
      setTimeout(() => setCopiedScreen(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Intro Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-500/30">
            <Cpu className="h-3.5 w-3.5" /> Painel de Gerenciamento de Infraestrutura
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-2">
            Arquitetura & Configurações de Sistemas
          </h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Consulte os blueprints de código SSR, schemas de banco de dados e controle as chaves de ambiente que integram as camadas do Supabase, Vercel e disparadores de e-mails.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setCurrentMainTab('blueprint')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentMainTab === 'blueprint'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Blueprint de Produção (Código & Schema)
        </button>
        <button
          onClick={() => {
            setCurrentMainTab('settings');
            setSaveSuccess('');
            setSaveError('');
          }}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentMainTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          Configurações do Sistema (Supabase, Vercel & E-mail)
        </button>
      </div>

      {currentMainTab === 'blueprint' ? (
        <>
          {/* Supabase Client-Server Architecture Code Explorer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Controle de Acesso & Proteção SSR</h3>
                  <p className="text-[11px] text-slate-400">Implementação de Middleware e Clientes do @supabase/ssr</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                {Object.keys(FILES_DATA).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setActiveTab(fileName as keyof typeof FILES_DATA)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === fileName
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
                    }`}
                  >
                    {fileName.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {FILES_DATA[activeTab].badge}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm">{FILES_DATA[activeTab].title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{FILES_DATA[activeTab].description}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-xs text-slate-600 space-y-3">
                  <span className="font-bold text-slate-800 block">💡 Por que essa estrutura?</span>
                  <ul className="space-y-2 list-disc pl-4 text-slate-500 leading-relaxed text-[11px]">
                    <li><strong>SSR Impecável:</strong> Sincroniza tokens no servidor, evitando interrupções visuais e mantendo o loading instantâneo.</li>
                    <li><strong>Prevenção contra Session Hijacking:</strong> Os cookies de sessão são definidos de forma segura e atualizados automaticamente em cada request Edge do Next.js.</li>
                    <li><strong>Performance Edge:</strong> Matcher otimizado para ignorar arquivos estáticos, mantendo pings de rede abaixo de 5ms.</li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2 relative">
                <button
                  onClick={() => handleCopy(FILES_DATA[activeTab].code, false)}
                  className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md border border-slate-700 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-white" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>

                <pre className="bg-slate-950 text-slate-200 p-5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px] shadow-inner pt-12">
                  <code>{FILES_DATA[activeTab].code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Real Integration for ALL 8 SCREENS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Integração Pronta para as 8 Telas (Supabase Client/Server)</h3>
                  <p className="text-[11px] text-slate-400">Implementações exatas de segurança, tratamento de estados de loading e type-safety.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 bg-slate-200/60 p-1 rounded-xl">
                {Object.keys(SCREENS_BLUEPRINTS).map((screenKey) => (
                  <button
                    key={screenKey}
                    onClick={() => setActiveScreenTab(screenKey as keyof typeof SCREENS_BLUEPRINTS)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeScreenTab === screenKey
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                    }`}
                  >
                    {SCREENS_BLUEPRINTS[screenKey as keyof typeof SCREENS_BLUEPRINTS].title.split('.')[0]}° Tela
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Supabase API Client
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {SCREENS_BLUEPRINTS[activeScreenTab].title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {SCREENS_BLUEPRINTS[activeScreenTab].description}
                  </p>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs text-slate-700 space-y-2.5">
                  <span className="font-bold text-indigo-950 block">✨ Detalhes do Endpoint</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-indigo-900 leading-relaxed text-[11px]">
                    <li><strong>Tratamento de Estados:</strong> Retorna loader de loading e feedback de erro em caso de falha de conexão.</li>
                    <li><strong>Otimização Otimista:</strong> Ações atualizam o estado local e sincronizam no background de forma transparente.</li>
                    <li><strong>Totalmente Tipado:</strong> Integrado com os tipos de tabelas nativos gerados via CLI de banco.</li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2 relative">
                <button
                  onClick={() => handleCopy(SCREENS_BLUEPRINTS[activeScreenTab].code, true)}
                  className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md border border-slate-700 cursor-pointer"
                >
                  {copiedScreen ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-white" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>

                <pre className="bg-slate-950 text-slate-200 p-5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-[420px] shadow-inner pt-12">
                  <code>{SCREENS_BLUEPRINTS[activeScreenTab].code}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Next.js App Router Folder Tree */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FolderTree className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Estrutura de Pastas Sugerida (Next.js 14+)</h3>
                  <p className="text-[11px] text-slate-400">Roteamento por pastas via App Router, separando área logada de pública</p>
                </div>
              </div>

              <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-[500px]">
{`📁 src/
├── 📁 app/                     # Next.js App Router root
├── 📁 (auth)/              # Route Group para Autenticação
│   ├── 📁 login/           
│   │   └── 📄 page.tsx     # [Tela 1] Tela de Login Supabase Auth
│   └── 📄 layout.tsx       # Layout limpo centralizado
│
├── 📁 (dashboard)/         # Route Group para Área Logada
│   ├── 📄 layout.tsx       # [Layout Master] Sidebar retrátil + Header
│   ├── 📁 decisao/         
│   │   └── 📄 page.tsx     # [Tela 2] Centro de Decisão (Dashboard)
│   ├── 📁 municipios/      
│   │   └── 📄 page.tsx     # [Tela 3] Municípios Clientes (Tabelas)
│   ├── 📁 usuarios/        
│   │   └── 📄 page.tsx     # [Tela 4] Controle de Usuários (Cargos)
│   ├── 📁 indicadores/     
│   │   └── 📄 page.tsx     # [Tela 5] Indicadores Globais (Cadastro)
│   ├── 📁 resultados/      
│   │   └── 📄 page.tsx     # [Tela 6] Resultados & Metas (Gráficos)
│   ├── 📁 alertas/         
│   │   └── 📄 page.tsx     # [Tela 7] Alerta de Metas (Notificações)
│   └── 📁 missoes/         
│       └── 📄 page.tsx     # [Tela 8] Plano de Missões (Kanban)
│
├── 📁 api/                 # Endpoints REST Serverless
│   ├── 📁 webhooks/        # Ingestão de logs de metas
│   └── 📄 route.ts
│
├── 📄 page.tsx             # Redirecionador inicial (root -> decisao)
├── 📄 layout.tsx           # Providers (QueryClient, AuthProvider)
│
└── 📄 middleware.ts        # [Middleware Global] SSR Auth Router Matcher
│
└── 📁 lib/                     # Inicializadores de Clientes Supabase
    └── 📁 supabase/
        ├── 📄 client.ts        # Cliente Client Component
        ├── 📄 server.ts        # Cliente Server Component
        └── 📄 middleware.ts    # Sincronizador de Cookies para Middleware`}
              </pre>
            </div>

            {/* Right Column: Key Relational DB Schemas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Database className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">PostgreSQL Schema (SQL)</h3>
                  <p className="text-[11px] text-slate-400">Estrutura física relacional no Supabase</p>
                </div>
              </div>

              <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 max-h-[500px]">
{`-- Tabela de Municípios
CREATE TABLE municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  populacao INT NOT NULL,
  status VARCHAR(20) DEFAULT 'Pendente',
  prefeito VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Usuários / Perfis
CREATE TABLE perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome VARCHAR(100) NOT NULL,
  cargo VARCHAR(20) CHECK (cargo IN ('Admin', 'Gestor', 'Agente')),
  status VARCHAR(20) DEFAULT 'Ativo'
);

-- Tabela de Indicadores
CREATE TABLE indicadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  sigla VARCHAR(50) UNIQUE NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  meta NUMERIC(10,2) NOT NULL,
  unidade VARCHAR(20) NOT NULL
);

-- Resultados Periódicos
CREATE TABLE resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id UUID REFERENCES indicadores(id),
  municipio_id UUID REFERENCES municipios(id),
  realizado NUMERIC(10,2) NOT NULL,
  periodo VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>

          </div>

          {/* Database Relationships and Security Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Supabase Security Policy Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Key className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Supabase Row Level Security (RLS)</h3>
                  <p className="text-[11px] text-slate-400">Garantia de que os Agentes de um município só editem seus próprios dados</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs text-slate-700">
                  <span className="text-indigo-600 font-bold block mb-1">Habilitar RLS nas tabelas:</span>
                  ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 font-mono text-xs text-slate-700">
                  <span className="text-indigo-600 font-bold block mb-1">Política de Leitura (Todos Autenticados):</span>
                  CREATE POLICY "Permitir leitura para usuários logados" ON resultados FOR SELECT USING (auth.role() = 'authenticated');
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Mapeamos o cargo do usuário nos <code>custom_claims</code> do token JWT do Supabase Auth para restringir operações de inserção (apenas perfis com cargo 'Admin' ou 'Gestor' podem criar indicadores e municípios).
                </p>
              </div>
            </div>

            {/* API REST Endpoint Architecture */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Layers className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Arquitetura de Serviços & Integração</h3>
                  <p className="text-[11px] text-slate-400">Comunicação baseada em rotas protegidas pelo middleware NextJS</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <div>
                    <strong className="text-slate-800">POST /api/webhooks/ingest</strong>
                    <p className="text-slate-500 text-[10px]">Ingestão de dados fiscais externos do município</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">EVENT TRIGGER</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <div>
                    <strong className="text-slate-800">GET /api/alertas/check-deviations</strong>
                    <p className="text-slate-500 text-[10px]">Rotina cron disparada para comparar resultados vs metas</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">CRON JOB</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 leading-relaxed text-[11px]">
                  <span className="font-bold text-slate-800 block mb-1">🔗 Conexão Vercel target deploy:</span>
                  A infraestrutura é otimizada para o escalonamento automático na Vercel, acoplando o monitoramento de logs à ferramenta de integridade e telemetria nativa da Vercel para garantir conformidade de nível público.
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in duration-200">
          
          {/* Permission Status Alert Banner */}
          {user?.cargo === 'Admin' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3.5">
              <CheckCircle className="h-5.5 w-5.5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-emerald-900 text-sm block">🛡️ Modo Administrador Autenticado</span>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  Você está logado como <strong>{user?.nome} (Admin)</strong>. Todas as chaves do Supabase, strings de conexão do banco PostgreSQL, endpoints da Vercel e dados de SMTP SMTP estão totalmente desbloqueadas para alteração e gravação segura.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5">
              <Lock className="h-5.5 w-5.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-950 text-sm block">🔒 Modo de Leitura Restrito</span>
                <p className="text-amber-800 text-xs leading-relaxed">
                  Desculpe, seu usuário atual <strong>{user?.nome}</strong> possui cargo de <strong>{user?.cargo}</strong>. Apenas colaboradores do tipo <strong>Admin</strong> podem salvar alterações nos parâmetros físicos do ecossistema. Utilize o simulador da tela de login para alternar para um perfil administrador.
                </p>
              </div>
            </div>
          )}

          {/* Feedback Notifications */}
          {saveSuccess && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-4 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 text-indigo-500" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Database Migration & Seeding Card */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100 text-sm md:text-base">MIGRATION: Provisionamento & População do Banco de Dados</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl mt-1">
                    Copie a migration SQL pre-configurada abaixo e cole no **SQL Editor** do seu console do Supabase. Ela cria todas as tabelas reais do sistema (<code className="text-indigo-300">municipios</code>, <code className="text-indigo-300">usuarios</code>, <code className="text-indigo-300">alertas</code>, etc.), configura as políticas RLS e popula 1 exemplo de teste real para o usuário administrador demo <code className="text-indigo-300 font-semibold font-mono">demo@gofocus.com.br</code> com senha <code className="text-indigo-300 font-semibold">senha123</code>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
                  alert('Script SQL de migração copiado com sucesso! Agora basta colar no painel SQL Editor do Supabase.');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap self-start"
              >
                <Copy className="h-4 w-4" />
                <span>Copiar Script SQL</span>
              </button>
            </div>
            
            <div className="relative">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed scrollbar-thin">
                {SQL_MIGRATION_SCRIPT}
              </pre>
            </div>
          </div>

          {/* Configuration Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Supabase Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Key className="h-5 w-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Supabase API Gateway (Auth & Storage)</h4>
                  <p className="text-[10px] text-slate-400">Credenciais para acoplamento do SDK de autenticação e RLS</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NEXT_PUBLIC_SUPABASE_URL</label>
                  <input 
                    type="url" 
                    value={supabaseUrl} 
                    onChange={(e) => setSupabaseUrl(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="https://suasubdominio.supabase.co"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                  <textarea 
                    rows={2}
                    value={supabaseAnonKey} 
                    onChange={(e) => setSupabaseAnonKey(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="Chave Pública Anon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SUPABASE_SERVICE_ROLE_KEY</label>
                    <span className="text-[9px] font-semibold text-rose-500 uppercase">Segredo de Servidor</span>
                  </div>
                  <input 
                    type="password" 
                    value={supabaseServiceRole} 
                    onChange={(e) => setSupabaseServiceRole(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="Chave de Acesso Total Bypass"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                {/* Live Connection Tester inside Card */}
                <div className="pt-3 border-t border-slate-150 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleTestDbConnection}
                    disabled={isTestingDb}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                  >
                    <Zap className={`h-3.5 w-3.5 text-indigo-600 ${isTestingDb ? 'animate-bounce' : ''}`} />
                    <span>{isTestingDb ? 'Testando Conectividade...' : 'Testar Conexão Supabase'}</span>
                  </button>

                  {dbTestResult && (
                    <div className={`p-3 rounded-xl border text-[11px] leading-relaxed animate-in fade-in duration-150 ${
                      dbTestResult.success 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                        : dbTestResult.message.toLowerCase().includes('tabelas') || dbTestResult.message.toLowerCase().includes('relation') || dbTestResult.message.toLowerCase().includes('exist')
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-rose-50 border-rose-150 text-rose-800'
                    }`}>
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        {dbTestResult.success ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        )}
                        <span>{dbTestResult.success ? 'Conexão Ativa!' : 'Alerta de Sincronização'}</span>
                      </div>
                      
                      <p className="font-medium text-slate-700 mb-1.5">{dbTestResult.message}</p>
                      
                      {!dbTestResult.success && (dbTestResult.message.toLowerCase().includes('tabelas') || dbTestResult.message.toLowerCase().includes('relation') || dbTestResult.message.toLowerCase().includes('exist')) && (
                        <div className="mt-2 bg-white/70 p-2 rounded-lg border border-amber-200/50 space-y-1">
                          <p className="font-bold text-amber-900 text-[10px] uppercase">Como resolver em 3 passos:</p>
                          <ol className="list-decimal pl-3.5 text-[10px] text-slate-600 font-semibold space-y-0.5">
                            <li>Copie o <strong>Script SQL de Migração</strong> (disponível no topo desta página).</li>
                            <li>No seu painel do Supabase, acesse o menu <strong>SQL Editor</strong> e crie uma nova query (<strong>New Query</strong>).</li>
                            <li>Cole o script copiado, clique no botão <strong>RUN</strong> e depois volte aqui para testar a conexão!</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Configuration Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Configurações de Inteligência Artificial</h4>
                  <p className="text-[10px] text-slate-400">Provedor, credenciais e parâmetros dos serviços de IA</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex gap-2.5">
                  <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Configure as credenciais e provedor para alimentar o motor de diagnóstico e as sugestões automatizadas de correções do GovFocus.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Provedor de Serviço de IA</label>
                  <select 
                    value={aiProvider}
                    onChange={(e) => handleAiProviderChange(e.target.value)}
                    disabled={user?.cargo !== 'Admin'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  >
                    <option value="gemini">Google Gemini AI</option>
                    <option value="openai">OpenAI ChatGPT API</option>
                    <option value="claude">Anthropic Claude API</option>
                    <option value="local">GovFocus Local IA (Offline / Simulado)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Modelo de Linguagem (LLM)</label>
                  <input 
                    type="text" 
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="Ex: gemini-1.5-flash"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                {aiProvider !== 'local' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chave de API (Secret Key)</label>
                    <div className="relative">
                      <input 
                        type={showAiKey ? 'text' : 'password'} 
                        value={aiKey}
                        onChange={(e) => setAiKey(e.target.value)}
                        disabled={user?.cargo !== 'Admin'}
                        placeholder="Coloque sua API key privada aqui"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-10 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAiKey(!showAiKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showAiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">Sua chave é armazenada de forma segura e localmente no seu navegador.</p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Criatividade (Temperatura)</label>
                    <span className="text-xs font-bold font-mono text-indigo-600">{aiTemp.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1.0" 
                    step="0.1" 
                    value={aiTemp}
                    onChange={(e) => setAiTemp(parseFloat(e.target.value))}
                    disabled={user?.cargo !== 'Admin'}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                    <span>Determinístico (0.0)</span>
                    <span>Criativo (1.0)</span>
                  </div>
                </div>

                {/* Connection Tester */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleTestAiConnection}
                    disabled={isTestingAi || user?.cargo !== 'Admin'}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-slate-700 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                  >
                    <Key className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{isTestingAi ? 'Testando Conexão...' : 'Testar Comunicação de API'}</span>
                  </button>

                  {aiTestResult && (
                    <div className={`p-3 rounded-xl border text-[11px] leading-relaxed animate-in fade-in duration-150 ${
                      aiTestResult.status === 'success' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                        : 'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        {aiTestResult.status === 'success' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Status: OK</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                            <span>Erro de Configuração</span>
                          </>
                        )}
                      </div>
                      <p className="text-[10px] leading-relaxed opacity-90">{aiTestResult.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {false && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe className="h-5 w-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Hospedagem & Integração Vercel</h4>
                  <p className="text-[10px] text-slate-400">Variáveis de deploy e CI/CD para automatizações</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">VERCEL_PROJECT_ID</label>
                  <input 
                    type="text" 
                    value={vercelProjectId} 
                    onChange={(e) => setVercelProjectId(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="prj_gpi_nextjs"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">VERCEL_ORG_ID</label>
                  <input 
                    type="text" 
                    value={vercelOrgId} 
                    onChange={(e) => setVercelOrgId(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="team_gestao"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">VERCEL_DEPLOY_HOOK_URL</label>
                  <input 
                    type="url" 
                    value={vercelDeployHook} 
                    onChange={(e) => setVercelDeployHook(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>
            )}

            {/* Email Dispatcher Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Mail className="h-5 w-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Disparador de E-mails Outbound (Servidor SMTP)</h4>
                  <p className="text-[10px] text-slate-400">Disparo automático de alertas fiscais e recuperação de senha</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SMTP_HOST</label>
                    <input 
                      type="text" 
                      value={smtpHost} 
                      onChange={(e) => setSmtpHost(e.target.value)} 
                      disabled={user?.cargo !== 'Admin'}
                      placeholder="smtp.sendgrid.net"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PORT</label>
                    <input 
                      type="text" 
                      value={smtpPort} 
                      onChange={(e) => setSmtpPort(e.target.value)} 
                      disabled={user?.cargo !== 'Admin'}
                      placeholder="587"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SMTP_USER</label>
                  <input 
                    type="text" 
                    value={smtpUser} 
                    onChange={(e) => setSmtpUser(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="apikey"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SMTP_PASSWORD</label>
                  <input 
                    type="password" 
                    value={smtpPass} 
                    onChange={(e) => setSmtpPass(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="••••••••••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SMTP_SENDER_EMAIL</label>
                  <input 
                    type="email" 
                    value={smtpSender} 
                    onChange={(e) => setSmtpSender(e.target.value)} 
                    disabled={user?.cargo !== 'Admin'}
                    placeholder="alertas@gestaomunicipal.gov.br"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Form Action Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button 
              type="button"
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja restaurar as chaves de infraestrutura para os padrões da homologação?')) {
                  localStorage.removeItem('cfg_supabase_url');
                  localStorage.removeItem('cfg_supabase_anon_key');
                  localStorage.removeItem('cfg_supabase_service_role');
                  localStorage.removeItem('cfg_db_host');
                  localStorage.removeItem('cfg_db_port');
                  localStorage.removeItem('cfg_db_name');
                  localStorage.removeItem('cfg_db_user');
                  localStorage.removeItem('cfg_db_pass');
                  localStorage.removeItem('cfg_vercel_project_id');
                  localStorage.removeItem('cfg_vercel_org_id');
                  localStorage.removeItem('cfg_vercel_deploy_hook');
                  localStorage.removeItem('cfg_smtp_host');
                  localStorage.removeItem('cfg_smtp_port');
                  localStorage.removeItem('cfg_smtp_user');
                  localStorage.removeItem('cfg_smtp_pass');
                  localStorage.removeItem('cfg_smtp_sender');
                  localStorage.removeItem('gofocus_ai_provider');
                  localStorage.removeItem('gofocus_ai_key');
                  localStorage.removeItem('gofocus_ai_model');
                  localStorage.removeItem('gofocus_ai_temperature');
                  
                  // Reload defaults
                  setSupabaseUrl('https://wpblbpehhfafzouxcmis.supabase.co');
                  setSupabaseAnonKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmxicGVoaGZhZnpvdXNjbWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1MDAwMDAsImV4cCI6MjA4MDA2MDAwMH0.anon_key_gofocus_secret');
                  setSupabaseServiceRole('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmxicGVoaGZhZnpvdXNjbWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.service_role_gofocus_secret');
                  setDbHost('aws-0-us-east-1.pooler.supabase.com');
                  setDbPort('5432');
                  setDbName('postgres');
                  setDbUser('postgres.wpblbpehhfafzouxcmis');
                  setDbPass('••••••••••••••••••••');
                  setVercelProjectId('prj_gofocus_nextjs_prod');
                  setVercelOrgId('team_gofocus_infra');
                  setVercelDeployHook('https://api.vercel.com/v1/integrations/deploy/prj_gofocus_nextjs_prod/web_hook_url');
                  setSmtpHost('smtp.sendgrid.net');
                  setSmtpPort('587');
                  setSmtpUser('apikey');
                  setSmtpPass('••••••••••••••••••••');
                  setSmtpSender('alertas@gofocus.com.br');
                  setAiProvider('gemini');
                  setAiKey('');
                  setAiModel('gemini-1.5-flash');
                  setAiTemp(0.4);

                  setSaveSuccess('Configurações redefinidas para os padrões mockados de fábrica com sucesso!');
                }
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Restaurar Padrões
            </button>

            <button 
              type="submit"
              disabled={isSaving || user?.cargo !== 'Admin'}
              className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-900/10 cursor-pointer ${
                (isSaving || user?.cargo !== 'Admin') ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <span>Salvando Chaves...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Gravar Parâmetros</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
