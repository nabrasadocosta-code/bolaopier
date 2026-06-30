import React, { useState } from 'react';
import { CreditCard, QrCode, Copy, Check, Smartphone, CheckCircle, HelpCircle, Loader } from 'lucide-react';
import { Usuario } from '../types';

interface WalletProps {
  user: Usuario;
  onRefreshUserStatus: () => Promise<void>;
}

export default function Wallet({ user, onRefreshUserStatus }: WalletProps) {
  const [copied, setCopied] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  const handleRefreshStatus = async () => {
    setRefreshingStatus(true);
    await onRefreshUserStatus();
    setRefreshingStatus(false);
  };

  const entryFee = 20.00;
  const pixKey = '22992040941';

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappMessage = `Oi Wagner, fiz o PIX para o Bolão! Por favor libera meu cadastro. Nome: ${user.nome}, Telefone: ${user.telefone}`;
  const whatsappUrl = `https://wa.me/5521975151937?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-white">Controle Financeiro</h2>
        <p className="text-xs text-gray-400">Gerencie sua taxa de inscrição e libere seus palpites</p>
      </div>

      {/* Lock Notice */}
      {!user.is_approved && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm font-bold rounded-xl p-4 flex items-center justify-center gap-2 animate-pulse">
          <span>🔒 Aguardando Liberação</span>
        </div>
      )}

      {/* User Status Card */}
      <div className={`bg-stadium-card border rounded-2xl p-5 relative overflow-hidden ${
        user.is_approved ? 'border-brand-green/30' : 'border-brand-gold/30'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Seu Status de Inscrição</span>
            <h3 className="text-lg font-bold text-white mt-1">
              {user.is_approved ? 'Aprovado para Jogar' : 'Aguardando Liberação'}
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            user.is_approved 
              ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
              : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
          }`}>
            {user.is_approved ? 'Ativo' : 'Pendente'}
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {user.is_approved 
            ? 'Sua inscrição foi validada e seu saldo está em dia! Todos os seus palpites estão ativos e contabilizando para a classificação geral.'
            : 'Sua conta necessita de aprovação administrativa. Efetue o pagamento PIX no valor de R$ 20,00 e envie o comprovante.'}
        </p>

        <div className="flex gap-2.5 mt-4 pt-4 border-t border-stadium-border/50">
          <button
            id="wallet-btn-refresh-status"
            disabled={refreshingStatus}
            onClick={handleRefreshStatus}
            className="bg-stadium-dark hover:bg-stadium-border text-xs font-semibold py-2 px-3.5 rounded-xl border border-stadium-border text-gray-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {refreshingStatus ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              'Verificar se Fui Aprovado'
            )}
          </button>
        </div>
      </div>

      {/* PIX Payment Section */}
      {!user.is_approved && (
        <div className="bg-stadium-card border border-stadium-border rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-green" />
            <h3 className="font-bold text-sm text-white font-display">Pagamento via PIX</h3>
          </div>

          <div className="space-y-4">
            {/* Value Indicator */}
            <div className="bg-stadium-dark border border-stadium-border rounded-xl p-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-brand-green" />
                <span className="text-xs text-gray-400">Valor da Inscrição:</span>
              </div>
              <span className="text-lg font-bold font-mono text-brand-green">R$ {entryFee.toFixed(2)}</span>
            </div>

            {/* Chave PIX Display */}
            <div className="bg-stadium-dark border border-stadium-border rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Chave Celular:</span>
                <span className="font-bold text-brand-green font-mono">{pixKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Favorecido:</span>
                <span className="font-semibold text-gray-200">Wagner Teixeira</span>
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex flex-col gap-2.5">
              <button
                id="btn-copy-pix-wallet"
                onClick={handleCopy}
                className={`w-full font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-brand-green hover:bg-brand-green/90 text-stadium-dark shadow-md shadow-brand-green/10'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Chave PIX</span>
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Smartphone className="w-4 h-4" />
                <span>Avisar Wagner no WhatsApp</span>
              </a>
            </div>

            {/* Steps list */}
            <div className="bg-brand-green/5 border border-brand-green/10 rounded-xl p-3.5 text-[11px] text-gray-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-brand-green">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Como liberar o seu acesso?</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Copie a chave celular acima;</li>
                <li>Abra o aplicativo de pagamentos do seu Banco;</li>
                <li>Escolha a opção de Transferência PIX por Celular e cole o número;</li>
                <li>Confirme o valor exato de <span className="text-gray-200 font-semibold">R$ 20,00</span>;</li>
                <li>Clique no botão do WhatsApp acima para avisar o Wagner Teixeira!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
