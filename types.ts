
export interface UnitData {
  tribe: string;
  unit: string;
  attack: number;
  def_inf: number;
  def_cav: number;
  speed: number;
  carry: number;
  wood: number;
  clay: number;
  iron: number;
  crop: number;
  sum_resources: number;
  crop_upkeep: number;
  training_time_s: number;
}

export type TribeName = 'Romans' | 'Gauls' | 'Teutons' | 'Egyptians' | 'Huns' | 'Spartans' | 'Vikings';

export interface ResourceInput {
  wood: number;
  clay: number;
  iron: number;
  crop: number;
}

export interface UnitDistribution {
  unitName: string;
  percentage: number;
}

export interface UserVillage {
  id: string;
  name: string;
  x: number;
  y: number;
}