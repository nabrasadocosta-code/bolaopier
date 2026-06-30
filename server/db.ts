import fs from 'fs';
import path from 'path';

export interface Usuario {
  id: string;
  nome: string;
  telefone: string;
  pin: string; // Stored as-is or simple hash for easy auth
  pontos_totais: number;
  acertos_placar_exato: number;
  is_approved: boolean;
  is_locked: boolean;
  created_at: string;
}

export interface DetalhesPalpite {
  gols_casa: number;
  gols_visitante: number;
  autores_gols: string; // e.g., "Neymar, Vinicius"
  primeiro_vermelho: string; // "Nenhum" | "Casa" | "Visitante"
  vai_penaltis: 'Sim' | 'Não';
  vai_prorrogacao: 'Sim' | 'Não';
  quem_classifica: 'Casa' | 'Visitante';
  cartoes_1t: '0-2' | '3-4' | '5+';
  cartoes_2t: '0-2' | '3-4' | '5+';
  escanteios_1t: number;
  escanteios_2t: number;
  primeiro_gol: 'Casa' | 'Visitante' | 'Nenhum';
  total_escanteios: number;
  total_gols_25: 'Mais de 2.5' | 'Menos de 2.5';
  maior_posse: 'Casa' | 'Visitante';
  ambas_marcam: 'Sim' | 'Não';
  vencedor: 'Casa' | 'Visitante' | 'Empate';
  intervalo_0_10: 'Sim' | 'Não';
  intervalo_10_20: 'Sim' | 'Não';
  intervalo_20_30: 'Sim' | 'Não';
  intervalo_30_40: 'Sim' | 'Não';
  intervalo_40_50: 'Sim' | 'Não';
  intervalo_50_60: 'Sim' | 'Não';
  intervalo_60_70: 'Sim' | 'Não';
  intervalo_70_80: 'Sim' | 'Não';
  intervalo_80_90: 'Sim' | 'Não';
}

export interface Partida {
  id: number;
  api_fixture_id?: number;
  time_casa: string;
  time_visitante: string;
  horario_inicio: string;
  status: 'nao_iniciado' | 'ao_vivo' | 'finalizado';
  valor_inscricao: number;
  gols_casa?: number;
  gols_visitante?: number;
  // Official answers for the detailed criteria
  resultado_autores_gols?: string;
  resultado_primeiro_vermelho?: string;
  resultado_vai_penaltis?: 'Sim' | 'Não';
  resultado_vai_prorrogacao?: 'Sim' | 'Não';
  resultado_quem_classifica?: 'Casa' | 'Visitante';
  resultado_cartoes_1t?: '0-2' | '3-4' | '5+';
  resultado_cartoes_2t?: '0-2' | '3-4' | '5+';
  resultado_escanteios_1t?: number;
  resultado_escanteios_2t?: number;
  resultado_primeiro_gol?: 'Casa' | 'Visitante' | 'Nenhum';
  resultado_total_escanteios?: number;
  resultado_total_gols_25?: 'Mais de 2.5' | 'Menos de 2.5';
  resultado_maior_posse?: 'Casa' | 'Visitante';
  resultado_ambas_marcam?: 'Sim' | 'Não';
  resultado_vencedor?: 'Casa' | 'Visitante' | 'Empate';
  resultado_intervalo_0_10?: 'Sim' | 'Não';
  resultado_intervalo_10_20?: 'Sim' | 'Não';
  resultado_intervalo_20_30?: 'Sim' | 'Não';
  resultado_intervalo_30_40?: 'Sim' | 'Não';
  resultado_intervalo_40_50?: 'Sim' | 'Não';
  resultado_intervalo_50_60?: 'Sim' | 'Não';
  resultado_intervalo_60_70?: 'Sim' | 'Não';
  resultado_intervalo_70_80?: 'Sim' | 'Não';
  resultado_intervalo_80_90?: 'Sim' | 'Não';
}

export interface Palpite {
  id: string;
  usuario_id: string;
  partida_id: number;
  dados_palpites: DetalhesPalpite;
  is_locked: boolean;
  updated_at: string;
}

export interface AppConfig {
  apiFootballKey: string;
  pixKey: string;
  pixName: string;
  pixCity: string;
}

