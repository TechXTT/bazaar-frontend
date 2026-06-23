import { UUID } from "crypto";
import { z } from "zod";
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

/**
 * FE-12: runtime-validate the order-creation response before escrowing any funds,
 * so a malformed payload fails loudly instead of producing a bad on-chain amount.
 * `id` must be a non-empty string and `owner_address` a 0x-prefixed address.
 */
export const orderResponseSchema = z.object({
    id: z.string().min(1),
    owner_address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "invalid receiver address"),
    product_id: z.string().uuid().optional(),
    quantity: z.number().int().positive().optional(),
});

export const orderResponseArraySchema = z.array(orderResponseSchema);