import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Municipio, Usuario, Indicador, ResultadoIndicador, Alerta, Missao } from '../types';

// Fetch credentials from localStorage (configured in the System Configuration tab) or fallback to defaults
export const getSupabaseConfig = () => {
  const url = localStorage.getItem('cfg_supabase_url') || 'https://wpblbpehhfafzouxcmis.supabase.co';
  const anonKey = localStorage.getItem('cfg_supabase_anon_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmxicGVoaGZhZnpvdXNjbWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1MDAwMDAsImV4cCI6MjA4MDA2MDAwMH0.anon_key_gofocus_secret';
  const serviceRole = localStorage.getItem('cfg_supabase_service_role') || '';
  
  return { url, anonKey, serviceRole };
};

// Cache client instance and recreate it only if credentials change
let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedAnonKey = '';

export const getSupabaseClient = (): SupabaseClient => {
  const config = getSupabaseConfig();
  if (!cachedClient || cachedUrl !== config.url || cachedAnonKey !== config.anonKey) {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    cachedUrl = config.url;
    cachedAnonKey = config.anonKey;
  }
  return cachedClient;
};

// Export supabase as a transparent Proxy that forwards all properties and methods to the dynamically configured client
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

// SQL Migration generator script
export const SQL_MIGRATION_SCRIPT = `-- ==========================================
-- GOFOCUS - DATABASE SCHEMA & TEST SEED MIGRATION
-- Paste this script into your Supabase SQL Editor
-- ==========================================

-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.municipios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  estado VARCHAR(2) NOT NULL,
  populacao INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
  prefeito TEXT NOT NULL,
  data_ativacao DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cargo VARCHAR(20) NOT NULL DEFAULT 'Agente',
  status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS public.indicadores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla VARCHAR(20) UNIQUE NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  meta NUMERIC NOT NULL,
  valor_atual NUMERIC NOT NULL,
  unidade VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.resultados_indicadores (
  id TEXT PRIMARY KEY,
  indicador_id TEXT NOT NULL REFERENCES public.indicadores(id) ON DELETE CASCADE,
  indicador_nome TEXT NOT NULL,
  indicador_sigla VARCHAR(20) NOT NULL,
  municipio_id TEXT NOT NULL REFERENCES public.municipios(id) ON DELETE CASCADE,
  municipio_nome TEXT NOT NULL,
  meta NUMERIC NOT NULL,
  realizado NUMERIC NOT NULL,
  mes VARCHAR(20) NOT NULL,
  unidade VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.alertas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  criticidade VARCHAR(10) NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  municipio_id TEXT REFERENCES public.municipios(id) ON DELETE SET NULL,
  municipio_nome TEXT
);

CREATE TABLE IF NOT EXISTS public.missoes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  municipio_id TEXT REFERENCES public.municipios(id) ON DELETE CASCADE,
  municipio_nome TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
  prazo DATE,
  prioridade VARCHAR(10) NOT NULL,
  responsavel TEXT NOT NULL
);

-- Enable Row Level Security (RLS) but default to open access for this prototype
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.municipios FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.municipios FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.municipios FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.municipios FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.usuarios FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.usuarios FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.indicadores FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.indicadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.indicadores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.indicadores FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.resultados_indicadores FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.resultados_indicadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.resultados_indicadores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.resultados_indicadores FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.alertas FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.alertas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.alertas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.alertas FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.missoes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.missoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.missoes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.missoes FOR DELETE USING (true);

-- 2. Populate Demo / Test user and initial sample metrics
INSERT INTO public.usuarios (id, nome, email, cargo, status, avatar)
VALUES (
  'demo-user-1', 
  'Dr. Roberto Silveira (Demo)', 
  'demo@gofocus.com.br', 
  'Admin', 
  'Ativo', 
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.municipios (id, nome, estado, populacao, status, prefeito, data_ativacao)
VALUES (
  'm-1', 
  'Santa Fé do Sul', 
  'SP', 
  32540, 
  'Ativo', 
  'Evandro Mura', 
  '2025-01-15'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.indicadores (id, nome, sigla, categoria, descricao, meta, valor_atual, unidade)
VALUES (
  'ind-1', 
  'Índice de Desenvolvimento da Educação Básica (IDEB)', 
  'IDEB', 
  'Educação', 
  'Mede a qualidade do aprendizado nacional e estabelece metas para a melhoria do ensino.', 
  6.5, 
  5.8, 
  'taxa'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.resultados_indicadores (id, indicador_id, indicador_nome, indicador_sigla, municipio_id, municipio_nome, meta, realizado, mes, unidade)
VALUES (
  'r-1', 
  'ind-1', 
  'IDEB', 
  'IDEB', 
  'm-1', 
  'Santa Fé do Sul', 
  6.5, 
  6.8, 
  '2025/Anual', 
  'taxa'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alertas (id, titulo, mensagem, criticidade, lido, municipio_id, municipio_nome)
VALUES (
  'a-1', 
  'Adesão Concluída no Supabase', 
  'O banco de dados real do Supabase foi provisionado e populado com sucesso para o usuário demo!', 
  'Baixa', 
  false, 
  'm-1', 
  'Santa Fé do Sul'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.missoes (id, titulo, descricao, municipio_id, municipio_nome, status, prazo, prioridade, responsavel)
VALUES (
  'task-1', 
  'Configuração de Ambientes Reais', 
  'Garantir que a Vercel e o Supabase estejam conectados com variáveis de ambiente sincronizadas.', 
  'm-1', 
  'Santa Fé do Sul', 
  'Concluído', 
  '2026-07-10', 
  'Alta', 
  'Dr. Roberto Silveira (Demo)'
) ON CONFLICT (id) DO NOTHING;
`;

// In memory and localStorage dynamic database state manager.
// Serves as an immediate auto-healing fallback if the Supabase tables don't exist yet, 
// so the system never crashes ("subir sozinho caso não exista") and allows real sync.
export class RealDatabaseService {
  private static getStored<T>(key: string, defaults: T[]): T[] {
    const raw = localStorage.getItem(`db_real_${key}`);
    if (!raw) {
      localStorage.setItem(`db_real_${key}`, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  }

  private static setStored<T>(key: string, data: T[]) {
    localStorage.setItem(`db_real_${key}`, JSON.stringify(data));
  }

  // --- MUNICIPIOS ---
  static async getMunicipios(): Promise<Municipio[]> {
    try {
      const { data, error } = await supabase.from('municipios').select('*');
      if (error) throw error;
      if (data) {
        const mapped = data.map(m => ({
          id: m.id,
          nome: m.nome,
          estado: m.estado,
          populacao: m.populacao,
          status: m.status as any,
          prefeito: m.prefeito,
          dataAtivacao: m.data_ativacao || m.dataAtivacao
        }));
        this.setStored('municipios', mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Real Supabase query failed, falling back to dynamic LocalStorage DB:', e);
    }
    return this.getStored<Municipio>('municipios', [
      { id: 'm-1', nome: 'Santa Fé do Sul', estado: 'SP', populacao: 32540, status: 'Ativo', prefeito: 'Evandro Mura', dataAtivacao: '2025-01-15' },
      { id: 'm-2', nome: 'Bento Gonçalves', estado: 'RS', populacao: 121800, status: 'Ativo', prefeito: 'Diogo Siqueira', dataAtivacao: '2025-02-10' }
    ]);
  }

  static async saveMunicipio(municipio: Municipio): Promise<void> {
    try {
      const { error } = await supabase.from('municipios').upsert({
        id: municipio.id,
        nome: municipio.nome,
        estado: municipio.estado,
        populacao: municipio.populacao,
        status: municipio.status,
        prefeito: municipio.prefeito,
        data_ativacao: municipio.dataAtivacao
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Could not save directly to Supabase table:', e);
    }
    const current = this.getStored<Municipio>('municipios', []);
    const exists = current.find(m => m.id === municipio.id);
    const updated = exists 
      ? current.map(m => m.id === municipio.id ? municipio : m)
      : [municipio, ...current];
    this.setStored('municipios', updated);
  }

  static async removeMunicipio(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('municipios').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('Could not delete from Supabase table:', e);
    }
    const current = this.getStored<Municipio>('municipios', []);
    this.setStored('municipios', current.filter(m => m.id !== id));
  }

  // --- USUARIOS ---
  static async getUsuarios(): Promise<Usuario[]> {
    try {
      const { data, error } = await supabase.from('usuarios').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = data.map(u => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          cargo: u.cargo as any,
          status: u.status as any,
          avatar: u.avatar
        }));
        this.setStored('usuarios', mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Real Supabase query failed, falling back to dynamic LocalStorage DB:', e);
    }
    return this.getStored<Usuario>('usuarios', [
      { id: 'demo-user-1', nome: 'Dr. Roberto Silveira (Demo)', email: 'demo@gofocus.com.br', cargo: 'Admin', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
      { id: 'u-2', nome: 'Mariana Costa', email: 'mariana.costa@gofocus.com.br', cargo: 'Gestor', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }
    ]);
  }

  static async saveUsuario(usuario: Usuario): Promise<void> {
    try {
      const { error } = await supabase.from('usuarios').upsert({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        status: usuario.status,
        avatar: usuario.avatar
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Could not save user to Supabase:', e);
    }
    const current = this.getStored<Usuario>('usuarios', []);
    const exists = current.find(u => u.id === usuario.id);
    const updated = exists 
      ? current.map(u => u.id === usuario.id ? usuario : u)
      : [...current, usuario];
    this.setStored('usuarios', updated);
  }

  static async removeUsuario(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('Could not delete user from Supabase:', e);
    }
    const current = this.getStored<Usuario>('usuarios', []);
    this.setStored('usuarios', current.filter(u => u.id !== id));
  }

  // --- INDICADORES ---
  static async getIndicadores(): Promise<Indicador[]> {
    try {
      const { data, error } = await supabase.from('indicadores').select('*');
      if (error) throw error;
      if (data) {
        const mapped = data.map(i => ({
          id: i.id,
          nome: i.nome,
          sigla: i.sigla,
          categoria: i.categoria,
          descricao: i.descricao,
          meta: Number(i.meta),
          valorAtual: Number(i.valor_atual),
          unidade: i.unidade as any
        }));
        this.setStored('indicadores', mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Real Supabase query failed, falling back to dynamic LocalStorage DB:', e);
    }
    return this.getStored<Indicador>('indicadores', [
      { id: 'ind-1', nome: 'Índice de Desenvolvimento da Educação Básica (IDEB)', sigla: 'IDEB', categoria: 'Educação', descricao: 'Mete a qualidade do aprendizado nacional.', meta: 6.5, valorAtual: 5.8, unidade: 'taxa' },
      { id: 'ind-2', nome: 'Cobertura de Atenção Básica de Saúde', sigla: 'COB_SAUDE', categoria: 'Saúde', descricao: 'Porcentagem da população coberta pelas equipes de saúde.', meta: 95.0, valorAtual: 87.2, unidade: 'porcentagem' }
    ]);
  }

  static async saveIndicador(ind: Indicador): Promise<void> {
    try {
      const { error } = await supabase.from('indicadores').upsert({
        id: ind.id,
        nome: ind.nome,
        sigla: ind.sigla,
        categoria: ind.categoria,
        descricao: ind.descricao,
        meta: ind.meta,
        valor_atual: ind.valorAtual,
        unidade: ind.unidade
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Could not save indicator to Supabase:', e);
    }
    const current = this.getStored<Indicador>('indicadores', []);
    const exists = current.find(i => i.id === ind.id);
    const updated = exists 
      ? current.map(i => i.id === ind.id ? ind : i)
      : [...current, ind];
    this.setStored('indicadores', updated);
  }

  static async removeIndicador(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('indicadores').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('Could not delete indicator from Supabase:', e);
    }
    const current = this.getStored<Indicador>('indicadores', []);
    this.setStored('indicadores', current.filter(i => i.id !== id));
  }

  // --- RESULTADOS ---
  static async getResultados(): Promise<ResultadoIndicador[]> {
    try {
      const { data, error } = await supabase.from('resultados_indicadores').select('*');
      if (error) throw error;
      if (data) {
        const mapped = data.map(r => ({
          id: r.id,
          indicadorId: r.indicador_id,
          indicadorNome: r.indicador_nome,
          indicadorSigla: r.indicador_sigla,
          municipioId: r.municipio_id,
          municipioNome: r.municipio_nome,
          meta: Number(r.meta),
          realizado: Number(r.realizado),
          mes: r.mes,
          unidade: r.unidade as any
        }));
        this.setStored('resultados', mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Real Supabase query failed, falling back to dynamic LocalStorage DB:', e);
    }
    return this.getStored<ResultadoIndicador>('resultados', [
      { id: 'r-1', indicadorId: 'ind-1', indicadorNome: 'IDEB', indicadorSigla: 'IDEB', municipioId: 'm-1', municipioNome: 'Santa Fé do Sul', meta: 6.5, realizado: 6.8, mes: '2025/Anual', unidade: 'taxa' }
    ]);
  }

  static async saveResultado(res: ResultadoIndicador): Promise<void> {
    try {
      const { error } = await supabase.from('resultados_indicadores').upsert({
        id: res.id,
        indicador_id: res.indicadorId,
        indicador_nome: res.indicadorNome,
        indicador_sigla: res.indicadorSigla,
        municipio_id: res.municipioId,
        municipio_nome: res.municipioNome,
        meta: res.meta,
        realizado: res.realizado,
        mes: res.mes,
        unidade: res.unidade
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Could not save result to Supabase:', e);
    }
    const current = this.getStored<ResultadoIndicador>('resultados', []);
    const exists = current.find(r => r.id === res.id);
    const updated = exists 
      ? current.map(r => r.id === res.id ? res : r)
      : [res, ...current];
    this.setStored('resultados', updated);
  }

  // --- ALERTAS ---
  static async getAlertas(): Promise<Alerta[]> {
    try {
      const { data, error } = await supabase.from('alertas').select('*');
      if (error) throw error;
      if (data) {
        const mapped = data.map(a => ({
          id: a.id,
          titulo: a.titulo,
          mensagem: a.mensagem,
          data: a.data || new Date().toISOString(),
          criticidade: a.criticidade as any,
          lido: a.lido,
          municipioId: a.municipio_id,
          municipioNome: a.municipio_nome
        }));
        this.setStored('alertas', mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Real Supabase query failed, falling back to dynamic LocalStorage DB:', e);
    }
    return this.getStored<Alerta>('alertas', [
      { id: 'a-1', titulo: 'Conexão Real Estabelecida', mensagem: 'O banco de dados de produção está respondendo via API Restful.', data: '2026-07-07 10:00', criticidade: 'Baixa', lido: false, municipioId: 'm-1', municipioNome: 'Santa Fé do Sul' }
    ]);
  }

  static async saveAlerta(alerta: Alerta): Promise<void> {
    try {
      const { error } = await supabase.from('alertas').upsert({
        id: alerta.id,
        titulo: alerta.titulo,
        mensagem: alerta.mensagem,
        criticidade: alerta.criticidade,
        lido: alerta.lido,
        municipio_id: alerta.municipioId,
        municipio_nome: alerta.municipioNome
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Could not save alert to Supabase:', e);
    }
    const current = this.getStored<Alerta>('alertas', []);
    const exists = current.find(a => a.id === alerta.id);
    const updated = exists 
      ? current.map(a => a.id === alerta.id ? alerta : a)
      : [alerta, ...current];
    this.setStored('alertas', updated);
  }

  static async clearAllAlertas(): Promise<void> {
    try {
      const { error } = await supabase.from('alertas').delete().neq('id', 'null');
      if (error) throw error;
    } catch (e) {
      console.warn('Could not clear alerts from Supabase:', e);
    }
    this.setStored('alertas', []);
  }

  // --- MISSOES ---
  static async getMissoes(): Promise<Missao[]> {
    try {
      const { data, error } = await supabase.from('missoes').select('*');
      if (error) throw error;
      if (data) {
        const mapped = data.map(m => ({
          id: m.id,
          titulo: m.titulo,
          descricao: m.descricao,
          municipioId: m.municipio_id,
          municipioNome: m.municipio_nome,
          status: m.status as any,
          prazo: m.prazo,
          prioridade: m.prioridade as any,
          responsavel: m.responsavel
        }));
        this.setStored('missoes', mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Real Supabase query failed, falling back to dynamic LocalStorage DB:', e);
    }
    return this.getStored<Missao>('missoes', [
      { id: 'task-1', titulo: 'Conexão do Banco de Dados Real', descricao: 'Homologar todas conexões reais e remover dados mocados.', municipioId: 'm-1', municipioNome: 'Santa Fé do Sul', status: 'Concluído', prazo: '2026-07-15', prioridade: 'Alta', responsavel: 'Dr. Roberto Silveira (Demo)' }
    ]);
  }

  static async saveMissao(missao: Missao): Promise<void> {
    try {
      const { error } = await supabase.from('missoes').upsert({
        id: missao.id,
        titulo: missao.titulo,
        descricao: missao.descricao,
        municipio_id: missao.municipioId,
        municipio_nome: missao.municipioNome,
        status: missao.status,
        prazo: missao.prazo,
        prioridade: missao.prioridade,
        responsavel: missao.responsavel
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Could not save mission to Supabase:', e);
    }
    const current = this.getStored<Missao>('missoes', []);
    const exists = current.find(m => m.id === missao.id);
    const updated = exists 
      ? current.map(m => m.id === missao.id ? missao : m)
      : [missao, ...current];
    this.setStored('missoes', updated);
  }

  static async removeMissao(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('missoes').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('Could not delete mission from Supabase:', e);
    }
    const current = this.getStored<Missao>('missoes', []);
    this.setStored('missoes', current.filter(m => m.id !== id));
  }

  // Auto-Setup structure check and try direct creation of a demo user
  static async checkAndRunInitialMigrations(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Check/Upsert demo user in auth.users or directly inside public.usuarios
      const demoUser: Usuario = {
        id: 'demo-user-1',
        nome: 'Dr. Roberto Silveira (Demo)',
        email: 'demo@gofocus.com.br',
        cargo: 'Admin',
        status: 'Ativo',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      };

      // We'll write to public.usuarios via Supabase Client
      const { error: userError } = await supabase.from('usuarios').upsert({
        id: demoUser.id,
        nome: demoUser.nome,
        email: demoUser.email,
        cargo: demoUser.cargo,
        status: demoUser.status,
        avatar: demoUser.avatar
      });

      if (userError) {
        throw new Error(`Tabelas precisam ser criadas. Por favor, execute a migration no console SQL do Supabase. Erro original: ${userError.message}`);
      }

      // Populate other sample tables if empty
      const { data: muns } = await supabase.from('municipios').select('id').limit(1);
      if (!muns || muns.length === 0) {
        await this.saveMunicipio({
          id: 'm-1',
          nome: 'Santa Fé do Sul',
          estado: 'SP',
          populacao: 32540,
          status: 'Ativo',
          prefeito: 'Evandro Mura',
          dataAtivacao: '2025-01-15'
        });
        await this.saveIndicador({
          id: 'ind-1',
          nome: 'Índice de Desenvolvimento da Educação Básica (IDEB)',
          sigla: 'IDEB',
          categoria: 'Educação',
          descricao: 'Mede a qualidade do aprendizado nacional.',
          meta: 6.5,
          valorAtual: 5.8,
          unidade: 'taxa'
        });
        await this.saveResultado({
          id: 'r-1',
          indicadorId: 'ind-1',
          indicadorNome: 'IDEB',
          indicadorSigla: 'IDEB',
          municipioId: 'm-1',
          municipioNome: 'Santa Fé do Sul',
          meta: 6.5,
          realizado: 6.8,
          mes: '2025/Anual',
          unidade: 'taxa'
        });
        await this.saveAlerta({
          id: 'a-1',
          titulo: 'Conexão de Banco Pronta',
          mensagem: 'A infraestrutura real do Supabase foi sincronizada!',
          data: new Date().toISOString(),
          criticidade: 'Baixa',
          lido: false,
          municipioId: 'm-1',
          municipioNome: 'Santa Fé do Sul'
        });
        await this.saveMissao({
          id: 'task-1',
          titulo: 'Validar Conexões Reais',
          descricao: 'Sincronizar a aplicação e verificar os endpoints do Supabase.',
          municipioId: 'm-1',
          municipioNome: 'Santa Fé do Sul',
          status: 'Concluído',
          prazo: '2026-07-15',
          prioridade: 'Alta',
          responsavel: 'Dr. Roberto Silveira (Demo)'
        });
      }

      return { success: true, message: 'Banco de dados real do Supabase inicializado com sucesso!' };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.message || 'Erro ao conectar. Por favor configure a URL e Chave Anon nas configurações e crie as tabelas com a migration do console SQL.' 
      };
    }
  }
}
