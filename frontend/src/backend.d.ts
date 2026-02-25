import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BoardState {
    staffCards: Array<Card>;
    courseCards: Array<Card>;
}
export interface Card {
    id: bigint;
    title: string;
    description: string;
    position: [bigint, bigint];
}
export interface backendInterface {
    getAllBoardStates(): Promise<Array<[string, BoardState]>>;
    getBoardState(userId: string): Promise<BoardState>;
    updateBoardState(userId: string, newState: BoardState): Promise<void>;
}
