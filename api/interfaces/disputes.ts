import { IOrder } from "./products";


export interface IDispute {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: string;
    OrderID: string;
    Order: IOrder;
    Dispute: string;
    Resolved: boolean;
    Messages: IMessage[];
}

export interface DisputeReq {
    OrderID: string;
    Dispute: string;
    Images?: File[];
}

export interface IMessage {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    ID: string;
    DisputeID: string;
    SenderID: string;
    Sender: string;
    Message: string;
}