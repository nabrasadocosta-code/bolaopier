import React, { useState, useEffect } from 'react';
import { Save, Check, Lock, Play, AlertTriangle, Calendar, Award, ChevronDown, ChevronUp, Trophy, Sparkles } from 'lucide-react';
import { Usuario, Partida, Palpite, DetalhesPalpite } from '../types';
import { getFriendlyTime } from '../utils';

function getLineupForTeam(teamName: string) {
  const name = teamName.trim();
  const db: { [key: string]: { formation: string, starters: { name: string, num: number, pos: string }[], reserves: string[] } } = {
    "Flamengo": {
      formation: "4-3-3",
      starters: [
        { name: "Rossi", num: 1, pos: "GOL" },
        { name: "Wesley", num: 2, pos: "DEF" },
        { name: "Léo Ortiz", num: 3, pos: "DEF" },
        { name: "Léo Pereira", num: 4, pos: "DEF" },
        { name: "Ayrton Lucas", num: 6, pos: "DEF" },
        { name: "Pulgar", num: 5, pos: "MEI" },
        { name: "Gerson", num: 8, pos: "MEI" },
        { name: "De Arrascaeta", num: 14, pos: "MEI" },
        { name: "Luiz Araújo", num: 7, pos: "ATA" },
        { name: "Bruno Henrique", num: 27, pos: "ATA" },
        { name: "Pedro", num: 9, pos: "ATA" }
      ],
      reserves: ["Matheus Cunha", "David Luiz", "Allan", "Alcaraz", "Michael", "Gabigol"]
    },
    "Palmeiras": {
      formation: "4-2-3-1",
      starters: [
        { name: "Weverton", num: 21, pos: "GOL" },
        { name: "Marcos Rocha", num: 2, pos: "DEF" },
        { name: "Gustavo Gómez", num: 15, pos: "DEF" },
        { name: "Murilo", num: 26, pos: "DEF" },
        { name: "Caio Paulista", num: 16, pos: "DEF" },
        { name: "Aníbal Moreno", num: 5, pos: "MEI" },
        { name: "Richard Ríos", num: 27, pos: "MEI" },
        { name: "Estêvão", num: 41, pos: "MEI" },
        { name: "Raphael Veiga", num: 23, pos: "MEI" },
        { name: "Felipe Anderson", num: 9, pos: "MEI" },
        { name: "Flaco López", num: 42, pos: "ATA" }
      ],
      reserves: ["Marcelo Lomba", "Vitor Reis", "Mayke", "Zé Rafael", "Maurício", "Rony"]
    },
    "Real Madrid": {
      formation: "4-3-3",
      starters: [
        { name: "Courtois", num: 1, pos: "GOL" },
        { name: "Carvajal", num: 2, pos: "DEF" },
        { name: "Militão", num: 3, pos: "DEF" },
        { name: "Rüdiger", num: 22, pos: "DEF" },
        { name: "Mendy", num: 23, pos: "DEF" },
        { name: "Tchouaméni", num: 14, pos: "MEI" },
        { name: "Valverde", num: 8, pos: "MEI" },
        { name: "Bellingham", num: 5, pos: "MEI" },
        { name: "Rodrygo", num: 11, pos: "ATA" },
        { name: "Mbappé", num: 9, pos: "ATA" },
        { name: "Vinicius Jr", num: 7, pos: "ATA" }
      ],
      reserves: ["Lunin", "Lucas Vázquez", "Modric", "Camavinga", "Arda Güler", "Endrick"]
    },
    "Barcelona": {
      formation: "4-3-3",
      starters: [
        { name: "Ter Stegen", num: 1, pos: "GOL" },
        { name: "Koundé", num: 23, pos: "DEF" },
        { name: "Cubarsí", num: 2, pos: "DEF" },
        { name: "Iñigo Martínez", num: 5, pos: "DEF" },
        { name: "Balde", num: 3, pos: "DEF" },
        { name: "Casadó", num: 17, pos: "MEI" },
        { name: "Pedri", num: 8, pos: "MEI" },
        { name: "Dani Olmo", num: 20, pos: "MEI" },
        { name: "Lamine Yamal", num: 19, pos: "ATA" },
        { name: "Lewandowski", num: 9, pos: "ATA" },
        { name: "Raphinha", num: 11, pos: "ATA" }
      ],
      reserves: ["Iñaki Peña", "Sergi Domínguez", "Frenkie de Jong", "Gavi", "Fermín López", "Ansu Fati"]
    }
  };

  const foundKey = Object.keys(db).find(k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase()));
  if (foundKey) {
    return db[foundKey];
  }

  // Auto generator
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const brFirstNames = ["Lucas", "Gabriel", "Mateus", "Guilherme", "Rodrigo", "Thiago", "Bruno", "Felipe", "Diego", "Pedro", "Arthur", "Marcos", "Danilo", "Gustavo", "Alex", "Vitor"];
  const brLastNames = ["Silva", "Santos", "Souza", "Oliveira", "Pereira", "Lima", "Carvalho", "Ferreira", "Ribeiro", "Almeida", "Costa", "Gomes", "Martins", "Rocha", "Teixeira", "Araújo"];

  const firsts = brFirstNames;
  const lasts = brLastNames;

  const starters = [
    { name: "Goleiro Paredão", num: 1, pos: "GOL" },
    { name: `${firsts[(hash + 1) % firsts.length]} ${lasts[(hash + 2) % lasts.length]}`, num: 2, pos: "DEF" },
    { name: `${firsts[(hash + 3) % firsts.length]} ${lasts[(hash + 4) % lasts.length]}`, num: 3, pos: "DEF" },
    { name: `${firsts[(hash + 5) % firsts.length]} ${lasts[(hash + 6) % lasts.length]}`, num: 4, pos: "DEF" },
    { name: `${firsts[(hash + 7) % firsts.length]} ${lasts[(hash + 8) % lasts.length]}`, num: 6, pos: "DEF" },
    { name: `${firsts[(hash + 9) % firsts.length]} ${lasts[(hash + 10) % lasts.length]}`, num: 5, pos: "MEI" },
    { name: `${firsts[(hash + 11) % firsts.length]} ${lasts[(hash + 12) % lasts.length]}`, num: 8, pos: "MEI" },
    { name: `${firsts[(hash + 13) % firsts.length]} ${lasts[(hash + 14) % lasts.length]}`, num: 10, pos: "MEI" },
    { name: `${firsts[(hash + 15) % firsts.length]} ${lasts[(hash + 16) % lasts.length]}`, num: 7, pos: "ATA" },
    { name: `${firsts[(hash + 17) % firsts.length]} ${lasts[(hash + 18) % lasts.length]}`, num: 9, pos: "ATA" },
    { name: `${firsts[(hash + 19) % firsts.length]} ${lasts[(hash + 20) % lasts.length]}`, num: 11, pos: "ATA" }
  ];

  const reserves = [
    `${firsts[(hash + 21) % firsts.length]} ${lasts[(hash + 22) % lasts.length]}`,
    `${firsts[(hash + 23) % firsts.length]} ${lasts[(hash + 24) % lasts.length]}`,
    `${firsts[(hash + 25) % firsts.length]} ${lasts[(hash + 26) % lasts.length]}`,
    `${firsts[(hash + 27) % firsts.length]} ${lasts[(hash + 28) % lasts.length]}`
  ];

  return { formation: "4-3-3", starters, reserves };
}

