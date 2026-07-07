# 🏛️ SCM Saúde Platform — Plataforma SaaS de Alta Performance para Gestão Municipal

> **SCM Saúde Platform** é uma plataforma moderna de monitoramento de metas, indicadores globais e missões operacionais para governos e municípios. Projetado com foco em usabilidade, conformidade e resiliência de dados, o sistema oferece inteligência e clareza para a tomada de decisões no setor público.

---

## 🚀 Funcionalidades Principais

### 📊 Centro de Decisão (Dashboard Dinâmico)
- **Indicadores Rápidos**: Cobertura geral de metas, total de municípios parceiros, usuários ativos e alertas pendentes.
- **Gráficos Avançados**: Visualizações analíticas interativas de evolução temporal e atingimento de metas consolidadas desenvolvidos com `Recharts`.
- **Visão de Filtro Regional**: Monitore índices específicos de educação (IDEB), saúde (cobertura vacinal), saneamento básico e finanças públicas.

### 🎯 Indicadores Globais com Gerenciamento Completo (CRUD)
- **Criação e Edição Dinâmica**: Adicione novos indicadores definindo siglas, categorias, fórmulas técnicas de cálculo e metas ideais de conformidade.
- **Ações Rápidas**: Edição cirúrgica em tempo real e remoção com sincronização automática com o banco de dados.
- **Régua de Atingimento**: Feedback visual imediato do progresso individual de cada indicador com código de cores semafórico.

### 🚨 Alertas de Metas com Diagnóstico Detalhado (IA-Assisted)
- **Painel Central de Incidentes**: Filtre os avisos por criticidade (Baixa, Média, Alta) ou status de leitura.
- **Análise Expandida de Conformidade**: Clique em qualquer alerta para visualizar um painel expandido com:
  - Dados demográficos completos do município afetado.
  - Diagnósticos técnicos de causa raiz.
  - Recomendações personalizadas e planos de ação direcionados (Saúde, Educação, Saneamento ou Finanças).

### 👥 Gestão e Controle de Usuários (IAM)
- **Níveis de Permissão**: Controle de acesso flexível baseado em funções (Administrador Global, Gestor Municipal ou Agente Técnico).
- **Gerenciamento de Imagens**: Escolha ou gere fotos de avatar dinâmicas integradas via Unsplash API para todos os colaboradores.
- **Edição de Perfil Próprio**: Ajuste suas informações pessoais (Nome e Avatar) em um modal global acessível diretamente pelo cabeçalho da plataforma.

---

## 🛠️ Arquitetura de Software & Tech Stack

A aplicação segue uma arquitetura modular moderna e altamente resiliente:

* **Frontend**: React 18 (com Vite), TypeScript, Tailwind CSS para interfaces fluidas e de alto contraste visual.
* **Componentes de Animação**: `motion` para transições de rotas e abertura de modais com foco em performance visual.
* **Banco de Dados Real**: Integração nativa com **Supabase (PostgreSQL)** para persistência durável em nuvem.
* **Motor Auto-Healer (Resiliência)**: Caso a conexão com o Supabase esteja pendente ou offline, a plataforma inicializa automaticamente uma camada de persistência em `LocalStorage` para garantir que o sistema **nunca** quebre em ambientes de homologação ou falta de credenciais ("subir sozinho caso não exista").

---

## 📂 Estrutura de Pastas

```bash
├── public/                # Ativos estáticos e logotipos
├── src/
│   ├── components/        # Views modulares da aplicação (Dashboard, Municípios, Alertas, etc)
│   ├── lib/               # Clientes externos e serviços (Supabase Client e Persistência)
│   ├── types.ts           # Definição estrita de interfaces TypeScript
│   ├── App.tsx            # Controlador central de rotas e estados reativos
│   ├── main.tsx           # Ponto de entrada React/Vite
│   └── index.css          # Estilos globais e injeções de design do Tailwind CSS
├── index.html             # Arquivo HTML principal do SCM Saúde Platform
├── metadata.json          # Metadados do Applet AI Studio
└── package.json           # Dependências e scripts de automação
```

---

## ⚙️ Configuração de Produção & Supabase

Para ligar a aplicação ao seu próprio ambiente de produção no Supabase, configure as seguintes chaves nas variáveis de ambiente do seu provedor de hospedagem (Vercel, Cloud Run, etc.) ou em um arquivo local `.env`:

```env
# URL da API do seu projeto Supabase
VITE_SUPABASE_URL=https://wpblbpehhfafzouxcmis.supabase.co

# Chave de acesso anônima pública (anon key)
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 🛢️ Migration SQL para o Console Supabase

Se estiver configurando um novo projeto Supabase do zero, execute a seguinte migration SQL no console do Supabase para gerar a estrutura de tabelas necessária e popular o usuário de testes:

```sql
-- Criar tabelas principais
CREATE TABLE IF NOT EXISTS public.municipios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  estado TEXT NOT NULL,
  populacao INTEGER NOT NULL,
  status TEXT NOT NULL,
  prefeito TEXT NOT NULL,
  data_ativacao TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo TEXT NOT NULL,
  status TEXT NOT NULL,
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS public.indicadores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta NUMERIC NOT NULL,
  valor_atual NUMERIC NOT NULL,
  unidade TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.resultados_indicadores (
  id TEXT PRIMARY KEY,
  indicador_id TEXT REFERENCES public.indicadores(id) ON DELETE CASCADE,
  indicador_nome TEXT NOT NULL,
  indicador_sigla TEXT NOT NULL,
  municipio_id TEXT REFERENCES public.municipios(id) ON DELETE CASCADE,
  municipio_nome TEXT NOT NULL,
  meta NUMERIC NOT NULL,
  realizado NUMERIC NOT NULL,
  mes TEXT NOT NULL,
  unidade TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.alertas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  criticidade TEXT NOT NULL,
  lido BOOLEAN DEFAULT false,
  municipio_id TEXT REFERENCES public.municipios(id) ON DELETE CASCADE,
  municipio_nome TEXT
);

CREATE TABLE IF NOT EXISTS public.missoes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  municipio_id TEXT REFERENCES public.municipios(id) ON DELETE CASCADE,
  municipio_nome TEXT NOT NULL,
  status TEXT NOT NULL,
  prazo TEXT NOT NULL,
  prioridade TEXT NOT NULL,
  responsavel TEXT NOT NULL
);

-- Habilitar RLS (Opcional - caso queira aplicar políticas)
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para fins de demonstração (MVP)
CREATE POLICY "Allow public select access" ON public.municipios FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.municipios FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.municipios FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.municipios FOR DELETE USING (true);

-- (Repetir políticas de acesso público irrestrito para as demais tabelas se necessário para homologação)

-- Inserir usuário Administrador de teste
INSERT INTO public.usuarios (id, nome, email, cargo, status, avatar)
VALUES (
  'demo-user-1', 
  'Dr. Roberto Silveira (Demo)', 
  'demo@scmsaude.com.br', 
  'Admin', 
  'Ativo', 
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
) ON CONFLICT (id) DO NOTHING;
```

---

## 🚀 Como Executar o Projeto Localmente

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Gere a build de produção**:
   ```bash
   npm run build
   ```

---

## 📄 Licença

Este projeto está licenciado sob a licença **Apache-2.0**.
