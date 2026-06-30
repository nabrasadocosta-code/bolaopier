export interface Usuario {
  id: string;
  nome: string;
  telefone: string;
  pin: string;
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

export interface LeaderboardUser {
  id: string;
  nome: string;
  pontos_totais: number;
  acertos_placar_exato: number;
  is_approved: boolean;
  is_locked: boolean;
}
