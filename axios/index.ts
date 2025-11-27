import axios from "axios";
import { config } from "dotenv";
import {
  withPaymentInterceptor,
  decodeXPaymentResponse,
  createSigner,
  type Hex,
  MultiNetworkSigner,
} from "x402-axios";

config();

const evmPrivateKey = process.env.EVM_PRIVATE_KEY as Hex;
const svmPrivateKey = process.env.SVM_PRIVATE_KEY as string;
const receiver = process.env.RECEIVER as string;
const amount = parseFloat(process.env.AMOUNT || "0.01");

if (!evmPrivateKey || !svmPrivateKey || !receiver) {
  console.error("Missing required environment variables: EVM_PRIVATE_KEY, SVM_PRIVATE_KEY, and RECEIVER");
  process.exit(1);
}

/**
 * This example shows how to use x402-axios to make a payment via Snack Money API.
 *
 * The API supports both Base (EVM) and Solana networks. The x402 protocol will
 * automatically handle the payment negotiation and execute the transaction on the
 * appropriate network based on your wallet configuration.
 */
async function main(): Promise<void> {
  console.log("🚀 Starting Snack Money payment example with x402-axios\n");

  // Create signers for both Base and Solana networks
  const evmSigner = await createSigner("base", evmPrivateKey);
  const svmSigner = await createSigner("solana", svmPrivateKey);
  const signer = { evm: evmSigner, svm: svmSigner } as MultiNetworkSigner;

  console.log("✅ Created multi-network signers (Base + Solana)");

  // Create axios instance with payment interceptor
  const api = withPaymentInterceptor(
    axios.create({
      baseURL: "https://api.snack.money",
    }),
    signer,
  );

  console.log(`💸 Sending ${amount} USDC to @${receiver} on X...\n`);

  try {
    const response = await api.post("/payments/x/pay", {
      amount: amount,
      currency: "USDC",
      receiver: receiver,
      description: "Payment via x402-axios example"
    });

    console.log("✅ Payment successful!");
    console.log("\n📊 Response:", JSON.stringify(response.data, null, 2));

    // Decode and display payment response header
    const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
    if (paymentResponse) {
      console.log("\n🔐 Payment Response Details:", JSON.stringify(paymentResponse, null, 2));
    }
  } catch (error: any) {
    console.error("❌ Payment failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

main();
