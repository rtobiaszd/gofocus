/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Mail, Lock, Landmark, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { Usuario } from '../types';
import { mockUsuarios } from '../mockData';

interface LoginViewProps {
  onLoginSuccess: (user: Usuario) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    setTimeout(() => {
      if (!forgotEmail) {
        setForgotError('Por favor, digite seu e-mail.');
        setForgotLoading(false);
        return;
      }

      const match = mockUsuarios.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
      if (match) {
        setForgotSuccess(`Instruções de recuperação de senha enviadas para ${forgotEmail}! Por favor, verifique a simulação de e-mails em Alertas do Sistema.`);
      } else {
        setForgotError('Este e-mail não pertence a nenhuma conta cadastrada.');
      }
      setForgotLoading(false);
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Simulate Network Latency
    setTimeout(() => {
      if (!email || !senha) {
        setError('Por favor, digite as credenciais.');
        setLoading(false);
        return;
      }

      // Find mock user based on email
      const match = mockUsuarios.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (match && senha === 'senha123') {
        if (match.status === 'Inativo') {
          setError('Esta conta de colaborador foi temporariamente suspensa.');
          setLoading(false);
          return;
        }

        setSuccess(`Autenticado com sucesso! Carregando painel de ${match.cargo.toLowerCase()}...`);
        setTimeout(() => {
          onLoginSuccess(match);
          setLoading(false);
        }, 1200);
      } else {
        setError('E-mail ou senha inválidos. Utilize as credenciais mockadas abaixo para testes.');
        setLoading(false);
      }
    }, 800);
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setSenha('senha123');
    setError('');
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-md text-white mx-auto">
            <Landmark className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão Pública Integrada</h2>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Painel de Decisão Governamental</p>
          </div>
        </div>

        {/* Login/ForgotPassword Form Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl relative">
          {!isForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Feedback Notifications */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 text-indigo-500" />
                  <span>{success}</span>
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="Ex: roberto.silveira@gestaomunicipal.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Senha de Segurança</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotEmail(email);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    className="text-[10px] text-indigo-600 hover:underline cursor-pointer font-semibold bg-transparent border-none"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-900/10 transition-all cursor-pointer ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span>{loading ? 'Validando Acesso...' : 'Entrar no Painel'}</span>
                {!loading && <ArrowRight className="h-4.5 w-4.5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-lg">Recuperar Senha</h3>
                <p className="text-slate-500 text-xs leading-relaxed">Digite seu e-mail cadastrado e enviaremos um link para redefinição de senha.</p>
              </div>

              {/* Forgot Feedback */}
              {forgotError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 text-indigo-500" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* Forgot Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="roberto.silveira@gestaomunicipal.gov.br"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  type="submit"
                  disabled={forgotLoading}
                  className={`w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-900/10 transition-all cursor-pointer ${
                    forgotLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{forgotLoading ? 'Enviando instruções...' : 'Enviar Link de Recuperação'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-center block"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          )}

          {/* Quick Mock Fillers (Delightful User Experience) */}
          <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Simulador de Acessos</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button 
                onClick={() => {
                  if (isForgotPassword) {
                    setForgotEmail('roberto.silveira@gestaomunicipal.gov.br');
                  } else {
                    fillCredentials('roberto.silveira@gestaomunicipal.gov.br');
                  }
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-left transition-colors font-medium truncate cursor-pointer"
                title="Dr. Roberto (Admin)"
              >
                🔑 Admin: <strong>Dr. Roberto</strong>
              </button>
              
              <button 
                onClick={() => {
                  if (isForgotPassword) {
                    setForgotEmail('mariana.costa@gestaomunicipal.gov.br');
                  } else {
                    fillCredentials('mariana.costa@gestaomunicipal.gov.br');
                  }
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-left transition-colors font-medium truncate cursor-pointer"
                title="Mariana Costa (Gestor)"
              >
                🔑 Gestor: <strong>Mariana</strong>
              </button>
            </div>
            {!isForgotPassword && (
              <p className="text-[10px] text-slate-400 text-center leading-relaxed font-mono">
                Utilize a senha padrão: <span className="text-amber-600 font-semibold">senha123</span>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