interface DatabaseSchema {
  usuarios: Usuario[];
  partidas: Partida[];
  palpites: Palpite[];
  config: AppConfig;
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

const defaultMatches: Partida[] = [
  { id: 1, api_fixture_id: 1001, time_casa: 'Estados Unidos', time_visitante: 'Austrália', horario_inicio: '2026-06-11T18:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 2, api_fixture_id: 1002, time_casa: 'México', time_visitante: 'África do Sul', horario_inicio: '2026-06-11T21:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 3, api_fixture_id: 1003, time_casa: 'Canadá', time_visitante: 'Coreia do Sul', horario_inicio: '2026-06-12T15:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 4, api_fixture_id: 1004, time_casa: 'Brasil', time_visitante: 'Marrocos', horario_inicio: '2026-06-12T18:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 5, api_fixture_id: 1005, time_casa: 'Argentina', time_visitante: 'Arábia Saudita', horario_inicio: '2026-06-13T16:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 6, api_fixture_id: 1006, time_casa: 'Portugal', time_visitante: 'Turquia', horario_inicio: '2026-06-13T19:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 7, api_fixture_id: 1007, time_casa: 'Espanha', time_visitante: 'Japão', horario_inicio: '2026-06-14T15:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 8, api_fixture_id: 1008, time_casa: 'França', time_visitante: 'Camarões', horario_inicio: '2026-06-14T18:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 9, api_fixture_id: 1009, time_casa: 'Alemanha', time_visitante: 'Uruguai', horario_inicio: '2026-06-15T16:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 },
  { id: 10, api_fixture_id: 1010, time_casa: 'Inglaterra', time_visitante: 'Croácia', horario_inicio: '2026-06-15T20:00:00-03:00', status: 'nao_iniciado', valor_inscricao: 20 }
];

function getInitialDatabase(): DatabaseSchema {
  return {
    usuarios: [
      {
        id: 'admin-id-wagner',
        nome: 'Wagner Teixeira',
        telefone: '21975151937',
        pin: '0508',
        pontos_totais: 0,
        acertos_placar_exato: 0,
        is_approved: true,
        is_locked: false,
        created_at: new Date().toISOString()
      }
    ],
    partidas: defaultMatches,
    palpites: [],
    config: {
      apiFootballKey: '',
      pixKey: '21975151937',
      pixName: 'Wagner Teixeira',
      pixCity: 'Rio de Janeiro'
    }
  };
}

export class DB {
  private static load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const initial = getInitialDatabase();
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw) as DatabaseSchema;
      
      // Ensure admin exists
      const hasAdmin = data.usuarios.some(u => u.telefone === '21975151937');
      if (!hasAdmin) {
        data.usuarios.push({
          id: 'admin-id-wagner',
          nome: 'Wagner Teixeira',
          telefone: '21975151937',
          pin: '0508',
          pontos_totais: 0,
          acertos_placar_exato: 0,
          is_approved: true,
          is_locked: false,
          created_at: new Date().toISOString()
        });
        this.save(data);
      }
      
      return data;
    } catch (e) {
      console.error('Error loading database, resetting', e);
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
  }

  private static save(data: DatabaseSchema) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- USUARIOS ---
  public static getUsuarios(): Usuario[] {
    return this.load().usuarios;
  }

  public static getUsuarioById(id: string): Usuario | undefined {
    return this.getUsuarios().find(u => u.id === id);
  }

  public static getUsuarioByTelefone(telefone: string): Usuario | undefined {
    return this.getUsuarios().find(u => u.telefone === telefone);
  }