function getSmartSuggestion(match: Partida): DetalhesPalpite {
  const hash = match.time_casa.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) +
               match.time_visitante.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
               
  const gc = (hash % 3);
  const gv = ((hash + 2) % 3);
  const esc1t = 3 + (hash % 4);
  const esc2t = 2 + ((hash + 3) % 4);
  
  const players = {
    "Flamengo": ["Pedro", "Gerson", "Bruno Henrique"],
    "Palmeiras": ["Estêvão", "Raphael Veiga", "Flaco López"],
    "Real Madrid": ["Mbappé", "Vinicius Jr", "Bellingham"],
    "Barcelona": ["Lewandowski", "Raphinha", "Lamine Yamal"],
    "Brasil": ["Neymar", "Vinicius Jr", "Rodrygo"],
    "Argentina": ["Messi", "Lautaro", "Álvarez"],
    "França": ["Mbappé", "Griezmann", "Dembelé"]
  };
  
  let suggestedScorers = "Arrascaeta, Pedro";
  const foundTeam = Object.keys(players).find(t => match.time_casa.includes(t) || match.time_visitante.includes(t));
  if (foundTeam) {
    suggestedScorers = (players as any)[foundTeam].slice(0, 2).join(", ");
  }

  return {
    gols_casa: gc,
    gols_visitante: gv,
    autores_gols: suggestedScorers,
    primeiro_vermelho: (hash % 5 === 0) ? 'Casa' : 'Nenhum',
    vai_penaltis: 'Não',
    vai_prorrogacao: 'Não',
    quem_classifica: gc >= gv ? 'Casa' : 'Visitante',
    cartoes_1t: (hash % 3 === 0) ? '3-4' : '0-2',
    cartoes_2t: (hash % 2 === 0) ? '3-4' : '0-2',
    escanteios_1t: esc1t,
    escanteios_2t: esc2t,
    primeiro_gol: gc > 0 ? 'Casa' : gv > 0 ? 'Visitante' : 'Nenhum',
    total_escanteios: esc1t + esc2t,
    total_gols_25: (gc + gv) > 2.5 ? 'Mais de 2.5' : 'Menos de 2.5',
    maior_posse: hash % 2 === 0 ? 'Casa' : 'Visitante',
    ambas_marcam: (gc > 0 && gv > 0) ? 'Sim' : 'Não',
    vencedor: gc > gv ? 'Casa' : gc < gv ? 'Visitante' : 'Empate',
    intervalo_0_10: 'Não',
    intervalo_10_20: 'Não',
    intervalo_20_30: hash % 3 === 0 ? 'Sim' : 'Não',
    intervalo_30_40: 'Não',
    intervalo_40_50: 'Não',
    intervalo_50_60: 'Não',
    intervalo_60_70: hash % 2 === 0 ? 'Sim' : 'Não',
    intervalo_70_80: 'Não',
    intervalo_80_90: 'Sim'
  };
}

interface MatchesProps {
  user: Usuario;
  matches: Partida[];
  palpites: Palpite[];
  onSavePalpite: (partidaId: number, dadosPalpites: DetalhesPalpite, isLocked: boolean) => Promise<void>;
  onRefreshMatches: () => void;
}

