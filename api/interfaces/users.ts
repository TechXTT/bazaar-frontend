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

export interface IRegisterUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UserReq {
    FirstName: string;
    LastName: string;
    Email: string;
    WalletAddress: string;
}

export interface ILoginUser {
    email: string;
    password: string;
}

export interface ICart {
    products: ICartItem[];
    total: number;
}