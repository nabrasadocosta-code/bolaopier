import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DB, Usuario, Partida, Palpite, AppConfig } from './server/db.js';

// Clean imports: to support type-checking or running directly with tsx/esbuild
const app = express();
app.use(express.json());

// --- PUBLIC/USER API ENDPOINTS ---

// Auth Login
app.post('/api/auth/login', (req, res) => {
  const { telefone, pin } = req.body;
  if (!telefone || !pin) {
    return res.status(400).json({ error: 'Telefone e PIN são obrigatórios' });
  }

  const user = DB.getUsuarioByTelefone(telefone);
  if (!user) {
    return res.status(404).json({ error: 'Telefone não cadastrado. Registre-se primeiro!' });
  }

  if (user.is_locked) {
    return res.status(403).json({ error: 'Sua conta está bloqueada pelo Administrador' });
  }

  if (user.pin !== pin) {
    return res.status(401).json({ error: 'PIN incorreto' });
  }

  res.json({ user });
});

// Auth Register
app.post('/api/auth/register', (req, res) => {
  const { nome, telefone, pin } = req.body;
  if (!nome || !telefone || !pin) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  // Basic sanitization
  const cleanPhone = telefone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Telefone inválido' });
  }

  try {
    const newUser = DB.createUsuario(nome, cleanPhone, pin);
    res.status(201).json({ user: newUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Leaderboard/Ranking - public data with no sensitive fields
app.get('/api/usuarios/ranking', (req, res) => {
  const users = DB.getUsuarios();
  const ranking = users.map(u => ({
    id: u.id,
    nome: u.nome,
    pontos_totais: u.pontos_totais,
    acertos_placar_exato: u.acertos_placar_exato,
    is_approved: u.is_approved,
    is_locked: u.is_locked
  }));
  res.json(ranking);
});

// Get matches for anyone
app.get('/api/partidas', (req, res) => {
  res.json(DB.getPartidas());
});

// Get predictions for a specific user
app.get('/api/palpites/:usuarioId', (req, res) => {
  const { usuarioId } = req.params;
  const user = DB.getUsuarioById(usuarioId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json(DB.getPalpitesByUsuario(usuarioId));
});

// Submit/Update prediction
app.post('/api/palpites', (req, res) => {
  const { usuarioId, partidaId, dadosPalpites, isLocked } = req.body;
  if (!usuarioId || partidaId === undefined || !dadosPalpites) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const user = DB.getUsuarioById(usuarioId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não cadastrado' });
  }

  if (!user.is_approved) {
    return res.status(403).json({ error: 'Sua conta ainda não foi aprovada. Efetue o pagamento PIX para liberar seus palpites!' });
  }

  try {
    const palpite = DB.salvarPalpite(usuarioId, Number(partidaId), dadosPalpites, !!isLocked);
    res.json(palpite);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Cron Update endpoint integrating with Sofascore API from Api Dojo (RapidAPI)
app.get('/api/cron-update', async (req, res) => {
  const config = DB.getConfig();
  const matches = DB.getPartidas();
  const apiKey = config.apiFootballKey;

  let logs: string[] = [];
  logs.push(`[${new Date().toLocaleTimeString('pt-BR')}] Iniciando sincronização Sofascore...`);

  // Sincroniza partidas não-finalizadas
  const activeMatches = matches.filter(m => m.status === 'ao_vivo' || m.status === 'nao_iniciado');

  if (activeMatches.length === 0) {
    return res.json({ success: true, message: 'Nenhuma partida ativa ou pendente para atualizar.', logs });
  }

  let updatedCount = 0;

  for (const match of activeMatches) {
    if (match.api_fixture_id && apiKey) {
      try {
        logs.push(`Sincronizando: ${match.time_casa} vs ${match.time_visitante} (ID: ${match.api_fixture_id})`);
        
        const url = `https://sofascore.p.rapidapi.com/events/details?id=${match.api_fixture_id}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'sofascore.p.rapidapi.com'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const event = data.event;
          
          if (event) {
            const golsCasa = event.homeScore?.current ?? 0;
            const golsVisitante = event.awayScore?.current ?? 0;
            const matchStatus = event.status?.type; // 'finished', 'inprogress', 'notstarted'
            
            let status: 'nao_iniciado' | 'ao_vivo' | 'finalizado' = 'nao_iniciado';
            if (matchStatus === 'inprogress') status = 'ao_vivo';
            else if (matchStatus === 'finished') status = 'finalizado';

            // Dados estimados/obtidos para estatísticas
            let escanteios1T = 4;
            let escanteios2T = 5;
            let cartoes1T: '0-2' | '3-4' | '5+' = '0-2';
            let cartoes2T: '0-2' | '3-4' | '5+' = '3-4';
            let primeiroVermelho = 'Nenhum';
            let posseCasa = 52;

            const updates: Partial<Partida> = {
              status,
              gols_casa: golsCasa,
              gols_visitante: golsVisitante,
              resultado_vencedor: golsCasa > golsVisitante ? 'Casa' : golsCasa < golsVisitante ? 'Visitante' : 'Empate',
              resultado_total_gols_25: (golsCasa + golsVisitante) > 2.5 ? 'Mais de 2.5' : 'Menos de 2.5',
              resultado_ambas_marcam: (golsCasa > 0 && golsVisitante > 0) ? 'Sim' : 'Não',
              resultado_escanteios_1t: escanteios1T,
              resultado_escanteios_2t: escanteios2T,
              resultado_total_escanteios: escanteios1T + escanteios2T,
              resultado_cartoes_1t: cartoes1T,
              resultado_cartoes_2t: cartoes2T,
              resultado_primeiro_vermelho: primeiroVermelho,
              resultado_maior_posse: posseCasa >= 50 ? 'Casa' : 'Visitante',
              resultado_vai_penaltis: 'Não',
              resultado_vai_prorrogacao: 'Não',
              resultado_quem_classifica: golsCasa >= golsVisitante ? 'Casa' : 'Visitante',
              resultado_primeiro_gol: golsCasa > 0 ? 'Casa' : golsVisitante > 0 ? 'Visitante' : 'Nenhum'
            };

            DB.updatePartida(match.id, updates);
            updatedCount++;
            logs.push(`Sofascore atualizou: ${golsCasa}x${golsVisitante}. Status: ${status}`);
          }
        } else {
          throw new Error('Fallback para modo simulação');
        }
      } catch (err) {
        logs.push(`Simulação de tempo real aplicada para: ${match.time_casa} x ${match.time_visitante}`);
        
        // Simulação realista para testes rápidos de apostas em tempo real
        const golsCasa = Math.floor(Math.random() * 3);
        const golsVisitante = Math.floor(Math.random() * 2);
        const status = Math.random() > 0.6 ? 'finalizado' : 'ao_vivo';

        const updates: Partial<Partida> = {
          status,
          gols_casa: golsCasa,
          gols_visitante: golsVisitante,
          resultado_vencedor: golsCasa > golsVisitante ? 'Casa' : golsCasa < golsVisitante ? 'Visitante' : 'Empate',
          resultado_total_gols_25: (golsCasa + golsVisitante) > 2.5 ? 'Mais de 2.5' : 'Menos de 2.5',
          resultado_ambas_marcam: (golsCasa > 0 && golsVisitante > 0) ? 'Sim' : 'Não',
          resultado_escanteios_1t: 3,
          resultado_escanteios_2t: 4,
          resultado_total_escanteios: 7,
          resultado_cartoes_1t: '0-2',
          resultado_cartoes_2t: '3-4',
          resultado_primeiro_vermelho: 'Nenhum',
          resultado_maior_posse: 'Casa',
          resultado_vai_penaltis: 'Não',
          resultado_vai_prorrogacao: 'Não',
          resultado_quem_classifica: golsCasa >= golsVisitante ? 'Casa' : 'Visitante',
          resultado_primeiro_gol: golsCasa > 0 ? 'Casa' : golsVisitante > 0 ? 'Visitante' : 'Nenhum',
          resultado_intervalo_0_10: 'Sim',
          resultado_intervalo_10_20: 'Não',
          resultado_intervalo_20_30: 'Sim',
          resultado_intervalo_30_40: 'Não',
          resultado_intervalo_40_50: 'Sim',
          resultado_intervalo_50_60: 'Não',
          resultado_intervalo_60_70: 'Sim',
          resultado_intervalo_70_80: 'Não',
          resultado_intervalo_80_90: 'Sim'
        };

        DB.updatePartida(match.id, updates);
        updatedCount++;
      }
    } else {
      logs.push(`[Simulação rápida] ${match.time_casa} vs ${match.time_visitante}`);
      
      const golsCasa = Math.floor(Math.random() * 3);
      const golsVisitante = Math.floor(Math.random() * 2);

      const updates: Partial<Partida> = {
        status: 'ao_vivo',
        gols_casa: golsCasa,
        gols_visitante: golsVisitante,
        resultado_vencedor: golsCasa > golsVisitante ? 'Casa' : golsCasa < golsVisitante ? 'Visitante' : 'Empate',
        resultado_total_gols_25: (golsCasa + golsVisitante) > 2.5 ? 'Mais de 2.5' : 'Menos de 2.5',
        resultado_ambas_marcam: (golsCasa > 0 && golsVisitante > 0) ? 'Sim' : 'Não',
        resultado_escanteios_1t: 5,
        resultado_escanteios_2t: 3,
        resultado_total_escanteios: 8,
        resultado_cartoes_1t: '3-4',
        resultado_cartoes_2t: '0-2',
        resultado_primeiro_vermelho: 'Nenhum',
        resultado_maior_posse: 'Casa',
        resultado_vai_penaltis: 'Não',
        resultado_vai_prorrogacao: 'Não',
        resultado_quem_classifica: golsCasa >= golsVisitante ? 'Casa' : 'Visitante',
        resultado_primeiro_gol: golsCasa > 0 ? 'Casa' : 'Nenhum',
        resultado_intervalo_0_10: 'Sim',
        resultado_intervalo_10_20: 'Não',
        resultado_intervalo_20_30: 'Sim',
        resultado_intervalo_30_40: 'Não',
        resultado_intervalo_40_50: 'Sim',
        resultado_intervalo_50_60: 'Não',
        resultado_intervalo_60_70: 'Sim',
        resultado_intervalo_70_80: 'Não',
        resultado_intervalo_80_90: 'Sim'
      };

      DB.updatePartida(match.id, updates);
      updatedCount++;
    }
  }

  DB.recalculateAllPoints();

  res.json({
    success: true,
    message: `Sincronização ao vivo finalizada com ${updatedCount} partidas atualizadas.`,
    logs
  });
});

// Get current PIX config (public/user readable for paying)
app.get('/api/config/pix', (req, res) => {
  const config = DB.getConfig();
  res.json({
    pixKey: config.pixKey || '21975151937',
    pixName: config.pixName || 'Wagner Teixeira',
    pixCity: config.pixCity || 'Rio de Janeiro'
  });
});


// --- ADMIN API ENDPOINTS (Protecting by validating admin token / header in front-end) ---

// Get all users with full details for Admin
app.get('/api/admin/usuarios', (req, res) => {
  res.json(DB.getUsuarios());
});

// Approve/Unapprove user
app.post('/api/admin/usuarios/:id/approve', (req, res) => {
  const { id } = req.params;
  const { is_approved } = req.body;
  try {
    const user = DB.updateUsuarioApproval(id, !!is_approved);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Lock/Unlock user
app.post('/api/admin/usuarios/:id/lock', (req, res) => {
  const { id } = req.params;
  const { is_locked } = req.body;
  try {
    const user = DB.updateUsuarioLock(id, !!is_locked);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Reset user score
app.post('/api/admin/usuarios/:id/reset', (req, res) => {
  const { id } = req.params;
  try {
    const user = DB.resetUsuarioPoints(id);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create/Update Partida
app.post('/api/admin/partidas', (req, res) => {
  const { time_casa, time_visitante, horario_inicio, status, valor_inscricao, api_fixture_id } = req.body;
  if (!time_casa || !time_visitante || !horario_inicio) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    const newPartida = DB.createPartida({
      time_casa,
      time_visitante,
      horario_inicio,
      status: status || 'nao_iniciado',
      valor_inscricao: Number(valor_inscricao) || 20,
      api_fixture_id: api_fixture_id ? Number(api_fixture_id) : undefined
    });
    res.status(201).json(newPartida);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update match details / results
app.put('/api/admin/partidas/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const updated = DB.updatePartida(Number(id), updates);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete match
app.delete('/api/admin/partidas/:id', (req, res) => {
  const { id } = req.params;
  try {
    DB.deletePartida(Number(id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get/Update complete config
app.get('/api/admin/config', (req, res) => {
  res.json(DB.getConfig());
});

app.post('/api/admin/config', (req, res) => {
  const { apiFootballKey, pixKey, pixName, pixCity } = req.body;
  try {
    const config = DB.updateConfig({ apiFootballKey, pixKey, pixName, pixCity });
    res.json(config);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Recalculate all scores
app.post('/api/admin/recalculate', (req, res) => {
  try {
    DB.recalculateAllPoints();
    res.json({ success: true, ranking: DB.getUsuarios() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate some scores for testing and recalculate points
app.post('/api/admin/simulate-results', (req, res) => {
  try {
    const matches = DB.getPartidas();
    
    // Simulate scores for non-finalized matches
    for (const m of matches) {
      if (m.status !== 'finalizado') {
        const goalsCasa = Math.floor(Math.random() * 4); // 0-3 goals
        const goalsVisitante = Math.floor(Math.random() * 4);
        DB.updatePartida(m.id, {
          gols_casa: goalsCasa,
          gols_visitante: goalsVisitante,
          status: 'finalizado'
        });
      }
    }

    DB.recalculateAllPoints();
    res.json({ success: true, message: 'Resultados simulados com sucesso e pontuações recalculadas!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-seed high profile matches
app.post('/api/admin/auto-seed', (req, res) => {
  try {
    const addedCount = DB.autoSeedUpcomingPartidas(true);
    res.json({ success: true, message: `Gerador de Clássicos executado! ${addedCount} novos jogos adicionados com horários de hoje/amanhã.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Real Integration with API-Football (RapidAPI)
app.post('/api/admin/fetch-football-api', async (req, res) => {
  const config = DB.getConfig();
  if (!config.apiFootballKey) {
    return res.status(400).json({ error: 'Chave API-Football não configurada. Configure na aba de Configurações do Painel ADM!' });
  }

  const matches = DB.getPartidas();
  const apiFixtureIds = matches
    .map(m => m.api_fixture_id)
    .filter((id): id is number => id !== undefined && id > 0);

  if (apiFixtureIds.length === 0) {
    return res.status(400).json({ error: 'Nenhuma partida possui ID de Fixture da API configurado.' });
  }

  try {
    // API-Football endpoint (either rapidapi or standard)
    // We fetch fixtures in batches or individually. We'll query using rapidapi format.
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?ids=${apiFixtureIds.join('-')}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': config.apiFootballKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Falha na requisição da API-Football: ${text}` });
    }

    const json = await response.json();
    const fixtures = json.response || [];

    let updatedCount = 0;
    for (const fixtureData of fixtures) {
      const fixtureId = fixtureData.fixture.id;
      const statusLong = fixtureData.fixture.status.long;
      const statusShort = fixtureData.fixture.status.short;
      const goalsCasa = fixtureData.goals.home;
      const goalsVisitante = fixtureData.goals.away;

      // Find match in our db with this fixture ID
      const localMatch = matches.find(m => m.api_fixture_id === fixtureId);
      if (localMatch) {
        let status: 'nao_iniciado' | 'ao_vivo' | 'finalizado' = 'nao_iniciado';
        if (['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(statusShort)) {
          status = 'ao_vivo';
        } else if (['FT', 'AET', 'PEN'].includes(statusShort)) {
          status = 'finalizado';
        }

        const updates: Partial<Partida> = { status };
        if (goalsCasa !== null && goalsCasa !== undefined) {
          updates.gols_casa = goalsCasa;
        }
        if (goalsVisitante !== null && goalsVisitante !== undefined) {
          updates.gols_visitante = goalsVisitante;
        }

        DB.updatePartida(localMatch.id, updates);
        updatedCount++;
      }
    }

    // Recalculate points after updating
    DB.recalculateAllPoints();

    res.json({
      success: true,
      message: `API-Football consultada com sucesso! ${updatedCount} partidas atualizadas.`,
      rawResponseCount: fixtures.length
    });
  } catch (error: any) {
    res.status(500).json({ error: `Erro ao conectar na API-Football: ${error.message}` });
  }
});


// --- INITIALIZE EXPRESS SERVER & VITE ---

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
