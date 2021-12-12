import { Player } from "../../player/models/Player";

export interface RoundMove {
  player: Player;
  move: string;
  bet?: number;
}