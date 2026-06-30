import React, { useState } from 'react';
import { Shield, Smartphone, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Usuario } from '../types';

interface LoginProps {
  onLoginSuccess: (user: Usuario) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const cleanPhone = telefone.replace(/\D/g, '');

    // Strict validation for Wagner Teixeira (Admin)
    if (cleanPhone === '21975151937' && pin === '0508') {
      if (isRegister) {
        setError('A conta de Administrador já existe! Por favor, utilize a aba de login.');
        setLoading(false);
        return;
      }
      
      // Let's call login API or directly return admin user, but calling API is cleaner to match DB
    }

    try {
      if (isRegister) {
        if (!nome.trim() || !cleanPhone || !pin) {
          throw new Error('Preencha todos os campos obrigatórios');
        }
        if (pin.length < 4) {
          throw new Error('O PIN deve ter pelo menos 4 caracteres numéricos');
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, telefone: cleanPhone, pin })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao realizar cadastro');
        }

        setSuccess('Cadastro realizado! Agora faça login com seu telefone e PIN.');
        setIsRegister(false);
        setNome('');
        setPin('');
      } else {
        if (!cleanPhone || !pin) {
          throw new Error('Preencha telefone e PIN para entrar');
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefone: cleanPhone, pin })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Falha no login');
        }

        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format phone as (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 7) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setTelefone(val);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center p-3 bg-brand-green/15 rounded-2xl mb-3 border border-brand-green/30">
          <Shield className="w-10 h-10 text-brand-green" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gold rounded-full animate-ping" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">
          BOLÃO <span className="text-brand-green">COPA 2026</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xs">
          O bolão definitivo com automação de resultados e controle financeiro.
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-stadium-card rounded-2xl border border-stadium-border p-6 stadium-glow relative overflow-hidden">
        {/* Decorative corner lights */}
        <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-brand-green/50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

        <div className="flex border-b border-stadium-border mb-6">
          <button
            id="tab-login"
            className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors duration-200 ${
              !isRegister ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccess(null);
            }}
          >
            Entrar
          </button>
          <button
            id="tab-register"
            className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors duration-200 ${
              isRegister ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => {
              setIsRegister(true);
              setError(null);
              setSuccess(null);
            }}
          >
            Cadastrar
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl p-3 mb-4 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs rounded-xl p-3 mb-4 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="reg-nome"
                  type="text"
                  required
                  placeholder="Ex: Wagner Teixeira"
                  className="w-full bg-stadium-dark/60 border border-stadium-border focus:border-brand-green rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none transition-colors"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Telefone (WhatsApp)
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="login-telefone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder="(21) 99999-9999"
                className="w-full bg-stadium-dark/60 border border-stadium-border focus:border-brand-green rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none transition-colors"
                value={telefone}
                onChange={handlePhoneChange}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                PIN de Acesso
              </label>
              <span className="text-[10px] text-gray-500">4 números</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="login-pin"
                type="password"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                placeholder="••••"
                className="w-full bg-stadium-dark/60 border border-stadium-border focus:border-brand-green rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm tracking-widest outline-none transition-colors"
                value={pin}
                onChange={handlePinChange}
              />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-green/50 text-stadium-dark font-bold py-3 px-4 rounded-xl transition-all duration-200 mt-6 shadow-md shadow-brand-green/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-stadium-dark border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              'Criar Minha Conta'
            ) : (
              'Entrar no Bolão'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          {!isRegister ? (
            <p>
              Novo por aqui? Cadastre-se e pague a taxa única de participação para começar a palpitar!
            </p>
          ) : (
            <p>
              Ao se cadastrar, você declara estar ciente de que a participação exige a validação da taxa pelo Wagner.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
