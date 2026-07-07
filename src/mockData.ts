/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Municipio, Usuario, Indicador, ResultadoIndicador, Alerta, Missao } from './types';

export const mockMunicipios: Municipio[] = [
  { id: 'm-1', nome: 'Santa Fé do Sul', estado: 'SP', populacao: 32540, status: 'Ativo', prefeito: 'Evandro Mura', dataAtivacao: '2025-01-15' },
  { id: 'm-2', nome: 'Bento Gonçalves', estado: 'RS', populacao: 121800, status: 'Ativo', prefeito: 'Diogo Siqueira', dataAtivacao: '2025-02-10' },
  { id: 'm-3', nome: 'Extrema', estado: 'MG', populacao: 36240, status: 'Ativo', prefeito: 'João Batista', dataAtivacao: '2025-01-20' },
  { id: 'm-4', nome: 'Palmas', estado: 'TO', populacao: 306580, status: 'Ativo', prefeito: 'Cinthia Ribeiro', dataAtivacao: '2025-03-05' },
  { id: 'm-5', nome: 'Sobral', estado: 'CE', populacao: 210710, status: 'Pendente', prefeito: 'Ivo Gomes', dataAtivacao: '2025-05-18' },
  { id: 'm-6', nome: 'Maringá', estado: 'PR', populacao: 430150, status: 'Ativo', prefeito: 'Ulisses Maia', dataAtivacao: '2025-01-10' },
  { id: 'm-7', nome: 'São Caetano do Sul', estado: 'SP', populacao: 161950, status: 'Ativo', prefeito: 'Auricchio Júnior', dataAtivacao: '2025-02-28' },
  { id: 'm-8', nome: 'Bonito', estado: 'MS', populacao: 22100, status: 'Inativo', prefeito: 'Josmail Rodrigues', dataAtivacao: '2024-11-15' }
];

