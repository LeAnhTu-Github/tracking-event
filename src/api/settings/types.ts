export interface Booster {
  id: number;
  booster_key: string;
  booster_name: string;
  coin_cost: number;
}

export interface CreateBoosterBody {
  booster_key: string;
  booster_name: string;
  coin_cost: number;
}

