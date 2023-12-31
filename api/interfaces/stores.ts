import { UUID } from "crypto";
import { IUser } from "./users";
import { IProduct } from "./products";

export interface IStore {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: UUID;
    Name: string;
    OwnerID: UUID;
    Owner: IUser;
    Products: IProduct[] | null;
}