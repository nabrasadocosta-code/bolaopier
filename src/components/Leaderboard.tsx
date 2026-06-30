import React, { useState } from 'react';
import { Trophy, Medal, Star, Search, Award, TrendingUp } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface LeaderboardProps {
  ranking: LeaderboardUser[];
  currentUserId: string;
}

export default function Leaderboard({ ranking, currentUserId }: LeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRanking = ranking.filter(u =>
    u.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUserIndex = ranking.findIndex(u => u.id === currentUserId);
  const isNotInTop10 = currentUserIndex >= 10;
  const currentUserRank = currentUserIndex !== -1 ? ranking[currentUserIndex] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-white">Classificação Geral</h2>
        <p className="text-xs text-gray-400">Classificação em tempo real atualizada dinamicamente</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          id="leaderboard-search"
          type="text"
          placeholder="Buscar participante pelo nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stadium-card border border-stadium-border focus:border-brand-green rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-xs outline-none transition-colors"
        />
      </div>

      {/* Tabela de Ranking */}
      <div className="bg-stadium-card border border-stadium-border rounded-2xl overflow-hidden shadow-xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 bg-stadium-dark/40 border-b border-stadium-border/60 py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <div className="col-span-2 text-center">Pos</div>
          <div className="col-span-6">Nome</div>
          <div className="col-span-2 text-center">Placares</div>
          <div className="col-span-2 text-center">Pontos</div>
        </div>

        {/* List of competitors */}
        {filteredRanking.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-gray-400">
            Nenhum competidor encontrado!
          </div>
        ) : (
          <div className="divide-y divide-stadium-border/50 max-h-[55vh] overflow-y-auto no-scrollbar">
            {filteredRanking.map((competitor, idx) => {
              const position = idx + 1;
              const isCurrentUser = competitor.id === currentUserId;
              
              // Custom rank elements
              let rankElement: React.ReactNode = (
                <span className="text-sm font-bold font-mono text-gray-400">{position}º</span>
              );

              if (position === 1) {
                rankElement = (
                  <div className="w-6 h-6 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center mx-auto">
                    <Trophy className="w-3.5 h-3.5 text-brand-gold" />
                  </div>
                );
              } else if (position === 2) {
                rankElement = (
                  <div className="w-6 h-6 rounded-full bg-gray-300/15 border border-gray-300/30 flex items-center justify-center mx-auto">
                    <Medal className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                );
              } else if (position === 3) {
                rankElement = (
                  <div className="w-6 h-6 rounded-full bg-amber-700/15 border border-amber-700/30 flex items-center justify-center mx-auto">
                    <Medal className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                );
              }

              return (
                <div
                  key={competitor.id}
                  className={`grid grid-cols-12 gap-2 items-center py-3.5 px-4 transition-colors ${
                    isCurrentUser
                      ? 'bg-brand-green/5 border-l-4 border-l-brand-green border-r border-r-transparent'
                      : 'hover:bg-stadium-border/25'
                  }`}
                >
                  {/* Position */}
                  <div className="col-span-2 text-center flex items-center justify-center">
                    {rankElement}
                  </div>

                  {/* Competitor Profile */}
                  <div className="col-span-6 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs font-bold truncate ${isCurrentUser ? 'text-brand-green' : 'text-gray-100'}`}>
                        {competitor.nome}
                      </span>
                      {isCurrentUser && (
                        <span className="bg-brand-green/20 text-brand-green text-[8px] font-extrabold px-1 rounded uppercase tracking-wider shrink-0">
                          Você
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {competitor.is_approved ? (
                        <span className="text-[9px] text-brand-green font-semibold">Ativo</span>
                      ) : (
                        <span className="text-[9px] text-brand-gold font-semibold">Pendente PIX</span>
                      )}
                      {competitor.is_locked && (
                        <span className="text-[9px] text-red-400 font-semibold bg-red-500/10 px-1 rounded">Bloqueado</span>
                      )}
                    </div>
                  </div>

                  {/* Placares Exatos (Stars) */}
                  <div className="col-span-2 text-center">
                    <span className="text-xs font-semibold text-gray-300 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-brand-gold fill-brand-gold/25" />
                      <span className="font-mono">{competitor.acertos_placar_exato}</span>
                    </span>
                  </div>

                  {/* Pontos Totais */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold font-mono text-white">
                      {competitor.pontos_totais}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky footer for position outside top 10 */}
      {isNotInTop10 && currentUserRank && (
        <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-4 flex items-center justify-between text-xs animate-fade-in shadow-md shadow-brand-green/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-green/20 flex items-center justify-center font-bold text-brand-green font-mono text-sm shrink-0">
              {currentUserIndex + 1}º
            </div>
            <div>
              <span className="font-extrabold text-white block">Sua Posição Atual</span>
              <span className="text-[10px] text-gray-400">Você está fora do Top 10 • Continue palpitando!</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-black text-brand-green font-mono block">{currentUserRank.pontos_totais} PTS</span>
            <span className="text-[9px] text-gray-400">{currentUserRank.acertos_placar_exato} placares exatos</span>
          </div>
        </div>
      )}

      {/* Critério de Desempate Summary Card */}
      <div className="bg-stadium-card/30 border border-stadium-border/40 rounded-xl p-3 text-left text-[11px] text-gray-400 space-y-1">
        <span className="font-semibold text-gray-300 flex items-center gap-1 uppercase tracking-wider text-[10px]">
          <TrendingUp className="w-3.5 h-3.5 text-brand-green" /> Critérios de Desempate
        </span>
        <p>1º Maior pontuação total;</p>
        <p>2º Maior número de acertos de placar exato (5 pontos);</p>
        <p>3º Data de cadastro mais antiga no sistema.</p>
      </div>
    </div>
  );
}
