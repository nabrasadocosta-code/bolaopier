import React, { useState } from 'react';
import { Users, Calendar, Settings, Code, Check, ShieldAlert, Lock, Unlock, RefreshCw, Send, Play, Trash2, PlusCircle, AlertCircle, Copy, Info, Zap, Sparkles } from 'lucide-react';
import { Usuario, Partida, AppConfig } from '../types';
import { formatDateTime } from '../utils';

interface AdminPanelProps {
  adminUser: Usuario;
  allUsers: Usuario[];
  matches: Partida[];
  config: AppConfig;
  onRefreshAll: () => void;
}

export default function AdminPanel({ adminUser, allUsers, matches, config, onRefreshAll }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'matches' | 'config' | 'sql'>('users');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Match Form State
  const [timeCasa, setTimeCasa] = useState('');
  const [timeVisitante, setTimeVisitante] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('2026-06-11T18:00');
  const [fixtureId, setFixtureId] = useState('');
  const [showAddMatch, setShowAddMatch] = useState(false);

  // Config State
  const [pixKey, setPixKey] = useState(config.pixKey || '21975151937');
  const [pixName, setPixName] = useState(config.pixName || 'Wagner Teixeira');
  const [pixCity, setPixCity] = useState(config.pixCity || 'Rio de Janeiro');
  const [apiFootballKey, setApiFootballKey] = useState(config.apiFootballKey || '');
  const [sofascoreLogs, setSofascoreLogs] = useState<string[]>([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Edit Match State
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editGolsCasa, setEditGolsCasa] = useState('');
  const [editGolsVisitante, setEditGolsVisitante] = useState('');
  const [editStatus, setEditStatus] = useState<'nao_iniciado' | 'ao_vivo' | 'finalizado'>('nao_iniciado');

  // Detailed official result outcomes
  const [editAutoresGols, setEditAutoresGols] = useState('');
  const [editPrimeiroVermelho, setEditPrimeiroVermelho] = useState('Nenhum');
  const [editVaiPenaltis, setEditVaiPenaltis] = useState<'Sim' | 'Não'>('Não');
  const [editVaiProrrogacao, setEditVaiProrrogacao] = useState<'Sim' | 'Não'>('Não');
  const [editQuemClassifica, setEditQuemClassifica] = useState<'Casa' | 'Visitante'>('Casa');
  const [editCartoes1t, setEditCartoes1t] = useState<'0-2' | '3-4' | '5+'>('0-2');
  const [editCartoes2t, setEditCartoes2t] = useState<'0-2' | '3-4' | '5+'>('0-2');
  const [editEscanteios1t, setEditEscanteios1t] = useState(0);
  const [editEscanteios2t, setEditEscanteios2t] = useState(0);
  const [editPrimeiroGol, setEditPrimeiroGol] = useState<'Casa' | 'Visitante' | 'Nenhum'>('Nenhum');
  const [editMaiorPosse, setEditMaiorPosse] = useState<'Casa' | 'Visitante'>('Casa');
  const [editIntervalo0_10, setEditIntervalo0_10] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo10_20, setEditIntervalo10_20] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo20_30, setEditIntervalo20_30] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo30_40, setEditIntervalo30_40] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo40_50, setEditIntervalo40_50] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo50_60, setEditIntervalo50_60] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo60_70, setEditIntervalo60_70] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo70_80, setEditIntervalo70_80] = useState<'Sim' | 'Não'>('Não');
  const [editIntervalo80_90, setEditIntervalo80_90] = useState<'Sim' | 'Não'>('Não');

  const triggerFeedback = (text: string, isError = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // --- USER OPERATIONS ---
  const handleToggleApproval = async (userId: string, currentApproved: boolean) => {
    setLoadingAction(`approve_${userId}`);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: !currentApproved })
      });
      if (!res.ok) throw new Error('Erro ao atualizar aprovação');
      triggerFeedback(`Status do usuário alterado com sucesso!`);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleLock = async (userId: string, currentLocked: boolean) => {
    if (userId === adminUser.id) {
      triggerFeedback('Você não pode bloquear o próprio administrador!', true);
      return;
    }
    setLoadingAction(`lock_${userId}`);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_locked: !currentLocked })
      });
      if (!res.ok) throw new Error('Erro ao atualizar bloqueio');
      triggerFeedback(`Status de bloqueio alterado!`);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetPoints = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja zerar os pontos deste usuário?')) return;
    setLoadingAction(`reset_${userId}`);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/reset`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Erro ao resetar pontos');
      triggerFeedback('Pontos do usuário zerados!');
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  // --- MATCH OPERATIONS ---
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeCasa.trim() || !timeVisitante.trim() || !horarioInicio) {
      triggerFeedback('Preencha os campos obrigatórios', true);
      return;
    }
    setLoadingAction('create_match');
    try {
      const res = await fetch('/api/admin/partidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_casa: timeCasa,
          time_visitante: timeVisitante,
          horario_inicio: new Date(horarioInicio).toISOString(),
          api_fixture_id: fixtureId ? Number(fixtureId) : undefined,
          status: 'nao_iniciado',
          valor_inscricao: 20
        })
      });

      if (!res.ok) throw new Error('Falha ao criar partida');
      triggerFeedback('Nova partida adicionada com sucesso!');
      setTimeCasa('');
      setTimeVisitante('');
      setFixtureId('');
      setShowAddMatch(false);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateMatchResult = async (matchId: number) => {
    setLoadingAction(`update_match_${matchId}`);
    try {
      const payload: any = {
        status: editStatus
      };
      if (editStatus !== 'nao_iniciado') {
        const gc = editGolsCasa !== '' ? Number(editGolsCasa) : 0;
        const gv = editGolsVisitante !== '' ? Number(editGolsVisitante) : 0;
        payload.gols_casa = gc;
        payload.gols_visitante = gv;
        payload.resultado_autores_gols = editAutoresGols;
        payload.resultado_primeiro_vermelho = editPrimeiroVermelho;
        payload.resultado_vai_penaltis = editVaiPenaltis;
        payload.resultado_vai_prorrogacao = editVaiProrrogacao;
        payload.resultado_quem_classifica = editQuemClassifica;
        payload.resultado_cartoes_1t = editCartoes1t;
        payload.resultado_cartoes_2t = editCartoes2t;
        payload.resultado_escanteios_1t = Number(editEscanteios1t || 0);
        payload.resultado_escanteios_2t = Number(editEscanteios2t || 0);
        payload.resultado_primeiro_gol = editPrimeiroGol;
        payload.resultado_total_escanteios = Number(editEscanteios1t || 0) + Number(editEscanteios2t || 0);
        payload.resultado_total_gols_25 = (gc + gv) > 2.5 ? 'Mais de 2.5' : 'Menos de 2.5';
        payload.resultado_maior_posse = editMaiorPosse;
        payload.resultado_ambas_marcam = (gc > 0 && gv > 0) ? 'Sim' : 'Não';
        payload.resultado_vencedor = gc > gv ? 'Casa' : gc < gv ? 'Visitante' : 'Empate';
        payload.resultado_intervalo_0_10 = editIntervalo0_10;
        payload.resultado_intervalo_10_20 = editIntervalo10_20;
        payload.resultado_intervalo_20_30 = editIntervalo20_30;
        payload.resultado_intervalo_30_40 = editIntervalo30_40;
        payload.resultado_intervalo_40_50 = editIntervalo40_50;
        payload.resultado_intervalo_50_60 = editIntervalo50_60;
        payload.resultado_intervalo_60_70 = editIntervalo60_70;
        payload.resultado_intervalo_70_80 = editIntervalo70_80;
        payload.resultado_intervalo_80_90 = editIntervalo80_90;
      } else {
        payload.gols_casa = undefined;
        payload.gols_visitante = undefined;
      }

      const res = await fetch(`/api/admin/partidas/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao atualizar resultado');
      triggerFeedback('Resultado e status da partida gravados com sucesso!');
      setEditingMatchId(null);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    setLoadingAction(`delete_match_${matchId}`);
    try {
      const res = await fetch(`/api/admin/partidas/${matchId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erro ao remover partida');
      triggerFeedback('Partida removida com sucesso!');
      setConfirmDeleteId(null);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  // --- AUTOMATION / CONFIG OPERATIONS ---
  const handleSaveConfig = async () => {
    setLoadingAction('save_config');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixKey,
          pixName,
          pixCity,
          apiFootballKey
        })
      });
      if (!res.ok) throw new Error('Erro ao salvar configurações');
      triggerFeedback('Configurações salvas!');
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRecalculatePoints = async () => {
    setLoadingAction('recalculate');
    try {
      const res = await fetch('/api/admin/recalculate', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao processar recálculo');
      triggerFeedback('Pontuações recalculadas e classificação reorganizada!');
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateResults = async () => {
    if (!window.confirm('Deseja simular placares e finalizar todos os jogos pendentes de forma aleatória?')) return;
    setLoadingAction('simulate');
    try {
      const res = await fetch('/api/admin/simulate-results', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na simulação');
      triggerFeedback(data.message);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAutoSeedMatches = async () => {
    setLoadingAction('auto_seed');
    try {
      const res = await fetch('/api/admin/auto-seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar partidas');
      triggerFeedback(data.message);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFetchFootballApi = async () => {
    setLoadingAction('fetch_api');
    try {
      const res = await fetch('/api/admin/fetch-football-api', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha na requisição');
      triggerFeedback(data.message);
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFetchSofascore = async () => {
    setLoadingAction('fetch_sofascore');
    setSofascoreLogs([]);
    try {
      const res = await fetch('/api/cron-update');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha na requisição');
      
      if (data.logs) {
        setSofascoreLogs(data.logs);
        setShowLogsModal(true);
      }
      triggerFeedback(data.message || 'Sincronização concluída!');
      onRefreshAll();
    } catch (err: any) {
      triggerFeedback(err.message, true);
    } finally {
      setLoadingAction(null);
    }
  };

  // --- SQL SCHEMA TEXT ---
  const supabaseSqlScript = `-- SCRIPT DE BANCO DE DADOS COMPLETO (SUPABASE POSTGRESQL)
-- Acesse o painel do Supabase, clique em 'SQL Editor' e rode este script.

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    telefone TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    pontos_totais INTEGER DEFAULT 0,
    acertos_placar_exato INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Partidas da Copa
CREATE TABLE IF NOT EXISTS partidas (
    id SERIAL PRIMARY KEY,
    api_fixture_id INTEGER UNIQUE, -- ID do jogo na API-Football
    time_casa TEXT NOT NULL,
    time_visitante TEXT NOT NULL,
    horario_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'nao_iniciado', -- 'nao_iniciado', 'ao_vivo', 'finalizado'
    valor_inscricao NUMERIC DEFAULT 20.00,
    gols_casa INTEGER,
    gols_visitante INTEGER
);

-- Tabela de Palpites
CREATE TABLE IF NOT EXISTS palpites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    partida_id INTEGER REFERENCES partidas(id) ON DELETE CASCADE,
    dados_palpites JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT palpite_unico UNIQUE(usuario_id, partida_id)
);

-- Habilitar Row Level Security (RLS) se desejado
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE palpites ENABLE ROW LEVEL SECURITY;

-- Exemplo de Política RLS (Leitura pública para todos e escrita segura)
CREATE POLICY "Leitura Pública de Rankings" ON usuarios 
    FOR SELECT USING (true);

CREATE POLICY "Leitura Pública de Partidas" ON partidas 
    FOR SELECT USING (true);

CREATE POLICY "Usuários criam seus próprios palpites" ON palpites 
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-red-400 font-display flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Painel Administrativo
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Controlador mestre do Wagner Teixeira</p>
        </div>
        <span className="bg-red-500/20 text-red-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-red-500/30">
          Admin Ativo
        </span>
      </div>

      {/* Admin Tabs */}
      <div className="flex bg-stadium-card p-1 rounded-xl border border-stadium-border overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'Participantes', icon: Users },
          { id: 'matches', label: 'Partidas', icon: Calendar },
          { id: 'config', label: 'Automação & Configs', icon: Settings },
          { id: 'sql', label: 'Script SQL', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white shadow shadow-red-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Admin Universal Status Feedback */}
      {feedbackMsg && (
        <div className={`flex items-start gap-3 border rounded-xl p-3 text-xs ${
          feedbackMsg.isError 
            ? 'bg-red-500/10 border-red-500/20 text-red-200' 
            : 'bg-brand-green/10 border-brand-green/20 text-brand-green'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* --- TAB: USERS --- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de Jogadores ({allUsers.length})</h3>
            <span className="text-[10px] text-gray-500">Clique para validar depósitos PIX</span>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="bg-stadium-card border border-stadium-border rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {user.nome}
                      {user.id === adminUser.id && (
                        <span className="bg-red-500/20 text-red-400 text-[8px] px-1 rounded">ADM</span>
                      )}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      Telefone: {user.telefone} • PIN: {user.pin}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    user.is_approved 
                      ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
                      : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'
                  }`}>
                    {user.is_approved ? 'PIX Aprovado' : 'Aguardando PIX'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-stadium-dark/40 p-2 rounded-lg border border-stadium-border/60">
                  <div className="text-gray-400">Pontos Totais: <span className="font-bold text-white font-mono">{user.pontos_totais}</span></div>
                  <div className="text-gray-400">Placares Exatos: <span className="font-bold text-white font-mono">{user.acertos_placar_exato}</span></div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-stadium-border/40">
                  <button
                    id={`btn-admin-approve-${user.id}`}
                    disabled={loadingAction !== null}
                    onClick={() => handleToggleApproval(user.id, user.is_approved)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      user.is_approved 
                        ? 'bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20' 
                        : 'bg-brand-green text-stadium-dark hover:bg-brand-green/90'
                    }`}
                  >
                    {loadingAction === `approve_${user.id}` ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : user.is_approved ? (
                      'Pendente'
                    ) : (
                      'Aprovar PIX'
                    )}
                  </button>

                  <button
                    id={`btn-admin-lock-${user.id}`}
                    disabled={loadingAction !== null || user.id === adminUser.id}
                    onClick={() => handleToggleLock(user.id, user.is_locked)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      user.is_locked
                        ? 'bg-brand-green/10 text-brand-green hover:bg-brand-green/20'
                        : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                    }`}
                  >
                    {user.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{user.is_locked ? 'Desbloquear' : 'Bloquear'}</span>
                  </button>

                  <button
                    id={`btn-admin-reset-${user.id}`}
                    disabled={loadingAction !== null}
                    onClick={() => handleResetPoints(user.id)}
                    className="bg-stadium-dark hover:bg-stadium-border text-gray-400 hover:text-white border border-stadium-border py-1.5 px-2.5 rounded-lg text-[10px] cursor-pointer"
                  >
                    Zerar Pontos
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: MATCHES --- */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Partidas da Copa ({matches.length})</h3>
            <button
              id="admin-btn-show-add"
              onClick={() => setShowAddMatch(!showAddMatch)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showAddMatch ? 'Fechar' : 'Nova Partida'}</span>
            </button>
          </div>

          {/* Form Create Match */}
          {showAddMatch && (
            <form onSubmit={handleCreateMatch} className="bg-stadium-card border border-red-500/20 p-4 rounded-xl space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time Casa</label>
                  <input
                    id="add-match-casa"
                    type="text"
                    required
                    placeholder="Ex: Brasil"
                    value={timeCasa}
                    onChange={(e) => setTimeCasa(e.target.value)}
                    className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time Visitante</label>
                  <input
                    id="add-match-visitante"
                    type="text"
                    required
                    placeholder="Ex: Alemanha"
                    value={timeVisitante}
                    onChange={(e) => setTimeVisitante(e.target.value)}
                    className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Horário de Início</label>
                <input
                  id="add-match-date"
                  type="datetime-local"
                  required
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID Fixture API-Football</label>
                  <span className="text-[9px] text-gray-500">Opcional para automação</span>
                </div>
                <input
                  id="add-match-fixture"
                  type="text"
                  placeholder="Ex: 101452"
                  value={fixtureId}
                  onChange={(e) => setFixtureId(e.target.value)}
                  className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-xs text-white"
                />
              </div>

              <button
                id="add-match-submit"
                type="submit"
                disabled={loadingAction === 'create_match'}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {loadingAction === 'create_match' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Salvar Partida'
                )}
              </button>
            </form>
          )}

          {/* Matches List */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar">
            {matches.map((match) => {
              const isEditing = editingMatchId === match.id;
              return (
                <div
                  key={match.id}
                  className="bg-stadium-card border border-stadium-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>{formatDateTime(match.horario_inicio)}</span>
                    <span className="font-mono">ID Jogo: {match.id} {match.api_fixture_id && `• API Fixture: ${match.api_fixture_id}`}</span>
                  </div>

                  {isEditing ? (
                    <div className="bg-stadium-dark/60 p-3 rounded-lg border border-red-500/20 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold text-white shrink-0">{match.time_casa}</span>
                        <input
                          id={`edit-goals-casa-${match.id}`}
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={editGolsCasa}
                          onChange={(e) => setEditGolsCasa(e.target.value.replace(/\D/g, ''))}
                          placeholder="-"
                          className="w-8 h-8 bg-stadium-card border border-stadium-border text-center text-xs font-bold font-mono rounded text-white"
                        />
                        <span className="text-gray-500">:</span>
                        <input
                          id={`edit-goals-visitante-${match.id}`}
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={editGolsVisitante}
                          onChange={(e) => setEditGolsVisitante(e.target.value.replace(/\D/g, ''))}
                          placeholder="-"
                          className="w-8 h-8 bg-stadium-card border border-stadium-border text-center text-xs font-bold font-mono rounded text-white"
                        />
                        <span className="text-xs font-bold text-white shrink-0">{match.time_visitante}</span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
                        <select
                          id={`edit-status-select-${match.id}`}
                          value={editStatus}
                          onChange={(e: any) => setEditStatus(e.target.value)}
                          className="bg-stadium-card border border-stadium-border rounded text-[11px] text-white py-1 px-2 focus:outline-none animate-pulse"
                        >
                          <option value="nao_iniciado">Não Iniciado</option>
                          <option value="ao_vivo">Ao Vivo</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                      </div>

                      {/* Súmula Manual (Campos Detalhados) */}
                      {(editStatus === 'finalizado' || editStatus === 'ao_vivo') && (
                        <div className="space-y-2 border-t border-stadium-border/40 pt-3 text-[11px] text-gray-300">
                          <span className="text-[10px] uppercase font-bold text-red-400 block">Súmula Manual do Jogo (20 Critérios)</span>
                          
                          {/* Autores dos gols */}
                          <div>
                            <label className="block text-[9px] text-gray-400 font-bold">Autores dos Gols:</label>
                            <input
                              type="text"
                              value={editAutoresGols}
                              onChange={(e) => setEditAutoresGols(e.target.value)}
                              placeholder="Ex: Neymar, Vinicius Jr"
                              className="w-full bg-stadium-card border border-stadium-border rounded py-1 px-2 text-white text-[11px]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Primeiro vermelho */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Primeiro Vermelho:</label>
                              <select
                                value={editPrimeiroVermelho}
                                onChange={(e) => setEditPrimeiroVermelho(e.target.value)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px] outline-none"
                              >
                                <option value="Nenhum">Nenhum</option>
                                <option value="Casa">{match.time_casa}</option>
                                <option value="Visitante">{match.time_visitante}</option>
                              </select>
                            </div>

                            {/* Primeiro Gol */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Primeiro Gol:</label>
                              <select
                                value={editPrimeiroGol}
                                onChange={(e) => setEditPrimeiroGol(e.target.value as any)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px] outline-none"
                              >
                                <option value="Nenhum">Nenhum</option>
                                <option value="Casa">Casa</option>
                                <option value="Visitante">Visitante</option>
                              </select>
                            </div>

                            {/* Prorrogação */}
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold text-brand-gold">Prorrogação?</label>
                              <select
                                value={editVaiProrrogacao}
                                onChange={(e) => setEditVaiProrrogacao(e.target.value as any)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px] outline-none font-bold text-brand-gold"
                              >
                                <option value="Não">Não</option>
                                <option value="Sim">Sim</option>
                              </select>
                            </div>

                            {/* Pênaltis */}
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold text-brand-gold">Pênaltis?</label>
                              <select
                                value={editVaiPenaltis}
                                onChange={(e) => setEditVaiPenaltis(e.target.value as any)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px] outline-none font-bold text-brand-gold"
                              >
                                <option value="Não">Não</option>
                                <option value="Sim">Sim</option>
                              </select>
                            </div>

                            {/* Cartões 1T */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Cartões 1ºT:</label>
                              <select
                                value={editCartoes1t}
                                onChange={(e) => setEditCartoes1t(e.target.value as any)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px]"
                              >
                                <option value="0-2">0 a 2</option>
                                <option value="3-4">3 a 4</option>
                                <option value="5+">5 ou mais</option>
                              </select>
                            </div>

                            {/* Cartões 2T */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Cartões 2ºT:</label>
                              <select
                                value={editCartoes2t}
                                onChange={(e) => setEditCartoes2t(e.target.value as any)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px]"
                              >
                                <option value="0-2">0 a 2</option>
                                <option value="3-4">3 a 4</option>
                                <option value="5+">5 ou mais</option>
                              </select>
                            </div>

                            {/* Escanteios 1T */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Escanteios 1ºT:</label>
                              <input
                                type="number"
                                value={editEscanteios1t}
                                onChange={(e) => setEditEscanteios1t(Number(e.target.value))}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 px-2 text-white text-[11px]"
                              />
                            </div>

                            {/* Escanteios 2T */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Escanteios 2ºT:</label>
                              <input
                                type="number"
                                value={editEscanteios2t}
                                onChange={(e) => setEditEscanteios2t(Number(e.target.value))}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 px-2 text-white text-[11px]"
                              />
                            </div>

                            {/* Maior Posse */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Maior Posse:</label>
                              <select
                                value={editMaiorPosse}
                                onChange={(e) => setEditMaiorPosse(e.target.value as any)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px]"
                              >
                                <option value="Casa">Time Casa</option>
                                <option value="Visitante">Time Visitante</option>
                              </select>
                            </div>

                            {/* Quem Classifica */}
                            <div>
                              <label className="block text-[9px] text-gray-400">Classificado:</label>
                              <select
                                value={editQuemClassifica}
                                onChange={(e) => setEditQuemClassifica(e.target.value as any)}
                                className="w-full bg-stadium-card border border-stadium-border rounded py-1 text-white text-[11px]"
                              >
                                <option value="Casa">Time Casa</option>
                                <option value="Visitante">Time Visitante</option>
                              </select>
                            </div>
                          </div>

                          {/* Intervalos gols */}
                          <div className="pt-1.5">
                            <label className="block text-[9px] text-gray-400 mb-1">Intervalos com Gol (Sim/Não):</label>
                            <div className="grid grid-cols-3 gap-1 text-[8px]">
                              {[
                                { state: editIntervalo0_10, setter: setEditIntervalo0_10, label: "0-10'" },
                                { state: editIntervalo10_20, setter: setEditIntervalo10_20, label: "10-20'" },
                                { state: editIntervalo20_30, setter: setEditIntervalo20_30, label: "20-30'" },
                                { state: editIntervalo30_40, setter: setEditIntervalo30_40, label: "30-40'" },
                                { state: editIntervalo40_50, setter: setEditIntervalo40_50, label: "40-50'" },
                                { state: editIntervalo50_60, setter: setEditIntervalo50_60, label: "50-60'" },
                                { state: editIntervalo60_70, setter: setEditIntervalo60_70, label: "60-70'" },
                                { state: editIntervalo70_80, setter: setEditIntervalo70_80, label: "70-80'" },
                                { state: editIntervalo80_90, setter: setEditIntervalo80_90, label: "80-90'" },
                              ].map((item, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => item.setter(item.state === 'Sim' ? 'Não' : 'Sim')}
                                  className={`py-1 px-0.5 rounded border text-center font-bold ${
                                    item.state === 'Sim' 
                                      ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                                      : 'bg-stadium-card text-gray-500 border-stadium-border'
                                  }`}
                                >
                                  {item.label}: {item.state}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          id={`btn-edit-match-cancel-${match.id}`}
                          onClick={() => setEditingMatchId(null)}
                          className="text-gray-400 hover:text-white text-[10px] py-1 px-2.5 rounded border border-stadium-border cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          id={`btn-edit-match-save-${match.id}`}
                          onClick={() => handleUpdateMatchResult(match.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] py-1 px-2.5 rounded cursor-pointer"
                        >
                          Gravar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs font-bold text-white">
                        <span>{match.time_casa}</span>
                        <span className="text-red-500">
                          {match.status !== 'nao_iniciado' ? ` ${match.gols_casa} x ${match.gols_visitante} ` : ' x '}
                        </span>
                        <span>{match.time_visitante}</span>
                      </div>

                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        match.status === 'finalizado' ? 'bg-gray-800 text-gray-400' :
                        match.status === 'ao_vivo' ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                      }`}>
                        {match.status === 'finalizado' ? 'Finalizado' : match.status === 'ao_vivo' ? 'Ao Vivo' : 'Pendente'}
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex justify-end gap-1.5 pt-2 border-t border-stadium-border/30">
                      <button
                        id={`btn-admin-edit-${match.id}`}
                        onClick={() => {
                          setEditingMatchId(match.id);
                          setEditGolsCasa(match.gols_casa !== undefined ? String(match.gols_casa) : '0');
                          setEditGolsVisitante(match.gols_visitante !== undefined ? String(match.gols_visitante) : '0');
                          setEditStatus(match.status);
                          setEditAutoresGols(match.resultado_autores_gols || '');
                          setEditPrimeiroVermelho(match.resultado_primeiro_vermelho || 'Nenhum');
                          setEditVaiPenaltis(match.resultado_vai_penaltis || 'Não');
                          setEditVaiProrrogacao(match.resultado_vai_prorrogacao || 'Não');
                          setEditQuemClassifica(match.resultado_quem_classifica || 'Casa');
                          setEditCartoes1t(match.resultado_cartoes_1t || '0-2');
                          setEditCartoes2t(match.resultado_cartoes_2t || '0-2');
                          setEditEscanteios1t(match.resultado_escanteios_1t || 0);
                          setEditEscanteios2t(match.resultado_escanteios_2t || 0);
                          setEditPrimeiroGol(match.resultado_primeiro_gol || 'Nenhum');
                          setEditMaiorPosse(match.resultado_maior_posse || 'Casa');
                          setEditIntervalo0_10(match.resultado_intervalo_0_10 || 'Não');
                          setEditIntervalo10_20(match.resultado_intervalo_10_20 || 'Não');
                          setEditIntervalo20_30(match.resultado_intervalo_20_30 || 'Não');
                          setEditIntervalo30_40(match.resultado_intervalo_30_40 || 'Não');
                          setEditIntervalo40_50(match.resultado_intervalo_40_50 || 'Não');
                          setEditIntervalo50_60(match.resultado_intervalo_50_60 || 'Não');
                          setEditIntervalo60_70(match.resultado_intervalo_60_70 || 'Não');
                          setEditIntervalo70_80(match.resultado_intervalo_70_80 || 'Não');
                          setEditIntervalo80_90(match.resultado_intervalo_80_90 || 'Não');
                        }}
                        className="bg-stadium-dark hover:bg-stadium-border border border-stadium-border text-gray-300 py-1 px-2.5 rounded text-[10px] font-semibold cursor-pointer"
                      >
                        Lançar Placar
                      </button>
                      {confirmDeleteId === match.id ? (
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <button
                            id={`btn-admin-delete-confirm-${match.id}`}
                            disabled={loadingAction !== null}
                            onClick={() => handleDeleteMatch(match.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold py-1.5 px-3 rounded-lg cursor-pointer whitespace-nowrap shadow-sm"
                          >
                            Excluir?
                          </button>
                          <button
                            id={`btn-admin-delete-cancel-${match.id}`}
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-stadium-border hover:bg-stadium-border/80 text-gray-300 text-[10px] font-extrabold py-1.5 px-3 rounded-lg cursor-pointer whitespace-nowrap"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-admin-delete-${match.id}`}
                          disabled={loadingAction !== null}
                          onClick={() => setConfirmDeleteId(match.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-2 rounded-lg aspect-square flex items-center justify-center cursor-pointer transition-colors"
                          title="Excluir Partida"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB: CONFIG & AUTOMATION --- */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          {/* Automated results triggers */}
          <div className="bg-stadium-card border border-stadium-border rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-red-400" /> Automação de Resultados
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <button
                id="btn-admin-auto-seed"
                disabled={loadingAction !== null}
                onClick={handleAutoSeedMatches}
                className="bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-green/40 text-stadium-dark font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {loadingAction === 'auto_seed' ? (
                  <div className="w-4 h-4 border-2 border-stadium-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Gerar Jogos de Hoje</span>
                  </>
                )}
              </button>

              <button
                id="btn-admin-api-sofascore"
                disabled={loadingAction !== null}
                onClick={handleFetchSofascore}
                className="bg-brand-gold hover:bg-brand-gold/90 disabled:bg-brand-gold/40 text-stadium-dark font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {loadingAction === 'fetch_sofascore' ? (
                  <div className="w-4 h-4 border-2 border-stadium-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Sincronizar Sofascore</span>
                  </>
                )}
              </button>

              <button
                id="btn-admin-api-fetch"
                disabled={loadingAction !== null}
                onClick={handleFetchFootballApi}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/40 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {loadingAction === 'fetch_api' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Consultar API-Football</span>
                  </>
                )}
              </button>

              <button
                id="btn-admin-simulate-scores"
                disabled={loadingAction !== null}
                onClick={handleSimulateResults}
                className="bg-stadium-border/60 hover:bg-stadium-border text-white hover:text-brand-gold py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loadingAction === 'simulate' ? (
                  <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Simular Placar de Jogos</span>
                  </>
                )}
              </button>

              <button
                id="btn-admin-recalculate-all"
                disabled={loadingAction !== null}
                onClick={handleRecalculatePoints}
                className="bg-stadium-dark hover:bg-stadium-border text-gray-300 hover:text-white border border-stadium-border py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loadingAction === 'recalculate' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recalcular Pontos Manual</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-[11px] text-gray-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="font-bold text-gray-300 block mb-0.5">Nota de Automação:</span>
                Tanto o <span className="text-brand-gold font-semibold">Sofascore</span> quanto a <span className="text-red-400 font-semibold">API-Football</span> utilizam o mesmo token RapidAPI configurado abaixo. Caso as partidas utilizem IDs de fixture fictícios (como 1001, 1002), as requisições cairão no simulador automático de placares para manter o fluxo de testes ativo.
              </div>
            </div>
          </div>

          {/* Config fields form */}
          <div className="bg-stadium-card border border-stadium-border rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Parâmetros do Sistema</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Chave API-Football (RapidAPI Token)</label>
                <input
                  id="config-api-key"
                  type="password"
                  placeholder="Seu RapidAPI Key"
                  value={apiFootballKey}
                  onChange={(e) => setApiFootballKey(e.target.value)}
                  className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Chave PIX do Administrador (Celular, E-mail, CPF ou Chave Aleatória)</label>
                <input
                  id="config-pix-key"
                  type="text"
                  placeholder="Ex: 21975151937"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Nome Beneficiário PIX</label>
                  <input
                    id="config-pix-name"
                    type="text"
                    placeholder="Ex: Wagner Teixeira"
                    value={pixName}
                    onChange={(e) => setPixName(e.target.value)}
                    className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Cidade Beneficiário PIX</label>
                  <input
                    id="config-pix-city"
                    type="text"
                    placeholder="Ex: Rio de Janeiro"
                    value={pixCity}
                    onChange={(e) => setPixCity(e.target.value)}
                    className="w-full bg-stadium-dark border border-stadium-border focus:border-red-500 rounded-lg py-2 px-3 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-admin-config-save"
              disabled={loadingAction === 'save_config'}
              onClick={handleSaveConfig}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {loadingAction === 'save_config' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Gravar Chave PIX e API'
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- TAB: SQL SCHEMA COMPILATION --- */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Esquema de Banco de Dados</h3>
              <p className="text-[10px] text-gray-400">Instalação e migração rápida para o Supabase PostgreSQL</p>
            </div>
            
            <button
              id="btn-admin-sql-copy"
              onClick={handleCopySql}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-stadium-dark border border-stadium-border rounded-xl p-3 max-h-[42vh] overflow-y-auto font-mono text-[10px] leading-relaxed text-gray-300 no-scrollbar whitespace-pre select-all">
            {supabaseSqlScript}
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 text-[11px] text-gray-400 space-y-1">
            <span className="font-bold text-gray-300 block uppercase tracking-wider text-[10px]">Como utilizar?</span>
            <p>1. Crie um projeto gratuito no site do Supabase (supabase.com);</p>
            <p>2. No menu esquerdo, vá em <span className="text-gray-200 font-semibold">SQL Editor</span> e clique em "New Query";</p>
            <p>3. Cole este script SQL e clique em <span className="text-gray-200 font-semibold">Run</span>;</p>
            <p>4. Todas as tabelas, relacionamentos e chaves primárias serão provisionados perfeitamente!</p>
          </div>
        </div>
      )}

      {/* Sofascore Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-[100] bg-stadium-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stadium-card border border-brand-gold/30 rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-stadium-border flex justify-between items-center bg-stadium-dark/60">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-gold animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">Relatório de Sincronização</h3>
                  <p className="text-[10px] text-gray-400">Status em tempo real das consultas via Sofascore</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="bg-stadium-dark hover:bg-stadium-border text-gray-400 hover:text-white rounded-lg p-1 px-2.5 text-xs font-bold cursor-pointer"
              >
                X
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 font-mono text-[11px] text-gray-300 bg-stadium-dark/40 no-scrollbar">
              {sofascoreLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border leading-relaxed ${
                    log.includes('Erro') || log.includes('Falha')
                      ? 'bg-red-500/10 border-red-500/20 text-red-300'
                      : log.includes('Sincronizando:')
                      ? 'bg-stadium-dark border-stadium-border/30 text-gray-200'
                      : log.includes('atualizou:')
                      ? 'bg-brand-green/10 border-brand-green/20 text-brand-green font-bold'
                      : 'bg-stadium-border/20 border-stadium-border/30 text-gray-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            <div className="p-3 bg-stadium-dark/60 border-t border-stadium-border flex justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
                className="bg-brand-gold hover:bg-brand-gold/90 text-stadium-dark font-black text-xs py-2 px-6 rounded-xl cursor-pointer"
              >
                Fechar Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
