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

export interface ProductReq {
    Name: string;
    Price: string;
    Description: string;
    StoreID: UUID;
    Image: File | null;
}

export interface IOrder {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: UUID;
    BuyerID: UUID;
    ProductID: UUID;
    Product: IProduct;
    Quantity: number;
    Total: number;
    Status: string;
    TxHash: string | null;
}