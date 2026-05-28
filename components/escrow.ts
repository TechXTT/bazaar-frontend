"use client";

import { CONFIG } from "@/config/config";
import { ABI } from "@/escrow_abi";
import { messageToBytes32 } from "@/utils/helpers";
import { ethers } from "ethers";
import { toast } from "sonner";

export type EscrowOrderState = {
  amount: bigint;
  buyer: string;
  receiver: string;
  token: string;
  productId: string;
  completed: boolean;
  release: boolean;
  releaseTime: bigint;
};

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export async function getEscrowContract() {
  const provider = new ethers.BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
}

export async function getEscrowOrder(orderId: string): Promise<EscrowOrderState> {
  const contract = await getEscrowContract();
  const result = await contract.orders(messageToBytes32(orderId));

  return {
    buyer: result.buyer,
    receiver: result.receiver,
    token: result.token,
    productId: result.productId,
    amount: result.amount,
    releaseTime: result.releaseTime,
    release: result.release,
    completed: result.completed,
  };
}

export async function createOrder(
  orderId: string,
  productId: string,
  receiver: string,
  releaseTime: number,
  value: bigint
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.createOrder(
      messageToBytes32(orderId),
      messageToBytes32(productId),
      receiver,
      releaseTime,
      { value }
    );
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Waiting for MetaMask",
    success: "Order paid",
    error: "Checkout failed",
  });

  return txPromise;
}

export async function createOrderERC20(
  orderId: string,
  productId: string,
  receiver: string,
  releaseTime: number,
  amount: bigint
): Promise<{ approveTx: ethers.TransactionResponse; orderTx: ethers.TransactionResponse }> {
  const provider = new ethers.BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();

  const usdcAddress = CONFIG.USDC_ADDRESS;
  if (!usdcAddress) throw new Error("USDC_ADDRESS not configured");

  const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
  const escrow = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);

  const approvePromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await usdc.approve(CONFIG.CONTRACT_ADDRESS, amount);
    await tx.wait();
    return tx;
  })();

  toast.promise(approvePromise, {
    loading: "Approving USDC spend…",
    success: "USDC approved",
    error: "Approval failed",
  });

  const approveTx = await approvePromise;

  const orderPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await escrow.createOrderERC20(
      messageToBytes32(orderId),
      messageToBytes32(productId),
      receiver,
      releaseTime,
      amount
    );
    await tx.wait();
    return tx;
  })();

  toast.promise(orderPromise, {
    loading: "Confirming order…",
    success: "Order placed",
    error: "Order failed",
  });

  const orderTx = await orderPromise;
  return { approveTx, orderTx };
}

export async function refundOrder(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.refundOrder(messageToBytes32(orderId));
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Waiting for MetaMask",
    success: "Buyer refunded",
    error: "Refund failed",
  });

  return txPromise;
}

export async function claimOrder(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.claimOrder(messageToBytes32(orderId));
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Waiting for MetaMask",
    success: "Funds claimed",
    error: "Claim failed",
  });

  return txPromise;
}

export async function claimOrders(orderIds: string[]): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.claimOrders(orderIds.map((id) => messageToBytes32(id)));
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Waiting for MetaMask",
    success: "Funds claimed",
    error: "Claim failed",
  });

  return txPromise;
}

export async function raiseDisputeBuyer(
  orderId: string,
  arbitrationFee: bigint
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.raiseDisputeBuyer(messageToBytes32(orderId), { value: arbitrationFee });
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Raising dispute…",
    success: "Dispute raised",
    error: "Failed to raise dispute",
  });

  return txPromise;
}

export async function raiseDisputeReceiver(
  orderId: string,
  arbitrationFee: bigint
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.raiseDisputeReceiver(messageToBytes32(orderId), { value: arbitrationFee });
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Paying arbitration fee…",
    success: "Arbitration fee paid",
    error: "Failed to pay arbitration fee",
  });

  return txPromise;
}

export async function timeoutByBuyer(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.timeoutByBuyer(messageToBytes32(orderId));
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Claiming timeout…",
    success: "Timeout executed — funds returned",
    error: "Timeout failed",
  });

  return txPromise;
}

export async function timeoutByReceiver(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.timeoutByReceiver(messageToBytes32(orderId));
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Claiming timeout…",
    success: "Timeout executed — funds released",
    error: "Timeout failed",
  });

  return txPromise;
}

export async function submitEvidence(
  orderId: string,
  evidenceURI: string
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  const txPromise: Promise<ethers.TransactionResponse> = (async () => {
    const tx = await contract.submitEvidence(messageToBytes32(orderId), evidenceURI);
    await tx.wait();
    return tx;
  })();

  toast.promise(txPromise, {
    loading: "Submitting evidence…",
    success: "Evidence submitted on-chain",
    error: "Evidence submission failed",
  });

  return txPromise;
}

export async function getArbitrationCost(): Promise<bigint> {
  const contract = await getEscrowContract();
  const arbitratorAddress: string = await contract.arbitrator();
  const extraData: string = await contract.arbitratorExtraData();

  const arbitratorABI = ["function arbitrationCost(bytes calldata _extraData) view returns (uint256)"];
  const provider = new ethers.BrowserProvider(window.ethereum!);
  const arbitrator = new ethers.Contract(arbitratorAddress, arbitratorABI, provider);
  return arbitrator.arbitrationCost(extraData);
}

export async function getFeeBps(): Promise<bigint> {
  const contract = await getEscrowContract();
  return contract.feeBps();
}
