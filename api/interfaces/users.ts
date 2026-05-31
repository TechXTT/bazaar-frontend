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