  public static createUsuario(nome: string, telefone: string, pin: string): Usuario {
    const data = this.load();
    const existing = data.usuarios.find(u => u.telefone === telefone);
    if (existing) {
      throw new Error('Telefone já cadastrado');
    }
    const newUser: Usuario = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      nome,
      telefone,
      pin,
      pontos_totais: 0,
      acertos_placar_exato: 0,
      is_approved: false, // Must be approved by Wagner
      is_locked: false,
      created_at: new Date().toISOString()
    };
    data.usuarios.push(newUser);
    this.save(data);
    return newUser;
  }

  public static updateUsuarioApproval(id: string, is_approved: boolean): Usuario {
    const data = this.load();
    const user = data.usuarios.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    user.is_approved = is_approved;
    this.save(data);
    return user;
  }

  public static updateUsuarioLock(id: string, is_locked: boolean): Usuario {
    const data = this.load();
    const user = data.usuarios.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    user.is_locked = is_locked;
    this.save(data);
    return user;
  }

  public static resetUsuarioPoints(id: string): Usuario {
    const data = this.load();
    const user = data.usuarios.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado');
    user.pontos_totais = 0;
    user.acertos_placar_exato = 0;
    this.save(data);
    return user;
  }

  // --- PARTIDAS ---
  public static autoCleanupPartidas(): void {
    const data = this.load();
    const now = new Date();
    
    // Set of allowed World Cup nations in uppercase
    const WORLD_CUP_TEAMS = new Set([
      "BRASIL", "ARGENTINA", "FRANÇA", "ALEMANHA", "ESPANHA", "ITÁLIA", "HOLANDA", "PORTUGAL", "URUGUAI", 
      "INGLATERRA", "JAPÃO", "MARROCOS", "COSTA DO MARFIM", "NORUEGA", "NOREGA", "ESTADOS UNIDOS", "MÉXICO", "CROÁCIA", 
      "BÉLGICA", "SENEGAL", "COLÔMBIA", "SUÍÇA", "DINAMARCA", "SUÉCIA", "CHILE", "EQUADOR", "CAMARÕES", 
      "GANA", "TUNÍSIA", "ARÁBIA SAUDITA", "COREIA DO SUL", "AUSTRÁLIA", "CANADÁ"
    ]);

    const initialCount = data.partidas.length;

    // Fix "NOREGA" to "NORUEGA" in any existing matches
    data.partidas.forEach(p => {
      if (p.time_casa === "NOREGA") p.time_casa = "NORUEGA";
      if (p.time_visitante === "NOREGA") p.time_visitante = "NORUEGA";
    });

    // Remove matches that started more than 7 days ago, OR that are NOT World Cup teams (clubs like Flamengo, Palmeiras, etc.)
    data.partidas = data.partidas.filter(p => {
      // Keep only World Cup teams
      const tCasa = p.time_casa.toUpperCase();
      const tVis = p.time_visitante.toUpperCase();
      if (!WORLD_CUP_TEAMS.has(tCasa) || !WORLD_CUP_TEAMS.has(tVis)) {
        // Delete predictions linked to this non-World-Cup match
        data.palpites = data.palpites.filter(palp => palp.partida_id !== p.id);
        return false;
      }

      const startTime = new Date(p.horario_inicio);
      const diffMs = now.getTime() - startTime.getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      if (diffMs >= sevenDaysMs) {
        // Delete predictions linked to this match
        data.palpites = data.palpites.filter(palp => palp.partida_id !== p.id);
        return false;
      }
      return true;
    });

    if (data.partidas.length !== initialCount) {
      this.save(data);
    }
  }

  public static autoSeedUpcomingPartidas(force: boolean = false): number {
    const data = this.load();
    const now = new Date();
    
    // Find active/upcoming matches
    const upcoming = data.partidas.filter(p => p.status === 'nao_iniciado' || p.status === 'ao_vivo');
    
    if (upcoming.length < 3 || force) {
      // High-profile World Cup matches to choose from
      const matchups = [
        { home: "Brasil", away: "Argentina", hoursFromNow: 2 },
        { home: "França", away: "Inglaterra", hoursFromNow: 4.5 },
        { home: "Espanha", away: "Alemanha", hoursFromNow: 7 },
        { home: "Portugal", away: "Uruguai", hoursFromNow: 9.5 },
        { home: "Holanda", away: "Itália", hoursFromNow: 24 },
        { home: "Japão", away: "Croácia", hoursFromNow: 27 },
        { home: "Marrocos", away: "Bélgica", hoursFromNow: 31 },
        { home: "Costa do Marfim", away: "Noruega", hoursFromNow: 48 },
        { home: "Estados Unidos", away: "México", hoursFromNow: 51 }
      ];

      let maxId = data.partidas.reduce((max, p) => p.id > max ? p.id : max, 0);
      let addedCount = 0;
      
      for (const match of matchups) {
        // Double check if this matchup already exists in upcoming or if we want to add more
        const alreadyExists = data.partidas.some(u => 
          u.status !== 'finalizado' && (
            (u.time_casa.toLowerCase() === match.home.toLowerCase() && u.time_visitante.toLowerCase() === match.away.toLowerCase()) ||
            (u.time_casa.toLowerCase() === match.away.toLowerCase() && u.time_visitante.toLowerCase() === match.home.toLowerCase())
          )
        );
        
        if (!alreadyExists) {
          const startTime = new Date(now.getTime() + match.hoursFromNow * 60 * 60 * 1000);
          maxId++;
          
          const newPartida: Partida = {
            id: maxId,
            time_casa: match.home.toUpperCase(),
            time_visitante: match.away.toUpperCase(),
            horario_inicio: startTime.toISOString(),
            status: 'nao_iniciado',
            valor_inscricao: 20,
            api_fixture_id: 12000000 + maxId
          };
          
          data.partidas.push(newPartida);
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        this.save(data);
      }
      return addedCount;
    }
    return 0;
  }

  public static getPartidas(): Partida[] {
    this.autoCleanupPartidas();
    this.autoSeedUpcomingPartidas(false);
    return this.load().partidas;
  }

  public static createPartida(partida: Omit<Partida, 'id'>): Partida {
    const data = this.load();
    const maxId = data.partidas.reduce((max, p) => p.id > max ? p.id : max, 0);
    const newPartida: Partida = {
      ...partida,
      id: maxId + 1
    };
    data.partidas.push(newPartida);
    this.save(data);
    return newPartida;
  }

  public static updatePartida(id: number, updates: Partial<Partida>): Partida {
    const data = this.load();
    const index = data.partidas.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Partida não encontrada');
    
    data.partidas[index] = {
      ...data.partidas[index],
      ...updates
    };
    
    this.save(data);
    return data.partidas[index];
  }

  public static deletePartida(id: number): void {
    const data = this.load();
    data.partidas = data.partidas.filter(p => p.id !== id);
    data.palpites = data.palpites.filter(p => p.partida_id !== id);
    this.save(data);
  }

  // --- PALPITES ---
  public static getPalpites(): Palpite[] {
    return this.load().palpites;
  }

  public static getPalpitesByUsuario(usuario_id: string): Palpite[] {
    return this.getPalpites().filter(p => p.usuario_id === usuario_id);
  }

  public static salvarPalpite(usuario_id: string, partida_id: number, dados_palpites: DetalhesPalpite, is_locked: boolean): Palpite {
    const data = this.load();
    
    // Check if match started
    const partida = data.partidas.find(p => p.id === partida_id);
    if (!partida) throw new Error('Partida não encontrada');
    if (new Date(partida.horario_inicio) < new Date() && partida.status !== 'nao_iniciado') {
      throw new Error('Esta partida já começou. Não é mais possível palpitar!');
    }

    const index = data.palpites.findIndex(p => p.usuario_id === usuario_id && p.partida_id === partida_id);
    
    const timestamp = new Date().toISOString();
    let resultPalpite: Palpite;

    if (index !== -1) {
      if (data.palpites[index].is_locked) {
        throw new Error('Palpites travados! Você não pode alterar as apostas após salvá-las.');
      }
      data.palpites[index].dados_palpites = dados_palpites;
      data.palpites[index].is_locked = is_locked;
      data.palpites[index].updated_at = timestamp;
      resultPalpite = data.palpites[index];
    } else {
      const newPalpite: Palpite = {
        id: 'plp_' + Math.random().toString(36).substr(2, 9),
        usuario_id,
        partida_id,
        dados_palpites,
        is_locked,
        updated_at: timestamp
      };
      data.palpites.push(newPalpite);
      resultPalpite = newPalpite;
    }

    if (is_locked) {
      const user = data.usuarios.find(u => u.id === usuario_id);
      if (user) {
        user.is_locked = true;
      }
    }

    this.save(data);
    return resultPalpite;
  }

  // --- CONFIG ---
  public static getConfig(): AppConfig {
    return this.load().config;
  }

  public static updateConfig(updates: Partial<AppConfig>): AppConfig {
    const data = this.load();
    data.config = {
      ...data.config,
      ...updates
    };
    this.save(data);
    return data.config;
  }

  // --- RECALCULATE POINTS ---
  public static recalculateAllPoints(): void {
    const data = this.load();
    
    // Reset points for everyone
    for (const u of data.usuarios) {
      u.pontos_totais = 0;
      u.acertos_placar_exato = 0;
    }

    // Process each finished match
    for (const r of data.partidas) {
      if (r.status !== 'finalizado') {
        continue;
      }

      // Find all predictions for this match
      const palpitesPartida = data.palpites.filter(p => p.partida_id === r.id);
      for (const palpite of palpitesPartida) {
        const user = data.usuarios.find(u => u.id === palpite.usuario_id);
        if (!user) continue;

        const p = palpite.dados_palpites;
        if (!p) continue;

        // 1. Placar Exato: 50 points
        if (Number(p.gols_casa) === Number(r.gols_casa) && Number(p.gols_visitante) === Number(r.gols_visitante)) {
          user.pontos_totais += 50;
          user.acertos_placar_exato += 1;
        }

        // 2. Jogadores que farão os gols: 35 points per player
        if (p.autores_gols && r.resultado_autores_gols) {
          const pScorers = p.autores_gols.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          const rScorers = r.resultado_autores_gols.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          let matched = 0;
          for (const ps of pScorers) {
            if (rScorers.some(rs => rs.includes(ps) || ps.includes(rs))) {
              matched++;
            }
          }
          user.pontos_totais += matched * 35;
        }

        // 3. Primeiro Cartão Vermelho: 30 points
        if (p.primeiro_vermelho === r.resultado_primeiro_vermelho && r.resultado_primeiro_vermelho) {
          user.pontos_totais += 30;
        }

        // 4. Vai para os Pênaltis?: 25 points
        if (p.vai_penaltis === r.resultado_vai_penaltis && r.resultado_vai_penaltis) {
          user.pontos_totais += 25;
        }

        // 5. Vai ter Prorrogação?: 25 points
        if (p.vai_prorrogacao === r.resultado_vai_prorrogacao && r.resultado_vai_prorrogacao) {
          user.pontos_totais += 25;
        }

        // 6. Quem Classifica?: 20 points
        if (p.quem_classifica === r.resultado_quem_classifica && r.resultado_quem_classifica) {
          user.pontos_totais += 20;
        }

        // 7. Cartões no 1º Tempo: 20 points
        if (p.cartoes_1t === r.resultado_cartoes_1t && r.resultado_cartoes_1t) {
          user.pontos_totais += 20;
        }

        // 8. Cartões no 2º Tempo: 20 points
        if (p.cartoes_2t === r.resultado_cartoes_2t && r.resultado_cartoes_2t) {
          user.pontos_totais += 20;
        }

        // 9. Escanteios no 1º Tempo: 20 points
        if (Number(p.escanteios_1t) === Number(r.resultado_escanteios_1t) && r.resultado_escanteios_1t !== undefined) {
          user.pontos_totais += 20;
        }

        // 10. Escanteios no 2º Tempo: 20 points
        if (Number(p.escanteios_2t) === Number(r.resultado_escanteios_2t) && r.resultado_escanteios_2t !== undefined) {
          user.pontos_totais += 20;
        }

        // 11. Quem faz o Primeiro Gol: 15 points
        if (p.primeiro_gol === r.resultado_primeiro_gol && r.resultado_primeiro_gol) {
          user.pontos_totais += 15;
        }

        // 12. Total de Escanteios do Jogo: 15 points
        if (Number(p.total_escanteios) === Number(r.resultado_total_escanteios) && r.resultado_total_escanteios !== undefined) {
          user.pontos_totais += 15;
        }

        // 13. Total de Gols do Jogo (Mais/Menos de 2.5): 15 points
        if (p.total_gols_25 === r.resultado_total_gols_25 && r.resultado_total_gols_25) {
          user.pontos_totais += 15;
        }

        // 14. Time com maior Posse de Bola: 15 points
        if (p.maior_posse === r.resultado_maior_posse && r.resultado_maior_posse) {
          user.pontos_totais += 15;
        }

        // 15. Ambas Marcam?: 10 points
        if (p.ambas_marcam === r.resultado_ambas_marcam && r.resultado_ambas_marcam) {
          user.pontos_totais += 10;
        }

        // 16. Quem ganha o jogo: 10 points
        if (p.vencedor === r.resultado_vencedor && r.resultado_vencedor) {
          user.pontos_totais += 10;
        }

        // 17. Blocos de 10 em 10 minutos (10 points each)
        const intervals = [
          { k: 'intervalo_0_10', rk: 'resultado_intervalo_0_10' },
          { k: 'intervalo_10_20', rk: 'resultado_intervalo_10_20' },
          { k: 'intervalo_20_30', rk: 'resultado_intervalo_20_30' },
          { k: 'intervalo_30_40', rk: 'resultado_intervalo_30_40' },
          { k: 'intervalo_40_50', rk: 'resultado_intervalo_40_50' },
          { k: 'intervalo_50_60', rk: 'resultado_intervalo_50_60' },
          { k: 'intervalo_60_70', rk: 'resultado_intervalo_60_70' },
          { k: 'intervalo_70_80', rk: 'resultado_intervalo_70_80' },
          { k: 'intervalo_80_90', rk: 'resultado_intervalo_80_90' },
        ];

        for (const int of intervals) {
          const pVal = p[int.k as keyof DetalhesPalpite];
          const rVal = r[int.rk as keyof Partida];
          if (pVal === rVal && rVal) {
            user.pontos_totais += 10;
          }
        }
      }
    }

    // Sort user list by score and exact scores
    data.usuarios.sort((a, b) => {
      if (b.pontos_totais !== a.pontos_totais) {
        return b.pontos_totais - a.pontos_totais;
      }
      return b.acertos_placar_exato - a.acertos_placar_exato;
    });

    this.save(data);
  }
}
