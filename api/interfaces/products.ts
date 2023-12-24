import { UUID } from "crypto";
import { IStore } from "./stores";

export interface IProduct {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: UUID;
    Name: string;
    ImageURL: string;
    Price: number;
    Unit: string;
    Description: string;
    StoreID: UUID;
    Store: IStore;
}