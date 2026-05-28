export type { IDispute, IDisputeEvidence } from "@/api/services/disputes";

// Legacy type kept for backward compatibility
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
