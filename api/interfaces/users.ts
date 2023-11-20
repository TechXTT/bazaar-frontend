import { UUID } from "crypto";

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