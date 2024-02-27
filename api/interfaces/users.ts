import { UUID } from "crypto";
import { IProduct } from "./products";

export interface IUser {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: UUID;
    FirstName: string;
    LastName: string;
    Email: string;
    Role: string;
}

export interface IRegisterUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface ILoginUser {
    email: string;
    password: string;
}

export interface ICart {
    products: {
        product: IProduct;
        quantity: number;
    }[];
    total: number;
}