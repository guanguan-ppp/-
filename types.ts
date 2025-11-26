export interface AlchemyElement {
  id: string;
  emoji: string;
  name: string;
  isNew?: boolean; // For animation purposes
  parents?: [string, string]; // IDs of parents to track lineage
}

export interface FusionResult {
  name: string;
  emoji: string;
  description?: string;
}

export enum GameState {
  IDLE = 'IDLE',
  FUSING = 'FUSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}