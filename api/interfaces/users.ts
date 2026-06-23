import { UUID } from "crypto";
import { ICartItem } from "./products";

export interface IUser {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: UUID;
    FirstName: string;
    LastName: string;
    Email: string;
    WalletAddress: string;

    // XL-2: additional fields exposed by the backend user model.
    /** Optional shipping / billing address on file. */
    Address?: string;
    /** ISO timestamp of the user's most recent login, if tracked. */
    LastLoginAt?: string;
}

export interface UserReq {
    FirstName: string;
    LastName: string;
    Email: string;
    WalletAddress: string;
}

export interface ICart {
    products: ICartItem[];
    total: number;
}