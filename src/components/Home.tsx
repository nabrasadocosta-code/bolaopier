import React from 'react';
import { Trophy, ShieldAlert, Award, Star, TrendingUp, Calendar, AlertCircle, Sparkles, CheckCircle2, ListTodo, HelpCircle } from 'lucide-react';
import { Usuario, Partida, LeaderboardUser, Palpite } from '../types';
import { getFriendlyTime } from '../utils';

interface HomeProps {
  user: Usuario;
  matches: Partida[];
  ranking: LeaderboardUser[];
  palpites: Palpite[];
  onNavigate: (tab: string) => void;
}

export default function Home({ user, matches, ranking, palpites, onNavigate }: HomeProps) {
  // Find current ranking position
  const rankingIndex = ranking.findIndex(u => u.id === user.id);
  const rankPosition = rankingIndex !== -1 ? rankingIndex + 1 : '-';

  // Calculate stats
  const approvedUsers = ranking.filter(u => u.is_approved).length;
  const entryFee = 20.00; // default entry fee
  const totalPrizePool = approvedUsers * entryFee;

  // Upcoming matches (not started yet)
  const upcomingMatches = [...matches]
    .filter(m => m.status === 'nao_iniciado' && new Date(m.horario_inicio) > new Date())
    .sort((a, b) => new Date(a.horario_inicio).getTime() - new Date(b.horario_inicio).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-stadium-card to-stadium-dark border border-stadium-border rounded-2xl p-5 relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full blur-2xl" />
        
        <div className="flex flex-col gap-1 z-10 relative">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-green">Copa do Mundo 2026</span>
          <h2 className="text-2xl font-bold font-display text-white">Olá, {user.nome}!</h2>
          <p className="text-gray-400 text-xs mt-1">
            Acompanhe seus palpites e dispute a liderança do bolão com seus amigos.
          </p>
        </div>

        {/* User Approval Alert Banner */}
        <div className="mt-4 pt-4 border-t border-stadium-border/60">
          {user.is_approved ? (
            <div className="flex items-center gap-2.5 bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs rounded-xl p-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              <span className="font-semibold">Sua conta está ativa! Palpites liberados para as partidas.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs rounded-xl p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-brand-gold shrink-0" />
                <span className="font-semibold">Cadastro Pendente de Aprovação Financeira</span>
              </div>
              <p className="text-gray-300 text-[11px]">
                Sua inscrição de R$ 20,00 precisa ser confirmada por Wagner. Faça o PIX copia e cola para participar.
              </p>
              <button
                id="home-btn-pay"
                onClick={() => onNavigate('financeiro')}
                className="mt-1 bg-brand-gold text-stadium-dark font-bold py-1.5 px-3 rounded-lg text-[11px] self-start transition-all hover:bg-brand-gold/90 cursor-pointer"
              >
                Pagar Taxa de Inscrição
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Core Score Analytics Dashboard */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-stadium-card border border-stadium-border rounded-xl p-3 text-center">
          <Award className="w-5 h-5 text-brand-green mx-auto mb-1" />
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">Pontos</span>
          <span className="text-xl font-bold text-white font-mono">{user.pontos_totais}</span>
        </div>
        <div className="bg-stadium-card border border-stadium-border rounded-xl p-3 text-center">
          <Star className="w-5 h-5 text-brand-gold mx-auto mb-1" />
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">Placar Exato</span>
          <span className="text-xl font-bold text-white font-mono">{user.acertos_placar_exato}</span>
        </div>
        <div className="bg-stadium-card border border-stadium-border rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-brand-green mx-auto mb-1" />
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">Posição</span>
          <span className="text-xl font-bold text-white font-mono">#{rankPosition}</span>
        </div>
      </div>

      {/* Financial Pool Stats */}
      <div className="bg-stadium-card border border-stadium-border rounded-2xl p-5 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-sm text-white font-display">Prêmio Acumulado</h3>
          </div>
          <span className="bg-brand-green/20 text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-green/30">
            {approvedUsers} {approvedUsers === 1 ? 'Participante' : 'Participantes'}
          </span>
        </div>
        
        <div className="text-3xl font-bold text-brand-green font-mono mb-4">
          R$ {totalPrizePool.toFixed(2)}
        </div>

        <div className="space-y-2 border-t border-stadium-border/60 pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">🥇 1º Lugar (70%)</span>
            <span className="font-semibold text-white font-mono">R$ {(totalPrizePool * 0.7).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">🥈 2º Lugar (20%)</span>
            <span className="font-semibold text-white font-mono">R$ {(totalPrizePool * 0.2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">🥉 3º Lugar (10%)</span>
            <span className="font-semibold text-white font-mono">R$ {(totalPrizePool * 0.1).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Matches Quick-Link */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-white font-display flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-green" />
            Próximas Partidas
          </h3>
          <button
            id="home-btn-view-all"
            onClick={() => onNavigate('partidas')}
            className="text-xs text-brand-green hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        {upcomingMatches.length === 0 ? (
          <div className="bg-stadium-card/40 border border-stadium-border rounded-xl p-4 text-center text-xs text-gray-400">
            Nenhuma partida pendente encontrada!
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="bg-stadium-card border border-stadium-border rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[10px] text-gray-500 font-semibold">{getFriendlyTime(match.horario_inicio)}</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                    <span>{match.time_casa}</span>
                    <span className="text-brand-green text-[10px] font-mono font-bold">VS</span>
                    <span>{match.time_visitante}</span>
                  </div>
                </div>
                <button
                  id={`home-btn-predict-${match.id}`}
                  onClick={() => onNavigate('partidas')}
                  className="bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-stadium-dark border border-brand-green/20 hover:border-brand-green font-bold text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                >
                  Palpitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Client Predictions List */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white font-display flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-brand-gold animate-pulse" />
          Seus Palpites Registrados
        </h3>

        {palpites.length === 0 ? (
          <div className="bg-stadium-card/40 border border-stadium-border rounded-xl p-5 text-center text-xs text-gray-400 space-y-2">
            <p>Você ainda não registrou nenhum palpite!</p>
            <button
              onClick={() => onNavigate('partidas')}
              className="bg-brand-gold hover:bg-brand-gold/90 text-stadium-dark font-extrabold text-[11px] py-1.5 px-3 rounded-lg cursor-pointer"
            >
              Registrar Palpites Agora
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {palpites.map((p) => {
              const match = matches.find(m => m.id === p.partida_id);
              if (!match) return null;

              const gc = p.dados_palpites.gols_casa;
              const gv = p.dados_palpites.gols_visitante;
              const esc1 = p.dados_palpites.escanteios_1t ?? 0;
              const esc2 = p.dados_palpites.escanteios_2t ?? 0;
              const totEsc = p.dados_palpites.total_escanteios ?? (esc1 + esc2);
              const card1 = p.dados_palpites.cartoes_1t ?? '0-2';
              const card2 = p.dados_palpites.cartoes_2t ?? '0-2';
              const gols25 = p.dados_palpites.total_gols_25 ?? 'Menos de 2.5';
              const ambas = p.dados_palpites.ambas_marcam ?? 'Não';

              return (
                <div
                  key={p.id}
                  className="bg-stadium-card border border-brand-gold/10 hover:border-brand-gold/30 rounded-2xl p-4 space-y-3 transition-all"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-stadium-border/40">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{getFriendlyTime(match.horario_inicio)}</span>
                    {match.status === 'finalizado' ? (
                      <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Finalizado
                      </span>
                    ) : (
                      <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Confirmado
                      </span>
                    )}
                  </div>

                  {/* Guess scoreboard view */}
                  <div className="flex items-center justify-between">
                    <div className="text-left w-[38%] truncate">
                      <span className="text-xs font-black text-gray-200 block truncate">{match.time_casa}</span>
                    </div>
                    
                    <div className="bg-stadium-dark/90 px-3 py-1.5 rounded-xl border border-stadium-border/60 flex items-center gap-2 font-mono font-black text-sm text-brand-gold">
                      <span>{gc}</span>
                      <span className="text-gray-600 text-[10px]">x</span>
                      <span>{gv}</span>
                    </div>

                    <div className="text-right w-[38%] truncate">
                      <span className="text-xs font-black text-gray-200 block truncate">{match.time_visitante}</span>
                    </div>
                  </div>

                  {/* Glimpse of detailed predictions */}
                  <div className="bg-stadium-dark/40 rounded-xl p-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <span className="text-gray-500">🚩 Cantos:</span>
                      <span className="font-bold text-gray-200">{esc1} (1T) + {esc2} (2T) = {totEsc}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <span className="text-gray-500">⚽ Gols (2.5):</span>
                      <span className={`font-bold ${gols25.includes('Mais') ? 'text-brand-green' : 'text-gray-400'}`}>{gols25}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <span className="text-gray-500">🟨/🟥 Cartões:</span>
                      <span className="font-bold text-gray-200">{card1} (1T) / {card2} (2T)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <span className="text-gray-500">🤝 Ambas:</span>
                      <span className="font-bold text-gray-200">{ambas}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sweeps Point Scoring Rules */}
      <div className="bg-stadium-card/40 border border-stadium-border/60 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Regras de Pontuação</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center text-[10px] font-bold text-brand-green shrink-0">
              5
            </div>
            <div>
              <p className="font-semibold text-white">Acerto de Placar Exato</p>
              <p className="text-gray-400 text-[11px]">Você adivinhou o número correto de gols de ambas as equipes. Ex: Placar real 2-1, palpite 2-1.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-[10px] font-bold text-brand-gold shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-white">Acerto de Vencedor / Empate Simples</p>
              <p className="text-gray-400 text-[11px]">Você acertou o time vencedor ou empate, mas errou o placar exato. Ex: Placar real 2-1, palpite 1-0.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-gray-500/15 border border-gray-500/30 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-white">Acerto de Gols de Um Time</p>
              <p className="text-gray-400 text-[11px]">Você errou o vencedor e o placar, mas acertou a quantidade de gols de um dos times. Ex: Placar real 2-1, palpite 2-3.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pier do Costa Greeting and Good Luck message */}
      <div className="bg-gradient-to-r from-brand-gold/15 via-stadium-card to-brand-gold/15 border border-brand-gold/30 rounded-2xl p-6 text-center space-y-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gold/[0.02] animate-pulse" />
        <div className="text-2xl">🍀</div>
        <h4 className="text-sm font-black text-brand-gold uppercase tracking-widest">BOA SORTE!</h4>
        <p className="text-xs text-gray-200 font-extrabold max-w-sm mx-auto leading-relaxed">
          Obrigado por participar do Bolão do Pier do Costa
        </p>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono pt-1">
          Wagner & Família agradecem a preferência! 🏆⚽🌊
        </p>
      </div>
    </div>
  );
}
