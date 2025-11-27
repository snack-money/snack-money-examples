import { CdpClient } from "@coinbase/cdp-sdk";
import axios from "axios";
import { config } from "dotenv";
import { toAccount } from "viem/accounts";
import { decodeXPaymentResponse, withPaymentInterceptor } from "x402-axios";

config();

const apiKeyId = process.env.CDP_API_KEY_ID as string;
const apiKeySecret = process.env.CDP_API_KEY_SECRET as string;
const walletSecret = process.env.CDP_WALLET_SECRET as string;
const receiver = process.env.RECEIVER as string;
const amount = parseFloat(process.env.AMOUNT || "0.01");

if (!apiKeyId || !apiKeySecret || !walletSecret || !receiver) {
  console.error("Missing required environment variables: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET, and RECEIVER");
  process.exit(1);
}

/**
 * This example shows how to use Coinbase CDP SDK with x402-axios to make a payment via Snack Money API.
 *
 * The Coinbase CDP SDK provides server-side wallet management with MPC security.
 * This example uses CDP wallets on Base network to send USDC payments.
 */
async function main(): Promise<void> {
  console.log("🚀 Starting Snack Money payment example with CDP SDK\n");

  // Initialize CDP client
  const client = new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret,
  });

  console.log("✅ Initialized CDP client");

  // Get or create a server account
  const serverAccount = await client.evm.getOrCreateAccount({
    name: "snack-money-x402",
  });

  console.log("✅ Retrieved CDP server account");

  // Convert to viem account for x402
  const account = toAccount(serverAccount);

  // Create axios instance with payment interceptor
  const api = withPaymentInterceptor(
    axios.create({
      baseURL: "https://api.snack.money",
    }),
    account,
  );

  console.log(`💸 Sending ${amount} USDC to @${receiver} on X...\n`);

  try {
    const response = await api.post("/payments/x/pay", {
      amount: amount,
      currency: "USDC",
      receiver: receiver,
      description: "Payment via CDP SDK example"
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
