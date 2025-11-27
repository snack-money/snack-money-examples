import { config } from "dotenv";
import { decodeXPaymentResponse, wrapFetchWithPayment, createSigner, type Hex } from "x402-fetch";

config();

const privateKey = process.env.PRIVATE_KEY as Hex | string;
const network = process.env.NETWORK as "base" | "solana" || "base";
const receiver = process.env.RECEIVER as string;
const amount = parseFloat(process.env.AMOUNT || "0.01");

if (!privateKey || !receiver) {
  console.error("Missing required environment variables: PRIVATE_KEY and RECEIVER");
  process.exit(1);
}

/**
 * This example shows how to use x402-fetch to make a payment via Snack Money API.
 *
 * The x402-fetch package wraps the native fetch API to automatically handle
 * 402 Payment Required responses and execute payments on the specified network.
 */
async function main(): Promise<void> {
  console.log(`🚀 Starting Snack Money payment example with x402-fetch (${network.toUpperCase()})\n`);

  // Create a signer for the specified network
  const signer = await createSigner(network, privateKey);
  console.log(`✅ Created ${network} signer`);

  // Wrap fetch with payment capabilities
  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);

  console.log(`💸 Sending ${amount} USDC to @${receiver} on X...\n`);

  try {
    const response = await fetchWithPayment("https://api.snack.money/payments/x/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "USDC",
        receiver: receiver,
        description: "Payment via x402-fetch example"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Payment failed:", errorData);
      process.exit(1);
    }

    const data = await response.json();
    console.log("✅ Payment successful!");
    console.log("\n📊 Response:", JSON.stringify(data, null, 2));

    // Decode and display payment response header
    const paymentResponseHeader = response.headers.get("x-payment-response");
    if (paymentResponseHeader) {
      const paymentResponse = decodeXPaymentResponse(paymentResponseHeader);
      console.log("\n🔐 Payment Response Details:", JSON.stringify(paymentResponse, null, 2));
    }
  } catch (error: any) {
    console.error("❌ Payment failed:", error.response?.data?.error ?? error.message);
    process.exit(1);
  }
}

main();
