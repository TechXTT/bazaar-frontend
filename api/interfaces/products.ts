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

/**
 * Shape returned by POST /api/products/orders for each created order.
 *
 * FE-2: `product_id`/`quantity` let the client correlate each response to the cart
 * item it belongs to by ProductID rather than by fragile array position (the backend
 * could reorder or dedup). They are optional because the current backend response
 * only includes `id`/`owner_address`; once it adds them, checkout correlates by id.
 */
export interface OrderResponse {
    id: string;
    owner_address: string;
    product_id?: UUID;
    quantity?: number;
}