/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Municipio {
  id: string;
  nome: string;
  estado: string;
  populacao: number;
  status: 'Ativo' | 'Pendente' | 'Inativo';
  prefeito: string;
  dataAtivacao: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: 'Admin' | 'Gestor' | 'Agente';
  status: 'Ativo' | 'Inativo';
  avatar?: string;
}

export interface Indicador {
  id: string;
  nome: string;
  sigla: string;
  categoria: 'Educação' | 'Saúde' | 'Segurança' | 'Finanças' | 'Saneamento';
  descricao: string;
  meta: number;
  valorAtual: number;
  unidade: 'porcentagem' | 'financeiro' | 'taxa' | 'quantidade';
}

export interface ResultadoIndicador {
  id: string;
  indicadorId: string;
  indicadorNome: string;
  indicadorSigla: string;
  municipioId: string;
  municipioNome: string;
  meta: number;
  realizado: number;
  mes: string;
  unidade: 'porcentagem' | 'financeiro' | 'taxa' | 'quantidade';
}

export interface Alerta {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
  criticidade: 'Alta' | 'Média' | 'Baixa';
  lido: boolean;
  municipioId?: string;
  municipioNome?: string;
}

export interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  municipioId: string;
  municipioNome: string;
  status: string;
  prazo: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  responsavel: string;
}
