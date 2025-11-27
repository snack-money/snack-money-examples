import { CdpClient } from "@coinbase/cdp-sdk";
import axios from "axios";
import { config } from "dotenv";
import { toAccount } from "viem/accounts";
import { decodeXPaymentResponse, withPaymentInterceptor } from "x402-axios";

config();

const apiKeyId = process.env.CDP_API_KEY_ID as string;
const apiKeySecret = process.env.CDP_API_KEY_SECRET as string;
const walletSecret = process.env.CDP_WALLET_SECRET as string;
const existingWalletAddress = process.env.WALLET_ADDRESS as string;
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

  console.log("✅ Initialized CDP client\n");

  // Get or create a server account
  const serverAccount = await client.evm.getOrCreateAccount({
    name: "snack-money-x402",
  });

  if (!existingWalletAddress) {
    console.log(`✅ New CDP server wallet created!`);
    console.log(`📍 Wallet Address: ${serverAccount.address}`);
    console.log(`\n⚠️  IMPORTANT: Save this address to your .env file!`);
    console.log(`   Add this line to your .env file:`);
    console.log(`   WALLET_ADDRESS=${serverAccount.address}\n`);
    console.log(`📝 Next steps:`);
    console.log(`   1. Copy the wallet address above`);
    console.log(`   2. Paste it in your .env file as WALLET_ADDRESS`);
    console.log(`   3. Fund this wallet with USDC on Base network`);
    console.log(`   4. Run the script again to make a payment\n`);
    process.exit(0);
  }

  if (serverAccount.address.toLowerCase() !== existingWalletAddress.toLowerCase()) {
    console.error(`❌ Wallet address mismatch!`);
    console.log(`   Expected: ${existingWalletAddress}`);
    console.log(`   Got: ${serverAccount.address}`);
    console.log(`\n💡 Tip: Make sure you're using the same CDP credentials that created this wallet.`);
    process.exit(1);
  }

  console.log(`✅ CDP server wallet connected: ${serverAccount.address}\n`);

  // Check USDC balance on Base
  console.log("🔍 Checking USDC balance on Base...");
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base

  let balance = 0;
  try {
    const balanceResponse = await fetch(
      `https://base-mainnet.g.alchemy.com/v2/demo/getTokenBalances?address=${serverAccount.address}&tokens[]=${usdcAddress}`
    );
    const balanceData = await balanceResponse.json();
    if (balanceData?.tokenBalances?.[0]?.tokenBalance) {
      balance = parseInt(balanceData.tokenBalances[0].tokenBalance, 16) / 1e6;
    }
  } catch (error) {
    console.log("⚠️  Could not fetch balance, continuing anyway...");
  }

  console.log(`💰 Current USDC Balance: ${balance.toFixed(6)} USDC\n`);

  if (balance < amount) {
    console.error(`❌ Insufficient balance! You need at least ${amount} USDC.`);
    console.log(`\n📝 How to fund your wallet:`);
    console.log(`   Wallet Address: ${serverAccount.address}`);
    console.log(`\n   Option 1: Bridge USDC to Base`);
    console.log(`   → Visit: https://bridge.base.org`);
    console.log(`\n   Option 2: Buy USDC on Coinbase`);
    console.log(`   → Visit: https://www.coinbase.com`);
    console.log(`   → Then withdraw to Base network`);
    console.log(`\n   Option 3: Send from another wallet`);
    console.log(`   → Network: Base Mainnet`);
    console.log(`   → Token: USDC (${usdcAddress})`);
    console.log(`   → To: ${serverAccount.address}\n`);
    process.exit(1);
  }

  // Convert to viem account for x402
  const account = toAccount(serverAccount);

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
