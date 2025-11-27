import axios from "axios";
import { config } from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
import {
  withPaymentInterceptor,
  decodeXPaymentResponse,
  type Hex,
} from "x402-axios";

config();

const evmPrivateKey = process.env.EVM_PRIVATE_KEY as Hex;
const receiver = process.env.RECEIVER as string;
const amount = parseFloat(process.env.AMOUNT || "0.01");

if (!evmPrivateKey || !receiver) {
  console.error("Missing required environment variables: EVM_PRIVATE_KEY and RECEIVER");
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

  // Create Base signer from private key
  const account = privateKeyToAccount(evmPrivateKey);
  console.log("✅ Base signer created");

  // Create axios instance with payment interceptor
  const api = withPaymentInterceptor(
    axios.create({
      baseURL: "https://api.snack.money",
    }),
    account as never,
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
