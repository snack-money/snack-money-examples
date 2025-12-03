import axios from "axios";
import { config } from "dotenv";
import { type Hex, type Address, type SignableMessage } from "viem";
import { toAccount } from "viem/accounts";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";

config();

const crossmintApiKey = process.env.CROSSMINT_API_KEY as string;
const walletLocator = process.env.WALLET_LOCATOR as string;
const smartWalletAddress = process.env.SMART_WALLET_ADDRESS as string;
const receiver = process.env.RECEIVER as string;
const amount = parseFloat(process.env.AMOUNT || "0.01");

if (!crossmintApiKey || !walletLocator || !smartWalletAddress || !receiver) {
  console.error("Missing required environment variables: CROSSMINT_API_KEY, WALLET_LOCATOR, SMART_WALLET_ADDRESS, and RECEIVER");
  process.exit(1);
}

/**
 * This example shows how to use Crossmint Smart Wallets with the x402 payment protocol via Snack Money API.
 *
 * Key Features:
 * - Uses Crossmint's API-based signing (no private key exposure)
 * - Smart contract wallet holds and sends funds
 * - Demonstrates x402 payment flow with Crossmint infrastructure
 *
 * Prerequisites:
 * - Existing Crossmint smart wallet (created via Crossmint Console)
 * - Wallet funded with USDC on Base network
 */

// Helper function to request and poll for Crossmint signature
async function requestCrossmintSignature(
  walletLocator: string,
  apiKey: string,
  signatureRequest: any
): Promise<Hex> {
  // Create signature request
  const createResponse = await axios.post(
    `https://www.crossmint.com/api/2022-06-09/wallets/${walletLocator}/signatures`,
    signatureRequest,
    {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      }
    }
  );

  const signatureId = createResponse.data.id;

  // Poll for signature completion
  let signature: string | null = null;
  let attempts = 0;
  const maxAttempts = 20;

  while (!signature && attempts < maxAttempts) {
    attempts++;

    const statusResponse = await axios.get(
      `https://www.crossmint.com/api/2022-06-09/wallets/${walletLocator}/signatures/${signatureId}`,
      {
        headers: {
          "X-API-KEY": apiKey
        }
      }
    );

    signature = statusResponse.data.outputSignature;

    if (signature) {
      return signature as Hex;
    }

    if (statusResponse.data.status === 'failed') {
      throw new Error(`Signature failed: ${JSON.stringify(statusResponse.data)}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Signature did not complete after ${maxAttempts} attempts`);
}

// Create a viem LocalAccount that uses Crossmint's signature API
function createCrossmintAccount(
  address: Address,
  walletLocator: string,
  apiKey: string
) {
  const account = toAccount({
    address,

    async signMessage({ message }: { message: SignableMessage }): Promise<Hex> {
      const messageStr = typeof message === 'string' ? message : (message as any).raw || JSON.stringify(message);

      return requestCrossmintSignature(walletLocator, apiKey, {
        type: "evm-message",
        params: {
          message: messageStr,
          chain: "base"
        }
      });
    },

    signTransaction: async () => {
      throw new Error("Transaction signing not supported - use Crossmint transaction API");
    },

    signTypedData: async (typedData: any): Promise<Hex> => {
      return requestCrossmintSignature(walletLocator, apiKey, {
        type: "evm-typed-data",
        params: {
          typedData,
          chain: "base"
        }
      });
    }
  });

  // Add the 'sign' function that x402 library expects
  return {
    ...account,
    sign: async ({ hash }: { hash: Hex }): Promise<Hex> => {
      return account.signMessage({ message: { raw: hash } as any });
    }
  } as any;
}

async function main(): Promise<void> {
  console.log("🚀 Starting Snack Money payment example with Crossmint Smart Wallet\n");
  console.log(`✅ Smart Wallet Address: ${smartWalletAddress}`);
  console.log(`💡 Check balance: https://basescan.org/address/${smartWalletAddress}\n`);

  // Create Crossmint viem Account
  console.log("🔐 Creating Crossmint account...\n");

  const crossmintAccount = createCrossmintAccount(
    smartWalletAddress as Address,
    walletLocator,
    crossmintApiKey
  );

  // Create axios instance with x402 payment interceptor
  const api = withPaymentInterceptor(
    axios.create({
      baseURL: "https://api.snack.money",
    }),
    crossmintAccount as never,
  );

  console.log(`💸 Sending ${amount} USDC to @${receiver} on X...\n`);

  try {
    const response = await api.post("/payments/x/pay", {
      amount: amount,
      currency: "USDC",
      receiver: receiver,
      description: "Payment via Crossmint Smart Wallet"
    });

    console.log("✅ Payment successful!");
    console.log("\n📊 Response:", JSON.stringify(response.data, null, 2));

    // Decode and display payment response header
    const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
    if (paymentResponse) {
      console.log("\n🔐 Payment Response Details:", JSON.stringify(paymentResponse, null, 2));
    }

    // Print receipt URL
    if (response.data.data?.receipt) {
      console.log(`\n🧾 Receipt: ${response.data.data.receipt}`);
    }

  } catch (error: any) {
    console.error("❌ Payment failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

main();
