import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlayerScore {
    bestDistance: number;
    name: string;
    carIndex: bigint;
}
export interface backendInterface {
    getPlayersCar(playerName: string): Promise<bigint>;
    getTopScores(limit: bigint): Promise<Array<PlayerScore>>;
    submitScore(name: string, distance: number, carIndex: bigint): Promise<void>;
}