export default function Matches({ user, matches, palpites, onSavePalpite, onRefreshMatches }: MatchesProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'finished'>('all');
  const [guessState, setGuessState] = useState<{ [key: number]: DetalhesPalpite }>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<{ [key: number]: boolean }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const [selectedExtratoMatch, setSelectedExtratoMatch] = useState<Partida | null>(null);
  const [lineupTeam, setLineupTeam] = useState<string | null>(null);
  const [suggestionMatch, setSuggestionMatch] = useState<Partida | null>(null);

  // Initialize guesses state from existing predictions
  useEffect(() => {
    const initialState: { [key: number]: DetalhesPalpite } = {};
    matches.forEach(m => {
      const existing = palpites.find(p => p.partida_id === m.id);
      if (existing) {
        initialState[m.id] = { ...existing.dados_palpites };
      } else {
        initialState[m.id] = {
          gols_casa: 0,
          gols_visitante: 0,
          autores_gols: '',
          primeiro_vermelho: 'Nenhum',
          vai_penaltis: 'Não',
          vai_prorrogacao: 'Não',
          quem_classifica: 'Casa',
          cartoes_1t: '0-2',
          cartoes_2t: '0-2',
          escanteios_1t: 0,
          escanteios_2t: 0,
          primeiro_gol: 'Nenhum',
          total_escanteios: 0,
          total_gols_25: 'Menos de 2.5',
          maior_posse: 'Casa',
          ambas_marcam: 'Não',
          vencedor: 'Empate',
          intervalo_0_10: 'Não',
          intervalo_10_20: 'Não',
          intervalo_20_30: 'Não',
          intervalo_30_40: 'Não',
          intervalo_40_50: 'Não',
          intervalo_50_60: 'Não',
          intervalo_60_70: 'Não',
          intervalo_70_80: 'Não',
          intervalo_80_90: 'Não',
        };
      }
    });
    setGuessState(initialState);
  }, [matches, palpites]);

  const handleFieldChange = (matchId: number, field: keyof DetalhesPalpite, value: any) => {
    setGuessState(prev => {
      const current = prev[matchId] || {
        gols_casa: 0, gols_visitante: 0, autores_gols: '', primeiro_vermelho: 'Nenhum',
        vai_penaltis: 'Não', vai_prorrogacao: 'Não', quem_classifica: 'Casa',
        cartoes_1t: '0-2', cartoes_2t: '0-2', escanteios_1t: 0, escanteios_2t: 0,
        primeiro_gol: 'Nenhum', total_escanteios: 0, total_gols_25: 'Menos de 2.5',
        maior_posse: 'Casa', ambas_marcam: 'Não', vencedor: 'Empate',
        intervalo_0_10: 'Não', intervalo_10_20: 'Não', intervalo_20_30: 'Não',
        intervalo_30_40: 'Não', intervalo_40_50: 'Não', intervalo_50_60: 'Não',
        intervalo_60_70: 'Não', intervalo_70_80: 'Não', intervalo_80_90: 'Não'
      };
      
      const updated = { ...current, [field]: value };
      
      // Auto updates
      if (field === 'escanteios_1t' || field === 'escanteios_2t') {
        updated.total_escanteios = Number(updated.escanteios_1t || 0) + Number(updated.escanteios_2t || 0);
      }
      
      if (field === 'gols_casa' || field === 'gols_visitante') {
        const gc = Number(updated.gols_casa || 0);
        const gv = Number(updated.gols_visitante || 0);
        updated.total_gols_25 = (gc + gv) > 2.5 ? 'Mais de 2.5' : 'Menos de 2.5';
        updated.ambas_marcam = (gc > 0 && gv > 0) ? 'Sim' : 'Não';
        updated.vencedor = gc > gv ? 'Casa' : gc < gv ? 'Visitante' : 'Empate';
      }

      return {
        ...prev,
        [matchId]: updated
      };
    });
  };

  const handleSaveAndLock = async (matchId: number) => {
    const data = guessState[matchId];
    if (!data) return;

    if (!user.is_approved) {
      setErrorMsg('Sua conta precisa estar aprovada para salvar palpites! Efetue o pagamento na aba Financeiro.');
      return;
    }

    setErrorMsg(null);
    setSavingId(matchId);
    
    try {
      await onSavePalpite(matchId, data, true); // Envia como travado
      setSaveSuccess(prev => ({ ...prev, [matchId]: true }));
      setTimeout(() => {
        setSaveSuccess(prev => ({ ...prev, [matchId]: false }));
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao travar palpite');
    } finally {
      setSavingId(null);
    }
  };

  // Filter matches - Exclude finished games, only show Live and Future games
  const filteredMatches = matches.filter(m => {
    if (m.status === 'finalizado') {
      return false;
    }
    const hasStarted = new Date(m.horario_inicio) < new Date();
    if (filter === 'pending') {
      return m.status === 'nao_iniciado' && !hasStarted;
    }
    if (filter === 'finished') {
      return m.status === 'ao_vivo' || hasStarted;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Partidas da Copa 2026</h2>
          <p className="text-xs text-gray-400">Preencha todos os palpites e trave antes do jogo!</p>
        </div>
        <button
          id="btn-refresh-matches"
          onClick={onRefreshMatches}
          className="bg-stadium-card hover:bg-stadium-border text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-stadium-border text-gray-300 cursor-pointer"
        >
          Atualizar
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-stadium-card p-1 rounded-xl border border-stadium-border">
        {(['all', 'pending', 'finished'] as const).map((type) => (
          <button
            key={type}
            id={`filter-matches-${type}`}
            onClick={() => setFilter(type)}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              filter === type
                ? 'bg-brand-green text-stadium-dark shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {type === 'all' && 'Todas as Ativas'}
            {type === 'pending' && 'Disponíveis'}
            {type === 'finished' && 'Ao Vivo / Em Andamento'}
          </button>
        ))}
      </div>

      {/* Universal Alert Area */}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl p-3">
          <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!user.is_approved && (
        <div className="flex items-start gap-3 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs rounded-xl p-3">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">🔒 Modo de Visualização apenas</span>
            <p className="text-gray-300 text-[11px] mt-0.5">
              Seu cadastro está pendente de liberação. Faça o PIX na aba Financeiro para começar a palpitar!
            </p>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="bg-stadium-card/40 border border-stadium-border rounded-xl py-12 px-4 text-center text-xs text-gray-400">
          Nenhuma partida ativa encontrada para este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const hasStarted = new Date(match.horario_inicio) < new Date() || match.status !== 'nao_iniciado';
            const existingPalpite = palpites.find(p => p.partida_id === match.id);
            const isLocked = existingPalpite?.is_locked || hasStarted;
            const currentGuess = guessState[match.id] || {
              gols_casa: 0, gols_visitante: 0, autores_gols: '', primeiro_vermelho: 'Nenhum',
              vai_penaltis: 'Não', vai_prorrogacao: 'Não', quem_classifica: 'Casa',
              cartoes_1t: '0-2', cartoes_2t: '0-2', escanteios_1t: 0, escanteios_2t: 0,
              primeiro_gol: 'Nenhum', total_escanteios: 0, total_gols_25: 'Menos de 2.5',
              maior_posse: 'Casa', ambas_marcam: 'Não', vencedor: 'Empate',
              intervalo_0_10: 'Não', intervalo_10_20: 'Não', intervalo_20_30: 'Não',
              intervalo_30_40: 'Não', intervalo_40_50: 'Não', intervalo_50_60: 'Não',
              intervalo_60_70: 'Não', intervalo_70_80: 'Não', intervalo_80_90: 'Não'
            };

            const isExpanded = expandedMatchId === match.id;

            return (
              <div
                key={match.id}
                className={`bg-stadium-card border rounded-2xl overflow-hidden transition-all ${
                  isLocked 
                    ? 'border-stadium-border bg-stadium-card/60 opacity-90' 
                    : 'border-brand-green/20 hover:border-brand-green/40 shadow-lg'
                }`}
              >
                {/* Header info */}
                <div className="p-4 bg-stadium-dark/40 border-b border-stadium-border/50 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{getFriendlyTime(match.horario_inicio)}</span>
                  </div>

                  {match.status === 'finalizado' ? (
                    <span className="bg-gray-800 text-gray-400 border border-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Finalizado
                    </span>
                  ) : match.status === 'ao_vivo' ? (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase animate-pulse">
                      <Play className="w-2 h-2 fill-red-400" /> Ao Vivo
                    </span>
                  ) : isLocked ? (
                    <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Travado
                    </span>
                  ) : (
                    <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Disponível
                    </span>
                  )}
                </div>

                {/* Main Scoreboard Layout */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-7 items-center gap-2">
                    {/* Home Team */}
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-bold text-white block truncate">{match.time_casa}</span>
                      <button
                        type="button"
                        onClick={() => setLineupTeam(match.time_casa)}
                        className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 text-[9px] font-bold text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 rounded border border-brand-gold/20 cursor-pointer"
                      >
                        📋 Escalação
                      </button>
                    </div>

                    {/* Home goals selector */}
                    <div className="col-span-1 flex justify-end">
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        disabled={isLocked || !user.is_approved}
                        value={currentGuess.gols_casa}
                        onChange={(e) => handleFieldChange(match.id, 'gols_casa', Number(e.target.value.replace(/\D/g, '')))}
                        className="w-10 h-10 bg-stadium-dark/80 disabled:bg-stadium-dark/40 border border-stadium-border focus:border-brand-green text-center text-sm font-bold font-mono rounded-xl text-white outline-none"
                      />
                    </div>

                    {/* Divider */}
                    <div className="col-span-1 flex flex-col items-center justify-center">
                      {match.status !== 'nao_iniciado' ? (
                        <div className="text-xs font-mono font-bold text-brand-gold">
                          {match.gols_casa} - {match.gols_visitante}
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-600">VS</span>
                      )}
                    </div>

                    {/* Away goals selector */}
                    <div className="col-span-1 flex justify-start">
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        disabled={isLocked || !user.is_approved}
                        value={currentGuess.gols_visitante}
                        onChange={(e) => handleFieldChange(match.id, 'gols_visitante', Number(e.target.value.replace(/\D/g, '')))}
                        className="w-10 h-10 bg-stadium-dark/80 disabled:bg-stadium-dark/40 border border-stadium-border focus:border-brand-green text-center text-sm font-bold font-mono rounded-xl text-white outline-none"
                      />
                    </div>

                    {/* Away Team */}
                    <div className="col-span-2 text-left">
                      <span className="text-xs font-bold text-white block truncate">{match.time_visitante}</span>
                      <button
                        type="button"
                        onClick={() => setLineupTeam(match.time_visitante)}
                        className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 text-[9px] font-bold text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 rounded border border-brand-gold/20 cursor-pointer"
                      >
                        📋 Escalação
                      </button>
                    </div>
                  </div>

                  {/* Toggle Quiz Sheet Accordion */}
                  <button
                    onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                    className="w-full bg-stadium-dark/50 hover:bg-stadium-dark border border-stadium-border/80 rounded-xl py-2 px-3.5 flex items-center justify-between text-xs font-semibold text-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-brand-gold animate-bounce" />
                      <span>{isExpanded ? 'Esconder critérios extras' : 'Responder os 20 critérios de pontuação'}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* 20 criteria Expanded Quiz */}
                  {isExpanded && (
                    <div className="space-y-4 pt-2 border-t border-stadium-border/40 animate-fade-in text-xs text-gray-300">
                      
                      {/* Smart Oracle Suggestion Bar */}
                      <div className="bg-gradient-to-r from-brand-gold/15 to-stadium-card border border-brand-gold/20 rounded-xl p-3 flex justify-between items-center gap-2">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-brand-gold mt-0.5 animate-pulse shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-brand-gold block uppercase tracking-wider">Sugestão de Wagner (Pier do Costa)</span>
                            <p className="text-[10px] text-gray-300 leading-normal">
                              Deseja que nosso algoritmo gere um palpite matemático completo para este jogo?
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isLocked || !user.is_approved}
                          onClick={() => {
                            const suggested = getSmartSuggestion(match);
                            setGuessState(prev => ({
                              ...prev,
                              [match.id]: suggested
                            }));
                          }}
                          className="bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-40 text-stadium-dark font-black text-[9px] uppercase px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all"
                        >
                          Aplicar Dica
                        </button>
                      </div>

                      {/* 1. Goleadores */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-brand-gold block">Jogadores que farão gols (+35 PTS por acerto)</label>
                        <input
                          type="text"
                          disabled={isLocked || !user.is_approved}
                          placeholder="Ex: Neymar, Vinicius Jr (separados por vírgula)"
                          value={currentGuess.autores_gols}
                          onChange={(e) => handleFieldChange(match.id, 'autores_gols', e.target.value)}
                          className="w-full bg-stadium-dark border border-stadium-border focus:border-brand-green rounded-xl py-2 px-3 text-white placeholder-gray-600 outline-none text-xs"
                        />
                      </div>

                      {/* Flex grid for switches */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* 2. Primeiro Cartão Vermelho */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Primeiro Vermelho (+30 PTS)</label>
                          <select
                            disabled={isLocked || !user.is_approved}
                            value={currentGuess.primeiro_vermelho}
                            onChange={(e) => handleFieldChange(match.id, 'primeiro_vermelho', e.target.value)}
                            className="w-full bg-stadium-dark border border-stadium-border rounded-xl py-2 px-2.5 text-white outline-none"
                          >
                            <option value="Nenhum">Nenhum</option>
                            <option value="Casa">{match.time_casa}</option>
                            <option value="Visitante">{match.time_visitante}</option>
                          </select>
                        </div>

                        {/* 3. Quem faz o Primeiro Gol */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Primeiro Gol (+15 PTS)</label>
                          <select
                            disabled={isLocked || !user.is_approved}
                            value={currentGuess.primeiro_gol}
                            onChange={(e) => handleFieldChange(match.id, 'primeiro_gol', e.target.value)}
                            className="w-full bg-stadium-dark border border-stadium-border rounded-xl py-2 px-2.5 text-white outline-none"
                          >
                            <option value="Nenhum">Nenhum</option>
                            <option value="Casa">{match.time_casa}</option>
                            <option value="Visitante">{match.time_visitante}</option>
                          </select>
                        </div>

                        {/* 4. Vai ter Prorrogação */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Prorrogação? (+25 PTS)</label>
                          <div className="flex bg-stadium-dark border border-stadium-border p-0.5 rounded-xl">
                            {['Sim', 'Não'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                disabled={isLocked || !user.is_approved}
                                onClick={() => handleFieldChange(match.id, 'vai_prorrogacao', opt)}
                                className={`flex-1 py-1 text-center rounded-lg ${currentGuess.vai_prorrogacao === opt ? 'bg-brand-green text-stadium-dark font-bold' : 'text-gray-400'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 5. Vai para Pênaltis */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Pênaltis? (+25 PTS)</label>
                          <div className="flex bg-stadium-dark border border-stadium-border p-0.5 rounded-xl">
                            {['Sim', 'Não'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                disabled={isLocked || !user.is_approved}
                                onClick={() => handleFieldChange(match.id, 'vai_penaltis', opt)}
                                className={`flex-1 py-1 text-center rounded-lg ${currentGuess.vai_penaltis === opt ? 'bg-brand-green text-stadium-dark font-bold' : 'text-gray-400'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 6. Cartões 1T with yellow & red flags */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                            <span className="w-2.5 h-3.5 bg-yellow-400 rounded-sm inline-block shadow-sm"></span>
                            <span className="w-2.5 h-3.5 bg-red-500 rounded-sm inline-block shadow-sm"></span>
                            <span>Cartões 1ºT (+20 PTS)</span>
                          </label>
                          <select
                            disabled={isLocked || !user.is_approved}
                            value={currentGuess.cartoes_1t}
                            onChange={(e) => handleFieldChange(match.id, 'cartoes_1t', e.target.value)}
                            className="w-full bg-stadium-dark border border-stadium-border rounded-xl py-2 px-2.5 text-white outline-none"
                          >
                            <option value="0-2">🟨 0 a 2 cartões</option>
                            <option value="3-4">🟨🟨 3 a 4 cartões</option>
                            <option value="5+">🟥 5 ou mais</option>
                          </select>
                        </div>

                        {/* 7. Cartões 2T with yellow & red flags */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                            <span className="w-2.5 h-3.5 bg-yellow-400 rounded-sm inline-block shadow-sm"></span>
                            <span className="w-2.5 h-3.5 bg-red-500 rounded-sm inline-block shadow-sm"></span>
                            <span>Cartões 2ºT (+20 PTS)</span>
                          </label>
                          <select
                            disabled={isLocked || !user.is_approved}
                            value={currentGuess.cartoes_2t}
                            onChange={(e) => handleFieldChange(match.id, 'cartoes_2t', e.target.value)}
                            className="w-full bg-stadium-dark border border-stadium-border rounded-xl py-2 px-2.5 text-white outline-none"
                          >
                            <option value="0-2">🟨 0 a 2 cartões</option>
                            <option value="3-4">🟨🟨 3 a 4 cartões</option>
                            <option value="5+">🟥 5 ou mais</option>
                          </select>
                        </div>

                        {/* Corner predictions container (col-span-2) */}
                        <div className="col-span-2 bg-brand-gold/5 border border-brand-gold/35 rounded-2xl p-3.5 space-y-3 my-1">
                          <div className="flex items-center gap-1.5 pb-1 border-b border-brand-gold/20">
                            <span className="text-xs font-black text-brand-gold tracking-wider uppercase flex items-center gap-1.5">
                              🚩 PALPITE EXATO DE ESCANTEIOS (+20 PTS cada)
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {/* Escanteios 1T */}
                            <div className="space-y-1 text-center bg-stadium-dark/95 p-2 rounded-xl border border-stadium-border/60">
                              <label className="text-[9px] uppercase font-black text-gray-300 block">1º Tempo</label>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <button
                                  type="button"
                                  disabled={isLocked || !user.is_approved || Number(currentGuess.escanteios_1t || 0) <= 0}
                                  onClick={() => handleFieldChange(match.id, 'escanteios_1t', Math.max(0, Number(currentGuess.escanteios_1t || 0) - 1))}
                                  className="w-7 h-7 bg-stadium-card hover:bg-stadium-border text-gray-300 font-extrabold text-xs rounded-lg flex items-center justify-center border border-stadium-border cursor-pointer select-none"
                                >
                                  -
                                </button>
                                <span className="text-sm font-mono font-black text-brand-gold min-w-[20px] text-center">
                                  {currentGuess.escanteios_1t || 0}
                                </span>
                                <button
                                  type="button"
                                  disabled={isLocked || !user.is_approved}
                                  onClick={() => handleFieldChange(match.id, 'escanteios_1t', Number(currentGuess.escanteios_1t || 0) + 1)}
                                  className="w-7 h-7 bg-stadium-card hover:bg-stadium-border text-gray-300 font-extrabold text-xs rounded-lg flex items-center justify-center border border-stadium-border cursor-pointer select-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Escanteios 2T */}
                            <div className="space-y-1 text-center bg-stadium-dark/95 p-2 rounded-xl border border-stadium-border/60">
                              <label className="text-[9px] uppercase font-black text-gray-300 block">2º Tempo</label>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <button
                                  type="button"
                                  disabled={isLocked || !user.is_approved || Number(currentGuess.escanteios_2t || 0) <= 0}
                                  onClick={() => handleFieldChange(match.id, 'escanteios_2t', Math.max(0, Number(currentGuess.escanteios_2t || 0) - 1))}
                                  className="w-7 h-7 bg-stadium-card hover:bg-stadium-border text-gray-300 font-extrabold text-xs rounded-lg flex items-center justify-center border border-stadium-border cursor-pointer select-none"
                                >
                                  -
                                </button>
                                <span className="text-sm font-mono font-black text-brand-gold min-w-[20px] text-center">
                                  {currentGuess.escanteios_2t || 0}
                                </span>
                                <button
                                  type="button"
                                  disabled={isLocked || !user.is_approved}
                                  onClick={() => handleFieldChange(match.id, 'escanteios_2t', Number(currentGuess.escanteios_2t || 0) + 1)}
                                  className="w-7 h-7 bg-stadium-card hover:bg-stadium-border text-gray-300 font-extrabold text-xs rounded-lg flex items-center justify-center border border-stadium-border cursor-pointer select-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 10. Maior Posse */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Maior Posse (+15 PTS)</label>
                          <select
                            disabled={isLocked || !user.is_approved}
                            value={currentGuess.maior_posse}
                            onChange={(e) => handleFieldChange(match.id, 'maior_posse', e.target.value)}
                            className="w-full bg-stadium-dark border border-stadium-border rounded-xl py-2 px-2.5 text-white outline-none"
                          >
                            <option value="Casa">{match.time_casa}</option>
                            <option value="Visitante">{match.time_visitante}</option>
                          </select>
                        </div>

                        {/* 11. Quem Classifica */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Classifica? (+20 PTS)</label>
                          <select
                            disabled={isLocked || !user.is_approved}
                            value={currentGuess.quem_classifica}
                            onChange={(e) => handleFieldChange(match.id, 'quem_classifica', e.target.value)}
                            className="w-full bg-stadium-dark border border-stadium-border rounded-xl py-2 px-2.5 text-white outline-none"
                          >
                            <option value="Casa">{match.time_casa}</option>
                            <option value="Visitante">{match.time_visitante}</option>
                          </select>
                        </div>

                        {/* 13. Gols Mais/Menos de 2.5 Selection */}
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Total de Gols (Mais/Menos de 2.5) (+15 PTS)</label>
                          <div className="flex bg-stadium-dark border border-stadium-border p-0.5 rounded-xl">
                            {['Mais de 2.5', 'Menos de 2.5'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                disabled={isLocked || !user.is_approved}
                                onClick={() => handleFieldChange(match.id, 'total_gols_25', opt as any)}
                                className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  currentGuess.total_gols_25 === opt 
                                    ? 'bg-brand-green text-stadium-dark shadow-sm font-extrabold' 
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Display calculations */}
                      <div className="bg-stadium-dark/40 border border-stadium-border rounded-xl p-3 grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-gray-500 block">Total Escanteios:</span>
                          <span className="font-bold text-brand-green">{currentGuess.total_escanteios}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Ambas Marcam:</span>
                          <span className="font-bold text-brand-green">{currentGuess.ambas_marcam}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Faixa Gols (2.5):</span>
                          <span className="font-bold text-brand-green">{currentGuess.total_gols_25}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Resultado do Jogo:</span>
                          <span className="font-bold text-brand-green">{currentGuess.vencedor === 'Casa' ? match.time_casa : currentGuess.vencedor === 'Visitante' ? match.time_visitante : 'Empate'}</span>
                        </div>
                      </div>

                      {/* 12. Gols por blocos de 10 minutos */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-brand-gold block">Gols em Intervalos de 10 min (+10 PTS por acerto)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'intervalo_0_10', label: "0' - 10'" },
                            { key: 'intervalo_10_20', label: "10' - 20'" },
                            { key: 'intervalo_20_30', label: "20' - 30'" },
                            { key: 'intervalo_30_40', label: "30' - 40'" },
                            { key: 'intervalo_40_50', label: "40' - 50'" },
                            { key: 'intervalo_50_60', label: "50' - 60'" },
                            { key: 'intervalo_60_70', label: "60' - 70'" },
                            { key: 'intervalo_70_80', label: "70' - 80'" },
                            { key: 'intervalo_80_90', label: "80' - 90'" },
                          ].map((item) => {
                            const active = (currentGuess as any)[item.key] === 'Sim';
                            return (
                              <button
                                key={item.key}
                                type="button"
                                disabled={isLocked || !user.is_approved}
                                onClick={() => handleFieldChange(match.id, item.key as any, active ? 'Não' : 'Sim')}
                                className={`py-2 px-1 text-center font-mono font-bold rounded-lg border text-[10px] transition-all cursor-pointer ${
                                  active 
                                    ? 'bg-brand-green border-brand-green text-stadium-dark shadow-md'
                                    : 'bg-stadium-dark border-stadium-border text-gray-400 hover:border-gray-600'
                                }`}
                              >
                                {item.label} : {active ? 'SIM' : 'NÃO'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission locks row */}
                  <div className="pt-2 border-t border-stadium-border/30 flex flex-col gap-2">
                    {match.status === 'finalizado' && (
                      <button
                        id={`btn-extrato-${match.id}`}
                        onClick={() => setSelectedExtratoMatch(match)}
                        className="w-full bg-brand-gold hover:bg-brand-gold/90 text-stadium-dark font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Award className="w-4 h-4" />
                        <span>📋 Ver Meu Extrato de Pontos</span>
                      </button>
                    )}

                    {isLocked ? (
                      match.status !== 'finalizado' && (
                        <div className="bg-stadium-dark/80 border border-stadium-border rounded-xl py-2 px-4 flex items-center gap-2 text-xs text-gray-400 font-bold w-full justify-center">
                          <Lock className="w-4 h-4 text-brand-gold shrink-0" />
                          <span>Formulário Travado (Apenas Leitura)</span>
                        </div>
                      )
                    ) : (
                      <button
                        id={`btn-match-${match.id}-lock`}
                        disabled={savingId === match.id || !user.is_approved}
                        onClick={() => handleSaveAndLock(match.id)}
                        className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-green/30 text-stadium-dark font-extrabold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-brand-green/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {savingId === match.id ? (
                          <div className="w-4 h-4 border-2 border-stadium-dark border-t-transparent rounded-full animate-spin" />
                        ) : saveSuccess[match.id] ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3px]" />
                            <span>Palpites Salvos e Travados!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>💾 Salvar e Travar Palpites</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Extrato Pontos Modal */}
      {selectedExtratoMatch && (() => {
        const match = selectedExtratoMatch;
        const p = palpites.find(plp => plp.partida_id === match.id)?.dados_palpites;
        
        return (
          <div className="fixed inset-0 z-50 bg-stadium-dark/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-stadium-card border border-brand-gold/30 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="p-4 border-b border-stadium-border flex justify-between items-center bg-stadium-dark/60">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-gold" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Extrato de Pontos</h3>
                    <p className="text-[10px] text-gray-400">{match.time_casa} vs {match.time_visitante}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExtratoMatch(null)}
                  className="bg-stadium-dark hover:bg-stadium-border text-gray-400 hover:text-white rounded-lg p-1 px-2.5 text-xs font-bold cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1 no-scrollbar text-xs">
                {!p ? (
                  <div className="py-12 text-center text-gray-400">
                    Você não registrou palpites para este jogo antes de fechar!
                  </div>
                ) : (() => {
                  const items = [
                    // 1. Placar Exato
                    {
                      label: "Placar Exato",
                      guess: `${p.gols_casa} x ${p.gols_visitante}`,
                      official: `${match.gols_casa} x ${match.gols_visitante}`,
                      isOk: Number(p.gols_casa) === Number(match.gols_casa) && Number(p.gols_visitante) === Number(match.gols_visitante),
                      pts: (Number(p.gols_casa) === Number(match.gols_casa) && Number(p.gols_visitante) === Number(match.gols_visitante)) ? 50 : 0,
                      max: 50
                    },
                    // 2. Autores dos gols
                    (() => {
                      let matched = 0;
                      if (p.autores_gols && match.resultado_autores_gols) {
                        const pScorers = p.autores_gols.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                        const rScorers = match.resultado_autores_gols.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                        for (const ps of pScorers) {
                          if (rScorers.some(rs => rs.includes(ps) || ps.includes(rs))) {
                            matched++;
                          }
                        }
                      }
                      return {
                        label: "Autores dos Gols",
                        guess: p.autores_gols || "Nenhum",
                        official: match.resultado_autores_gols || "Nenhum",
                        isOk: matched > 0,
                        pts: matched * 35,
                        max: 35
                      };
                    })(),
                    // 3. Primeiro Vermelho
                    {
                      label: "Primeiro Cartão Vermelho",
                      guess: p.primeiro_vermelho === 'Casa' ? match.time_casa : p.primeiro_vermelho === 'Visitante' ? match.time_visitante : 'Nenhum',
                      official: match.resultado_primeiro_vermelho === 'Casa' ? match.time_casa : match.resultado_primeiro_vermelho === 'Visitante' ? match.time_visitante : 'Nenhum',
                      isOk: p.primeiro_vermelho === match.resultado_primeiro_vermelho,
                      pts: p.primeiro_vermelho === match.resultado_primeiro_vermelho ? 30 : 0,
                      max: 30
                    },
                    // 4. Vai penaltis
                    {
                      label: "Teve Pênaltis?",
                      guess: p.vai_penaltis,
                      official: match.resultado_vai_penaltis || "Não",
                      isOk: p.vai_penaltis === match.resultado_vai_penaltis,
                      pts: p.vai_penaltis === match.resultado_vai_penaltis ? 25 : 0,
                      max: 25
                    },
                    // 5. Vai prorrogacao
                    {
                      label: "Teve Prorrogação?",
                      guess: p.vai_prorrogacao,
                      official: match.resultado_vai_prorrogacao || "Não",
                      isOk: p.vai_prorrogacao === match.resultado_vai_prorrogacao,
                      pts: p.vai_prorrogacao === match.resultado_vai_prorrogacao ? 25 : 0,
                      max: 25
                    },
                    // 6. Quem Classifica
                    {
                      label: "Quem Classifica?",
                      guess: p.quem_classifica === 'Casa' ? match.time_casa : match.time_visitante,
                      official: match.resultado_quem_classifica === 'Casa' ? match.time_casa : match.time_visitante,
                      isOk: p.quem_classifica === match.resultado_quem_classifica,
                      pts: p.quem_classifica === match.resultado_quem_classifica ? 20 : 0,
                      max: 20
                    },
                    // 7. Cartões 1T
                    {
                      label: "Cartões Amarelos 1ºT",
                      guess: p.cartoes_1t,
                      official: match.resultado_cartoes_1t || "0-2",
                      isOk: p.cartoes_1t === match.resultado_cartoes_1t,
                      pts: p.cartoes_1t === match.resultado_cartoes_1t ? 20 : 0,
                      max: 20
                    },
                    // 8. Cartões 2T
                    {
                      label: "Cartões Amarelos 2ºT",
                      guess: p.cartoes_2t,
                      official: match.resultado_cartoes_2t || "0-2",
                      isOk: p.cartoes_2t === match.resultado_cartoes_2t,
                      pts: p.cartoes_2t === match.resultado_cartoes_2t ? 20 : 0,
                      max: 20
                    },
                    // 9. Escanteios 1T
                    {
                      label: "Escanteios 1ºTempo",
                      guess: String(p.escanteios_1t),
                      official: String(match.resultado_escanteios_1t ?? 0),
                      isOk: Number(p.escanteios_1t) === Number(match.resultado_escanteios_1t),
                      pts: Number(p.escanteios_1t) === Number(match.resultado_escanteios_1t) ? 20 : 0,
                      max: 20
                    },
                    // 10. Escanteios 2T
                    {
                      label: "Escanteios 2ºTempo",
                      guess: String(p.escanteios_2t),
                      official: String(match.resultado_escanteios_2t ?? 0),
                      isOk: Number(p.escanteios_2t) === Number(match.resultado_escanteios_2t),
                      pts: Number(p.escanteios_2t) === Number(match.resultado_escanteios_2t) ? 20 : 0,
                      max: 20
                    },
                    // 11. Primeiro Gol
                    {
                      label: "Primeiro Gol",
                      guess: p.primeiro_gol === 'Casa' ? match.time_casa : p.primeiro_gol === 'Visitante' ? match.time_visitante : 'Nenhum',
                      official: match.resultado_primeiro_gol === 'Casa' ? match.time_casa : match.resultado_primeiro_gol === 'Visitante' ? match.time_visitante : 'Nenhum',
                      isOk: p.primeiro_gol === match.resultado_primeiro_gol,
                      pts: p.primeiro_gol === match.resultado_primeiro_gol ? 15 : 0,
                      max: 15
                    },
                    // 12. Total Escanteios
                    {
                      label: "Total de Escanteios",
                      guess: String(p.total_escanteios),
                      official: String(match.resultado_total_escanteios ?? 0),
                      isOk: Number(p.total_escanteios) === Number(match.resultado_total_escanteios),
                      pts: Number(p.total_escanteios) === Number(match.resultado_total_escanteios) ? 15 : 0,
                      max: 15
                    },
                    // 13. Gols Mais/Menos de 2.5
                    {
                      label: "Faixa de Gols (2.5)",
                      guess: p.total_gols_25,
                      official: match.resultado_total_gols_25 || "Menos de 2.5",
                      isOk: p.total_gols_25 === match.resultado_total_gols_25,
                      pts: p.total_gols_25 === match.resultado_total_gols_25 ? 15 : 0,
                      max: 15
                    },
                    // 14. Maior Posse
                    {
                      label: "Maior Posse de Bola",
                      guess: p.maior_posse === 'Casa' ? match.time_casa : match.time_visitante,
                      official: match.resultado_maior_posse === 'Casa' ? match.time_casa : match.time_visitante,
                      isOk: p.maior_posse === match.resultado_maior_posse,
                      pts: p.maior_posse === match.resultado_maior_posse ? 15 : 0,
                      max: 15
                    },
                    // 15. Ambas marcam
                    {
                      label: "Ambas Marcam Gol",
                      guess: p.ambas_marcam,
                      official: match.resultado_ambas_marcam || "Não",
                      isOk: p.ambas_marcam === match.resultado_ambas_marcam,
                      pts: p.ambas_marcam === match.resultado_ambas_marcam ? 10 : 0,
                      max: 10
                    },
                    // 16. Vencedor do Jogo
                    {
                      label: "Resultado do Jogo (1X2)",
                      guess: p.vencedor === 'Casa' ? match.time_casa : p.vencedor === 'Visitante' ? match.time_visitante : 'Empate',
                      official: match.resultado_vencedor === 'Casa' ? match.time_casa : match.resultado_vencedor === 'Visitante' ? match.time_visitante : 'Empate',
                      isOk: p.vencedor === match.resultado_vencedor,
                      pts: p.vencedor === match.resultado_vencedor ? 10 : 0,
                      max: 10
                    },
                    // 17-25. Intervalos
                    ...[
                      { key: 'intervalo_0_10', resKey: 'resultado_intervalo_0_10', label: "Gol de 0' a 10'" },
                      { key: 'intervalo_10_20', resKey: 'resultado_intervalo_10_20', label: "Gol de 10' a 20'" },
                      { key: 'intervalo_20_30', resKey: 'resultado_intervalo_20_30', label: "Gol de 20' a 30'" },
                      { key: 'intervalo_30_40', resKey: 'resultado_intervalo_30_40', label: "Gol de 30' a 40'" },
                      { key: 'intervalo_40_50', resKey: 'resultado_intervalo_40_50', label: "Gol de 40' a 50'" },
                      { key: 'intervalo_50_60', resKey: 'resultado_intervalo_50_60', label: "Gol de 50' a 60'" },
                      { key: 'intervalo_60_70', resKey: 'resultado_intervalo_60_70', label: "Gol de 60' a 70'" },
                      { key: 'intervalo_70_80', resKey: 'resultado_intervalo_70_80', label: "Gol de 70' a 80'" },
                      { key: 'intervalo_80_90', resKey: 'resultado_intervalo_80_90', label: "Gol de 80' a 90'" },
                    ].map(int => {
                      const guessVal = (p as any)[int.key];
                      const officialVal = (match as any)[int.resKey] || 'Não';
                      return {
                        label: int.label,
                        guess: guessVal,
                        official: officialVal,
                        isOk: guessVal === officialVal,
                        pts: guessVal === officialVal ? 10 : 0,
                        max: 10
                      };
                    })
                  ];

                  const totalEarned = items.reduce((acc, current) => acc + current.pts, 0);

                  return (
                    <div className="space-y-4">
                      {/* Banner de pontuação acumulada */}
                      <div className="bg-brand-gold/10 border border-brand-gold/20 p-3 rounded-2xl flex justify-between items-center animate-pulse">
                        <span className="text-gray-300 font-bold uppercase tracking-wider text-[10px]">Pontuação neste Jogo:</span>
                        <span className="text-xl font-black text-brand-gold font-mono">{totalEarned} PTS</span>
                      </div>

                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className={`p-2.5 rounded-xl border flex justify-between items-center transition-all ${
                              item.isOk 
                                ? 'bg-brand-green/5 border-brand-green/20' 
                                : 'bg-stadium-dark/40 border-stadium-border/40'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-[11px] text-white block">{item.label}</span>
                              <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                                <span>Palpite: <strong className={item.isOk ? 'text-brand-green' : 'text-gray-300'}>{item.guess}</strong></span>
                                <span>•</span>
                                <span>Oficial: <strong className="text-brand-gold">{item.official}</strong></span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`text-xs font-bold font-mono ${item.isOk ? 'text-brand-green' : 'text-gray-400'}`}>
                                +{item.pts}
                              </span>
                              <span className="text-[9px] text-gray-500 block">de {item.max}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="p-3 bg-stadium-dark/60 border-t border-stadium-border flex justify-end">
                <button
                  onClick={() => setSelectedExtratoMatch(null)}
                  className="bg-brand-gold hover:bg-brand-gold/90 text-stadium-dark font-black text-xs py-2 px-6 rounded-xl cursor-pointer"
                >
                  Fechar Extrato
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 📋 Escalação Real-Time Tactical Modal Overlay */}
      {lineupTeam && (() => {
        const lineup = getLineupForTeam(lineupTeam);
        return (
          <div className="fixed inset-0 bg-stadium-dark/95 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-stadium-card border border-brand-gold/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="p-4 bg-stadium-dark border-b border-stadium-border flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-brand-gold block">Escalação em Tempo Real</span>
                  <h3 className="text-sm font-black text-white uppercase">{lineupTeam}</h3>
                </div>
                <span className="bg-brand-green/20 text-brand-green text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-brand-green/30">
                  {lineup.formation}
                </span>
              </div>

              {/* Pitch Preview */}
              <div className="p-4 bg-gradient-to-b from-green-950 to-green-900 relative overflow-hidden h-[240px] flex flex-col justify-between border-b border-stadium-border">
                {/* Grass stripes and pitch markings */}
                <div className="absolute inset-x-0 top-0 h-1/5 bg-white/5 border-b border-white/5"></div>
                <div className="absolute inset-x-0 top-1/5 h-1/5 bg-black/5 border-b border-white/5"></div>
                <div className="absolute inset-x-0 top-2/5 h-1/5 bg-white/5 border-b border-white/5"></div>
                <div className="absolute inset-x-0 top-3/5 h-1/5 bg-black/5 border-b border-white/5"></div>
                <div className="absolute inset-x-0 top-4/5 h-1/5 bg-white/5 border-b border-white/5"></div>
                <div className="absolute inset-0 border-2 border-white/10 m-3 rounded-xl pointer-events-none flex flex-col justify-between">
                  {/* Goal areas */}
                  <div className="h-6 w-20 border-b border-x border-white/20 mx-auto"></div>
                  <div className="w-12 h-12 border border-white/20 rounded-full mx-auto -my-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="h-6 w-20 border-t border-x border-white/20 mx-auto"></div>
                </div>

                {/* Starters plotted tactically */}
                <div className="z-10 flex flex-col justify-between h-full py-1 text-center">
                  {/* ATA Line */}
                  <div className="flex justify-around">
                    {lineup.starters.filter(p => p.pos === "ATA").map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-brand-gold border-2 border-white text-stadium-dark font-mono font-black text-[9px] flex items-center justify-center shadow-md">
                          {p.num}
                        </div>
                        <span className="text-[9px] font-bold text-white bg-stadium-dark/80 px-1 py-0.5 rounded mt-0.5 max-w-[65px] truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* MEI Line */}
                  <div className="flex justify-around">
                    {lineup.starters.filter(p => p.pos === "MEI").map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-brand-green border-2 border-white text-stadium-dark font-mono font-black text-[9px] flex items-center justify-center shadow-md">
                          {p.num}
                        </div>
                        <span className="text-[9px] font-bold text-white bg-stadium-dark/80 px-1 py-0.5 rounded mt-0.5 max-w-[65px] truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* DEF Line */}
                  <div className="flex justify-around">
                    {lineup.starters.filter(p => p.pos === "DEF").map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-stadium-dark text-stadium-dark font-mono font-black text-[9px] flex items-center justify-center shadow-md">
                          {p.num}
                        </div>
                        <span className="text-[9px] font-bold text-white bg-stadium-dark/80 px-1 py-0.5 rounded mt-0.5 max-w-[65px] truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* GOL Line */}
                  <div className="flex justify-around">
                    {lineup.starters.filter(p => p.pos === "GOL").map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white text-white font-mono font-black text-[9px] flex items-center justify-center shadow-md animate-pulse">
                          {p.num}
                        </div>
                        <span className="text-[9px] font-bold text-white bg-stadium-dark/80 px-1 py-0.5 rounded mt-0.5 max-w-[65px] truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Substitutes List */}
              <div className="p-4 space-y-2 bg-stadium-card">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Banco de Reservas</span>
                <div className="grid grid-cols-2 gap-2">
                  {lineup.reserves.map((sub, idx) => (
                    <div key={idx} className="text-[10px] text-gray-300 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0"></span>
                      <span className="truncate">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="p-3 bg-stadium-dark border-t border-stadium-border flex">
                <button
                  type="button"
                  onClick={() => setLineupTeam(null)}
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-stadium-dark font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Fechar Escalação
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
