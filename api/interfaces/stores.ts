import { UUID } from "crypto";
import { IUser } from "./users";
import { IProduct } from "./products";

export interface IReputation {
    TotalOrders: number;
    CompletedOrders: number;
    CancelledOrders: number;
    DisputeCount: number;
    DisputeSellerWon: number;
    DisputeBuyerWon: number;
    Score: number | null;
}

export interface IStore {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: UUID;
    Name: string;
    OwnerID: UUID;
    Owner: IUser;
    Products: IProduct[] | null;
    Reputation: IReputation | null;
}
