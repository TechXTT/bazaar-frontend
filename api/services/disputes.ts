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

export const _getDisputes = async (): Promise<AxiosResponse<IDispute[]>> => {
    try {
        return await backendAxiosInstance.get("/api/disputes");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const _getDisputeByOrderID = async (orderId: string, _token?: string | null): Promise<AxiosResponse<IDispute>> => {
    try {
        return await backendAxiosInstance.get(`/api/disputes/${orderId}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const _getEvidence = async (orderId: string): Promise<AxiosResponse<IDisputeEvidence[]>> => {
    try {
        return await backendAxiosInstance.get(`/api/orders/${orderId}/evidence`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};
