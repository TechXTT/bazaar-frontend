import backendAxiosInstance from "..";
import { DisputeReq } from "../interfaces/disputes";


export const _createDispute = async (data: DisputeReq, token: string) => {
    try {

        const form = new FormData();
        form.append('orderId', data.OrderID)
        form.append('dispute', data.Dispute)
        
        for (let i = 0; i < data.Images!.length; i++) {
            form.append('images', data.Images![i])
        }

        return await backendAxiosInstance.postForm("/api/disputes", form, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const _closeDispute = async (disputeID: string, token: string) => {
    try {
        return await backendAxiosInstance.put(`/api/disputes/${disputeID}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const _getDisputeByOrderID = async (orderID: string, token: string) => {
    try {
        return await backendAxiosInstance.get(`/api/disputes/order/${orderID}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

