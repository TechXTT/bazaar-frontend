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

/** A product flattened into the cart with the chosen quantity. */
export interface ICartItem extends IProduct {
    Quantity: number;
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
}

export interface OrderReq {
    CreatedAt: string;
    ProductID: UUID;
    Quantity: number;
    BuyerAddress: string;
}

/** Shape returned by POST /api/products/orders for each created order. */
export interface OrderResponse {
    id: string;
    owner_address: string;
}