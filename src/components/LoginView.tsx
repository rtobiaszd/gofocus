/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Mail, Lock, Landmark, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { Usuario } from '../types';
import { supabase, RealDatabaseService } from '../lib/supabaseClient';

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      if (!forgotEmail) {
        setForgotError('Por favor, digite seu e-mail.');
        setForgotLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: window.location.origin
      });

      if (resetError) {
        // Fallback or warning if offline / not configured
        setForgotSuccess(`Simulando envio de recuperação de senha para ${forgotEmail}. Em produção com Supabase, o link real é despachado por e-mail!`);
      } else {
        setForgotSuccess(`Instruções reais de recuperação de senha enviadas para ${forgotEmail}!`);
      }
    } catch (err: any) {
      setForgotError(err.message || 'Erro ao processar solicitação de redefinição.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !senha) {
      setError('Por favor, digite as credenciais.');
      setLoading(false);
      return;
    }

    try {
      const targetEmail = email.trim().toLowerCase();

      // 1. Try checking inside the public.usuarios table first
      try {
        const { data: dbProfiles, error: dbErr } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', targetEmail);
        
        if (!dbErr && dbProfiles && dbProfiles.length > 0) {
          const profile = dbProfiles[0];
          // Check if password matches (defaulting to 'senha123' if not set)
          const expectedSenha = profile.senha || 'senha123';
          if (expectedSenha === senha) {
            const loggedUser: Usuario = {
              id: profile.id,
              nome: profile.nome,
              email: profile.email,
              cargo: profile.cargo as any,
              status: profile.status as any,
              avatar: profile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
              senha: profile.senha
            };
            setSuccess(`Autenticado com sucesso via Banco de Dados! Entrando como ${loggedUser.cargo.toLowerCase()}...`);
            setTimeout(() => {
              onLoginSuccess(loggedUser);
              setLoading(false);
            }, 1000);
            return;
          }
        }
      } catch (dbQueryErr) {
        console.warn("Could not query public.usuarios for direct login:", dbQueryErr);
      }

      // 2. Try checking LocalStorage fallback
      try {
        const localUsersJson = localStorage.getItem('gofocus_db_usuarios');
        if (localUsersJson) {
          const localUsers = JSON.parse(localUsersJson) as Usuario[];
          const matchedLocal = localUsers.find(
            u => u.email.toLowerCase() === targetEmail && 
            (u.senha === senha || (!u.senha && senha === 'senha123'))
          );
          if (matchedLocal) {
            setSuccess(`Autenticado com sucesso via Banco Local! Entrando como ${matchedLocal.cargo.toLowerCase()}...`);
            setTimeout(() => {
              onLoginSuccess(matchedLocal);
              setLoading(false);
            }, 1000);
            return;
          }
        }
      } catch (localErr) {
        console.warn("Could not query localStorage fallback for login:", localErr);
      }

      // 3. Try standard Supabase Auth signInWithPassword
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: senha
      });

      if (authError) {
        console.warn("Supabase auth failed, verifying demo credentials locally:", authError.message);
        
        // 4. Hardcoded Demo User Fallback for seamless developer testing and "subir sozinho caso não exista"
        if (targetEmail === 'demo@gofocus.com.br' && senha === 'senha123') {
          const demoUser: Usuario = {
            id: 'demo-user-1',
            nome: 'Dr. Roberto Silveira (Demo)',
            email: 'demo@gofocus.com.br',
            cargo: 'Admin',
            status: 'Ativo',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            senha: 'senha123'
          };
          setSuccess('Autenticado com sucesso via Usuário Demo! Carregando Centro de Decisão...');
          setTimeout(() => {
            onLoginSuccess(demoUser);
            setLoading(false);
          }, 1000);
          return;
        }
        
        throw authError;
      }

      if (data && data.user) {
        // Get the real user record from the dynamic DB profiles
        const { data: profile } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', data.user.email)
          .single();

        let loggedUser: Usuario;
        if (profile) {
          loggedUser = {
            id: profile.id,
            nome: profile.nome,
            email: profile.email,
            cargo: profile.cargo as any,
            status: profile.status as any,
            avatar: profile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            senha: profile.senha
          };
        } else {
          loggedUser = {
            id: data.user.id,
            nome: data.user.email?.split('@')[0] || 'Gestor Público',
            email: data.user.email || '',
            cargo: 'Gestor',
            status: 'Ativo',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            senha: 'senha123'
          };
          // Upsert profile in usuarios table
          await RealDatabaseService.saveUsuario(loggedUser);
        }

        setSuccess(`Autenticado com sucesso pelo Supabase! Entrando como ${loggedUser.cargo.toLowerCase()}...`);
        setTimeout(() => {
          onLoginSuccess(loggedUser);
          setLoading(false);
        }, 1000);
      }
    } catch (err: any) {
      setError(`Falha na Autenticação: ${err.message || 'Verifique suas credenciais, conexão ou as configurações de URL/Anon Key'}`);
      setLoading(false);
    }
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Contas de Demonstração (Sincronizadas com Supabase)</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button 
                onClick={() => {
                  if (isForgotPassword) {
                    setForgotEmail('demo@gofocus.com.br');
                  } else {
                    fillCredentials('demo@gofocus.com.br');
                  }
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-left transition-colors font-medium truncate cursor-pointer"
                title="Dr. Roberto (Admin)"
              >
                🔑 Admin: <strong>demo@gofocus.com.br</strong>
              </button>
              
              <button 
                onClick={() => {
                  if (isForgotPassword) {
                    setForgotEmail('mariana.costa@gofocus.com.br');
                  } else {
                    fillCredentials('mariana.costa@gofocus.com.br');
                  }
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-left transition-colors font-medium truncate cursor-pointer"
                title="Mariana Costa (Gestor)"
              >
                🔑 Gestor: <strong>mariana.costa@gofocus...</strong>
              </button>
            </div>
            {!isForgotPassword && (
              <p className="text-[10px] text-slate-400 text-center leading-relaxed font-mono">
                Senha padrão da conta Demo: <span className="text-indigo-600 font-semibold">senha123</span>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