export const mockUsuarios: Usuario[] = [
  { id: 'u-1', nome: 'Dr. Roberto Silveira', email: 'roberto.silveira@gestaomunicipal.gov.br', cargo: 'Admin', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { id: 'u-2', nome: 'Mariana Costa', email: 'mariana.costa@gestaomunicipal.gov.br', cargo: 'Gestor', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'u-3', nome: 'Carlos Eduardo Souza', email: 'carlos.eduardo@gestaomunicipal.gov.br', cargo: 'Agente', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'u-4', nome: 'Ana Beatriz Ramos', email: 'ana.ramos@gestaomunicipal.gov.br', cargo: 'Agente', status: 'Ativo', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80' },
  { id: 'u-5', nome: 'Ricardo Mendes', email: 'ricardo.mendes@gestaomunicipal.gov.br', cargo: 'Gestor', status: 'Inativo', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' }
];

export const mockIndicadores: Indicador[] = [
  { id: 'ind-1', nome: 'Índice de Desenvolvimento da Educação Básica (IDEB)', sigla: 'IDEB', categoria: 'Educação', descricao: 'Mede a qualidade do aprendizado nacional e estabelece metas para a melhoria do ensino.', meta: 6.5, valorAtual: 5.8, unidade: 'taxa' },
  { id: 'ind-2', nome: 'Cobertura de Atenção Básica de Saúde', sigla: 'COB_SAUDE', categoria: 'Saúde', descricao: 'Porcentagem da população coberta pelas equipes de Atenção Primária à Saúde.', meta: 95.0, valorAtual: 87.2, unidade: 'porcentagem' },
  { id: 'ind-3', nome: 'Gasto Municipal com Educação s/ Receita Impostos', sigla: 'G_EDU', categoria: 'Finanças', descricao: 'Percentual de receitas próprias investidas em Educação (Mínimo constitucional de 25%).', meta: 28.0, valorAtual: 26.4, unidade: 'porcentagem' },
  { id: 'ind-4', nome: 'Atendimento de Água Tratada', sigla: 'SANE_AGUA', categoria: 'Saneamento', descricao: 'Porcentagem da população com acesso regular a água potável encanada.', meta: 99.0, valorAtual: 92.5, unidade: 'porcentagem' },
  { id: 'ind-5', nome: 'Taxa de Homicídios por 100 mil Habitantes', sigla: 'TX_HOMIC', categoria: 'Segurança', descricao: 'Índice anualizado de mortes violentas intencionais.', meta: 12.0, valorAtual: 14.5, unidade: 'quantidade' },
  { id: 'ind-6', nome: 'Gasto Municipal com Saúde s/ Receita Impostos', sigla: 'G_SAUDE', categoria: 'Finanças', descricao: 'Percentual de receitas próprias aplicadas em Saúde (Mínimo constitucional de 15%).', meta: 18.0, valorAtual: 19.2, unidade: 'porcentagem' }
];

export const mockResultados: ResultadoIndicador[] = [
  { id: 'r-1', indicadorId: 'ind-1', indicadorNome: 'IDEB', indicadorSigla: 'IDEB', municipioId: 'm-1', municipioNome: 'Santa Fé do Sul', meta: 6.5, realizado: 6.8, mes: '2025/Anual', unidade: 'taxa' },
  { id: 'r-2', indicadorId: 'ind-1', indicadorNome: 'IDEB', indicadorSigla: 'IDEB', municipioId: 'm-2', municipioNome: 'Bento Gonçalves', meta: 6.5, realizado: 6.3, mes: '2025/Anual', unidade: 'taxa' },
  { id: 'r-3', indicadorId: 'ind-1', indicadorNome: 'IDEB', indicadorSigla: 'IDEB', municipioId: 'm-3', municipioNome: 'Extrema', meta: 6.5, realizado: 6.7, mes: '2025/Anual', unidade: 'taxa' },
  { id: 'r-4', indicadorId: 'ind-1', indicadorNome: 'IDEB', indicadorSigla: 'IDEB', municipioId: 'm-4', municipioNome: 'Palmas', meta: 6.5, realizado: 5.9, mes: '2025/Anual', unidade: 'taxa' },
  
  { id: 'r-5', indicadorId: 'ind-2', indicadorNome: 'Cobertura de Saúde', indicadorSigla: 'COB_SAUDE', municipioId: 'm-1', municipioNome: 'Santa Fé do Sul', meta: 95.0, realizado: 96.2, mes: 'Maio/2026', unidade: 'porcentagem' },
  { id: 'r-6', indicadorId: 'ind-2', indicadorNome: 'Cobertura de Saúde', indicadorSigla: 'COB_SAUDE', municipioId: 'm-2', municipioNome: 'Bento Gonçalves', meta: 95.0, realizado: 88.4, mes: 'Maio/2026', unidade: 'porcentagem' },
  { id: 'r-7', indicadorId: 'ind-2', indicadorNome: 'Cobertura de Saúde', indicadorSigla: 'COB_SAUDE', municipioId: 'm-3', municipioNome: 'Extrema', meta: 95.0, realizado: 94.0, mes: 'Maio/2026', unidade: 'porcentagem' },
  { id: 'r-8', indicadorId: 'ind-2', indicadorNome: 'Cobertura de Saúde', indicadorSigla: 'COB_SAUDE', municipioId: 'm-4', municipioNome: 'Palmas', meta: 95.0, realizado: 82.5, mes: 'Maio/2026', unidade: 'porcentagem' },

  { id: 'r-9', indicadorId: 'ind-3', indicadorNome: 'Investimento em Educação', indicadorSigla: 'G_EDU', municipioId: 'm-1', municipioNome: 'Santa Fé do Sul', meta: 28.0, realizado: 27.2, mes: '1º Quad/2026', unidade: 'porcentagem' },
  { id: 'r-10', indicadorId: 'ind-3', indicadorNome: 'Investimento em Educação', indicadorSigla: 'G_EDU', municipioId: 'm-2', municipioNome: 'Bento Gonçalves', meta: 28.0, realizado: 28.5, mes: '1º Quad/2026', unidade: 'porcentagem' },
  { id: 'r-11', indicadorId: 'ind-3', indicadorNome: 'Investimento em Educação', indicadorSigla: 'G_EDU', municipioId: 'm-3', municipioNome: 'Extrema', meta: 28.0, realizado: 29.1, mes: '1º Quad/2026', unidade: 'porcentagem' },
  { id: 'r-12', indicadorId: 'ind-3', indicadorNome: 'Investimento em Educação', indicadorSigla: 'G_EDU', municipioId: 'm-4', municipioNome: 'Palmas', meta: 28.0, realizado: 25.4, mes: '1º Quad/2026', unidade: 'porcentagem' }
];

export const mockAlertas: Alerta[] = [
  { id: 'a-1', titulo: 'Meta Fiscal de Educação Abaixo do Mínimo', mensagem: 'O município de Palmas (TO) está com investimento de 25.4% na Educação, perigosamente perto do piso constitucional (25%).', data: '2026-07-06 14:32', criticidade: 'Alta', lido: false, municipioId: 'm-4', municipioNome: 'Palmas' },
  { id: 'a-2', titulo: 'Cobertura de Saúde Crítica', mensagem: 'Bento Gonçalves (RS) registrou queda de 4% na cobertura de atenção básica comparado ao mês anterior.', data: '2026-07-05 09:15', criticidade: 'Média', lido: false, municipioId: 'm-2', municipioNome: 'Bento Gonçalves' },
  { id: 'a-3', titulo: 'Adesão de Município Pendente', mensagem: 'O município de Sobral (CE) enviou a documentação, mas a ativação no sistema ainda não foi concluída.', data: '2026-07-04 11:00', criticidade: 'Baixa', lido: true, municipioId: 'm-5', municipioNome: 'Sobral' },
  { id: 'a-4', titulo: 'Índice de Segurança Fora da Curva', mensagem: 'O município de Extrema (MG) registrou aumento temporário nas ocorrências mensais.', data: '2026-07-03 16:45', criticidade: 'Alta', lido: true, municipioId: 'm-3', municipioNome: 'Extrema' }
];

export const mockMissoes: Missao[] = [
  { id: 'task-1', titulo: 'Adequação de Recursos Educacionais', descricao: 'Readequar o orçamento municipal para transferir R$ 450k para custeio de merenda e insumos escolares, garantindo cumprimento do piso.', municipioId: 'm-4', municipioNome: 'Palmas', status: 'Em Andamento', prazo: '2026-07-20', prioridade: 'Alta', responsavel: 'Mariana Costa' },
  { id: 'task-2', titulo: 'Mutirão da Saúde Primária', descricao: 'Instalação de 3 novas equipes de saúde da família itinerante para ampliar a cobertura nos distritos periféricos.', municipioId: 'm-2', municipioNome: 'Bento Gonçalves', status: 'Pendente', prazo: '2026-08-05', prioridade: 'Média', responsavel: 'Carlos Eduardo Souza' },
  { id: 'task-3', titulo: 'Assinatura do Termo de Adesão', descricao: 'Homologação jurídica do convênio de monitoramento e liberação de acessos dos secretários.', municipioId: 'm-5', municipioNome: 'Sobral', status: 'Pendente', prazo: '2026-07-15', prioridade: 'Alta', responsavel: 'Dr. Roberto Silveira' },
  { id: 'task-4', titulo: 'Capacitação de Agentes Municipais', descricao: 'Realizar treinamento remoto sobre alimentação e coleta de dados dos indicadores fiscais na plataforma.', municipioId: 'm-3', municipioNome: 'Extrema', status: 'Concluído', prazo: '2026-07-01', prioridade: 'Baixa', responsavel: 'Ana Beatriz Ramos' },
  { id: 'task-5', titulo: 'Auditoria de Saneamento de Água', descricao: 'Verificar fontes de dados do indicador SANE_AGUA para alinhar com o Marco Legal do Saneamento.', municipioId: 'm-1', municipioNome: 'Santa Fé do Sul', status: 'Em Andamento', prazo: '2026-07-25', prioridade: 'Média', responsavel: 'Carlos Eduardo Souza' }
];
