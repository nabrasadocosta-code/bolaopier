import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, Calendar as CalendarIcon, Trophy as TrophyIcon, CreditCard as WalletIcon, ShieldAlert as ShieldIcon, LogOut, Loader2, Sparkles } from 'lucide-react';
import { Usuario, Partida, Palpite, LeaderboardUser, AppConfig } from './types';

// Component imports
import Login from './components/Login';
import Home from './components/Home';
import Matches from './components/Matches';
import Leaderboard from './components/Leaderboard';
import Wallet from './components/Wallet';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('inicio');
  
  // Data State
  const [matches, setMatches] = useState<Partida[]>([]);
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [ranking, setRanking] = useState<LeaderboardUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<Usuario[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    apiFootballKey: '',
    pixKey: '21975151937',
    pixName: 'Wagner Teixeira',
    pixCity: 'Rio de Janeiro'
  });

  // App Loading states
  const [appLoading, setAppLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load session from local storage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('bolao_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as Usuario;
        setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem('bolao_user');
      }
    }
    setAppLoading(false);
  }, []);

  // Fetch data on login or session reload
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Matches
      const matchesRes = await fetch('/api/partidas');
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData);
      }

      // 2. Fetch Leaderboard Ranking
      const rankingRes = await fetch('/api/usuarios/ranking');
      if (rankingRes.ok) {
        const rankingData = await rankingRes.json();
        setRanking(rankingData);
      }

      // 3. Fetch current user's predictions
      const palpitesRes = await fetch(`/api/palpites/${currentUser?.id}`);
      if (palpitesRes.ok) {
        const palpitesData = await palpitesRes.json();
        setPalpites(palpitesData);
      }

      // 4. Fetch PIX configs
      const configRes = await fetch('/api/config/pix');
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(prev => ({ ...prev, ...configData }));
      }

      // 5. If logged in as Wagner (Admin), fetch admin specific records
      if (currentUser && currentUser.telefone === '21975151937' && currentUser.pin === '0508') {
        // Fetch all registered users
        const adminUsersRes = await fetch('/api/admin/usuarios');
        if (adminUsersRes.ok) {
          const adminUsersData = await adminUsersRes.json();
          setAdminUsers(adminUsersData);
        }

        // Fetch complete configurations
        const adminConfigRes = await fetch('/api/admin/config');
        if (adminConfigRes.ok) {
          const adminConfigData = await adminConfigRes.json();
          setConfig(adminConfigData);
        }
      }
    } catch (err) {
      console.error('Error fetching bolao app data', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    localStorage.setItem('bolao_user', JSON.stringify(user));
    setCurrentTab('inicio');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bolao_user');
    setPalpites([]);
    setAdminUsers([]);
    setCurrentTab('inicio');
  };

  const handleSavePalpite = async (partidaId: number, dadosPalpites: any, isLocked: boolean) => {
    if (!currentUser) return;
    const res = await fetch('/api/palpites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: currentUser.id,
        partidaId,
        dadosPalpites,
        isLocked
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao gravar palpite');
    }

    // Refresh prediction list to render correctly
    const updatedPalpitesRes = await fetch(`/api/palpites/${currentUser.id}`);
    if (updatedPalpitesRes.ok) {
      const updatedPalpitesData = await updatedPalpitesRes.json();
      setPalpites(updatedPalpitesData);
    }
  };

  const handleRefreshUserStatus = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefone: currentUser.telefone,
          pin: currentUser.pin
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('bolao_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Failed to update user approval status', e);
    }
  };

  // Determine if active user is Wagner (Admin)
  const isAdmin = currentUser && currentUser.telefone === '21975151937' && currentUser.pin === '0508';

  if (appLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stadium-dark text-gray-400">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider mt-4">Carregando Bolão...</span>
      </div>
    );
  }

  // Render Login view if unauthenticated
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-stadium-dark relative overflow-x-hidden">
        {/* Immersive UI cyan & emerald ambient backdrops */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto max-w-lg min-h-screen">
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-stadium-dark flex flex-col relative pb-20 overflow-x-hidden">
      {/* Immersive UI cyan & emerald ambient backdrops */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main App Header */}
      <header className="sticky top-0 bg-stadium-dark/90 backdrop-blur-md border-b border-stadium-border/70 py-4 px-4 flex items-center justify-between z-40 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-green/20 border border-brand-green/40 flex items-center justify-center">
            <span className="text-brand-green text-sm font-extrabold font-display">B</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              Bolão <span className="text-brand-green">Copa 2026</span>
            </h1>
            <span className="text-[9px] text-gray-400 font-semibold block uppercase tracking-wide">
              {isAdmin ? 'Modo: Administrador' : 'Modo: Participante'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {refreshing && (
            <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
          )}
          <button
            id="btn-header-logout"
            onClick={handleLogout}
            className="p-2 bg-stadium-card hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded-lg border border-stadium-border transition-colors cursor-pointer"
            title="Sair do Bolão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Financial Stats Top Bar */}
      {currentUser && (
        <div className="bg-stadium-card/60 border-b border-stadium-border/50 py-3 px-4 max-w-lg mx-auto w-full z-30 animate-fade-in">
          <div className="grid grid-cols-3 gap-2">
            
            {/* Banca Total */}
            <div className="bg-stadium-dark/40 border border-stadium-border/30 rounded-xl p-2 flex flex-col items-center justify-center">
              <span className="text-[8px] uppercase font-bold tracking-wider text-gray-500">Banca Total</span>
              <span className="text-xs font-black text-brand-gold font-mono">
                R$ {matches.reduce((acc, m) => acc + (m.valor_inscricao || 20), 0) * ranking.filter(u => u.is_approved).length}
              </span>
            </div>

            {/* Participantes */}
            <div className="bg-stadium-dark/40 border border-stadium-border/30 rounded-xl p-2 flex flex-col items-center justify-center">
              <span className="text-[8px] uppercase font-bold tracking-wider text-gray-500">Participantes</span>
              <span className="text-xs font-black text-white font-mono">
                {ranking.filter(u => u.is_approved).length} <span className="text-[8px] text-brand-green font-normal">ativos</span>
              </span>
            </div>

            {/* Rateio dos Prêmios */}
            <div className="bg-stadium-dark/40 border border-stadium-border/30 rounded-xl p-1.5 flex flex-col items-center justify-center">
              <span className="text-[8px] uppercase font-bold tracking-wider text-gray-500 mb-0.5">Premiação (70/20/10)</span>
              <div className="text-[8px] text-gray-400 font-semibold space-y-0.5 font-mono text-center leading-tight">
                <div>1º: <span className="text-brand-green">R$ {Math.round(matches.reduce((acc, m) => acc + (m.valor_inscricao || 20), 0) * ranking.filter(u => u.is_approved).length * 0.7)}</span></div>
                <div>2º: <span className="text-brand-green">R$ {Math.round(matches.reduce((acc, m) => acc + (m.valor_inscricao || 20), 0) * ranking.filter(u => u.is_approved).length * 0.2)}</span></div>
                <div>3º: <span className="text-brand-green">R$ {Math.round(matches.reduce((acc, m) => acc + (m.valor_inscricao || 20), 0) * ranking.filter(u => u.is_approved).length * 0.1)}</span></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Active View Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 z-10 overflow-y-auto no-scrollbar">
        {currentTab === 'inicio' && (
          <Home
            user={currentUser}
            matches={matches}
            ranking={ranking}
            palpites={palpites}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'partidas' && (
          <Matches
            user={currentUser}
            matches={matches}
            palpites={palpites}
            onSavePalpite={handleSavePalpite}
            onRefreshMatches={fetchAllData}
          />
        )}

        {currentTab === 'ranking' && (
          <Leaderboard
            ranking={ranking}
            currentUserId={currentUser.id}
          />
        )}

        {currentTab === 'financeiro' && (
          <Wallet
            user={currentUser}
            onRefreshUserStatus={handleRefreshUserStatus}
          />
        )}

        {currentTab === 'admin' && isAdmin && (
          <AdminPanel
            adminUser={currentUser}
            allUsers={adminUsers}
            matches={matches}
            config={config}
            onRefreshAll={fetchAllData}
          />
        )}
      </main>

      {/* Bottom Navigation Tab Bar (Restricted strictly to mobile width for smartphones feel) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-stadium-card/95 backdrop-blur-lg border-t border-stadium-border/80 py-2.5 px-3 z-50 max-w-lg mx-auto w-full shadow-2xl rounded-t-2xl">
        <div className="flex items-center justify-around">
          <button
            id="nav-tab-inicio"
            onClick={() => setCurrentTab('inicio')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              currentTab === 'inicio' ? 'text-brand-green' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[9px] font-semibold">Início</span>
          </button>

          <button
            id="nav-tab-partidas"
            onClick={() => setCurrentTab('partidas')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              currentTab === 'partidas' ? 'text-brand-green' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[9px] font-semibold">Palpites</span>
          </button>

          <button
            id="nav-tab-ranking"
            onClick={() => setCurrentTab('ranking')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              currentTab === 'ranking' ? 'text-brand-green' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <TrophyIcon className="w-5 h-5" />
            <span className="text-[9px] font-semibold">Classificação</span>
          </button>

          <button
            id="nav-tab-financeiro"
            onClick={() => setCurrentTab('financeiro')}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              currentTab === 'financeiro' ? 'text-brand-green' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <WalletIcon className="w-5 h-5" />
            <span className="text-[9px] font-semibold">Financeiro</span>
          </button>

          {isAdmin && (
            <button
              id="nav-tab-admin"
              onClick={() => setCurrentTab('admin')}
              className={`flex flex-col items-center gap-1 transition-colors relative cursor-pointer ${
                currentTab === 'admin' ? 'text-red-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldIcon className="w-5 h-5" />
              <span className="text-[9px] font-semibold">Painel ADM</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
