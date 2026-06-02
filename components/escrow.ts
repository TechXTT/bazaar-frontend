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
  shipped: boolean;
  releaseTime: bigint;
  shippingDeadline: bigint;
  deliveryWindow: bigint;
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
    amount: result.amount,
    releaseTime: result.releaseTime,
    shippingDeadline: result.shippingDeadline,
    deliveryWindow: result.deliveryWindow,
    shipped: result.shipped,
    release: result.release,
    completed: result.completed,
    productId: result.productId,
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

  const submitPromise = contract.createOrder(
    messageToBytes32(orderId),
    messageToBytes32(productId),
    receiver,
    releaseTime,
    { value }
  ) as Promise<ethers.TransactionResponse>;

  toast.promise(submitPromise, {
    loading: "Waiting for MetaMask…",
    success: "Transaction submitted",
    error: "Transaction rejected",
  });

  const tx = await submitPromise;

  // Mine in background — don't block the checkout flow
  tx.wait().then(() => {
    toast.success("Order confirmed on-chain");
  }).catch(() => {
    toast.error("Order transaction failed on-chain");
  });

  return tx;
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

  const orderSubmitPromise = escrow.createOrderERC20(
    messageToBytes32(orderId),
    messageToBytes32(productId),
    receiver,
    releaseTime,
    amount
  ) as Promise<ethers.TransactionResponse>;

  toast.promise(orderSubmitPromise, {
    loading: "Waiting for MetaMask…",
    success: "Transaction submitted",
    error: "Order failed",
  });

  const orderTx = await orderSubmitPromise;

  orderTx.wait().then(() => {
    toast.success("Order confirmed on-chain");
  }).catch(() => {
    toast.error("Order transaction failed on-chain");
  });

  return { approveTx, orderTx };
}

async function sendTx(
  txFn: () => Promise<ethers.TransactionResponse>,
  labels: { loading: string; submitted: string; error: string; confirmed: string }
): Promise<ethers.TransactionResponse> {
  const submitPromise = txFn();
  toast.promise(submitPromise, {
    loading: labels.loading,
    success: labels.submitted,
    error: labels.error,
  });
  const tx = await submitPromise;
  tx.wait()
    .then(() => toast.success(labels.confirmed))
    .catch(() => toast.error(labels.error));
  return tx;
}

export async function refundOrder(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.refundOrder(messageToBytes32(orderId)),
    { loading: "Waiting for MetaMask…", submitted: "Refund submitted", confirmed: "Buyer refunded", error: "Refund failed" }
  );
}

export async function claimOrder(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.claimOrder(messageToBytes32(orderId)),
    { loading: "Waiting for MetaMask…", submitted: "Claim submitted", confirmed: "Funds claimed", error: "Claim failed" }
  );
}

export async function claimOrders(orderIds: string[]): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.claimOrders(orderIds.map((id) => messageToBytes32(id))),
    { loading: "Waiting for MetaMask…", submitted: "Claim submitted", confirmed: "Funds claimed", error: "Claim failed" }
  );
}

export async function markShipped(
  orderId: string,
  trackingHash?: string
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.markShipped(messageToBytes32(orderId), trackingHash ?? ethers.ZeroHash),
    { loading: "Waiting for MetaMask…", submitted: "Shipment submitted", confirmed: "Order marked as shipped", error: "Failed to mark as shipped" }
  );
}

export async function confirmReceipt(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.releaseOrder(messageToBytes32(orderId)),
    { loading: "Waiting for MetaMask…", submitted: "Confirmation submitted", confirmed: "Receipt confirmed — funds released", error: "Failed to confirm receipt" }
  );
}

export async function buyerReclaim(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.buyerReclaim(messageToBytes32(orderId)),
    { loading: "Waiting for MetaMask…", submitted: "Reclaim submitted", confirmed: "Funds reclaimed", error: "Failed to reclaim funds" }
  );
}

export async function raiseDisputeBuyer(
  orderId: string,
  arbitrationFee: bigint
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.raiseDisputeBuyer(messageToBytes32(orderId), { value: arbitrationFee }),
    { loading: "Raising dispute…", submitted: "Dispute submitted", confirmed: "Dispute raised", error: "Failed to raise dispute" }
  );
}

export async function raiseDisputeReceiver(
  orderId: string,
  arbitrationFee: bigint
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.raiseDisputeReceiver(messageToBytes32(orderId), { value: arbitrationFee }),
    { loading: "Paying arbitration fee…", submitted: "Fee submitted", confirmed: "Arbitration fee paid", error: "Failed to pay arbitration fee" }
  );
}

export async function timeoutByBuyer(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.timeoutByBuyer(messageToBytes32(orderId)),
    { loading: "Waiting for MetaMask…", submitted: "Timeout submitted", confirmed: "Timeout executed — funds returned", error: "Timeout failed" }
  );
}

export async function timeoutByReceiver(orderId: string): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.timeoutByReceiver(messageToBytes32(orderId)),
    { loading: "Waiting for MetaMask…", submitted: "Timeout submitted", confirmed: "Timeout executed — funds released", error: "Timeout failed" }
  );
}

export async function submitEvidence(
  orderId: string,
  evidenceURI: string
): Promise<ethers.TransactionResponse> {
  const contract = await getEscrowContract();
  return sendTx(
    () => contract.submitEvidence(messageToBytes32(orderId), evidenceURI),
    { loading: "Submitting evidence…", submitted: "Evidence submitted", confirmed: "Evidence confirmed on-chain", error: "Evidence submission failed" }
  );
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
