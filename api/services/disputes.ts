import { AxiosResponse } from "axios";
import backendAxiosInstance from "..";

export interface IDisputeEvidence {
    ID: string;
    DisputeID: string;
    OrderID: string;
    Party: string;
    URI: string;
    TxHash: string;
}

export interface IDispute {
    ID: string;
    OrderID: string;
    RaisedBy: string;
    ArbitratorDisputeID: number | null;
    Ruling: number | null;
    Status: "fee_pending" | "arbitrating" | "resolved" | "timed_out";
    TxHash: string;
    Evidence: IDisputeEvidence[];
}

export const _getDisputes = async (): Promise<AxiosResponse<IDispute[]>> =>
    backendAxiosInstance.get("/api/disputes");

export const _getDisputeByOrderID = async (orderId: string): Promise<AxiosResponse<IDispute>> =>
    backendAxiosInstance.get(`/api/disputes/${orderId}`);

export const _getEvidence = async (orderId: string): Promise<AxiosResponse<IDisputeEvidence[]>> =>
    backendAxiosInstance.get(`/api/orders/${orderId}/evidence`);
