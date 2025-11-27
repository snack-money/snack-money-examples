import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";

/**
 * This example shows how to use thirdweb's x402 payment wrapper to make a payment via Snack Money API.
 *
 * Thirdweb provides a server-side wallet solution that can be used with the x402 protocol
 * to automatically handle payment negotiations and execute transactions.
 *
 * This example creates an in-app server wallet automatically - no need to manage wallet addresses.
 */
async function main(): Promise<void> {
  const receiver = process.env.RECEIVER as string;
  const amount = parseFloat(process.env.AMOUNT || "0.01");
  const clientId = process.env.THIRDWEB_CLIENT_ID as string;
  const secretKey = process.env.THIRDWEB_SECRET_KEY as string;
  const existingWalletAddress = process.env.WALLET_ADDRESS as string;

  if (!receiver || !clientId || !secretKey) {
    console.error("Missing required environment variables: RECEIVER, THIRDWEB_CLIENT_ID, and THIRDWEB_SECRET_KEY");
    process.exit(1);
  }

  console.log("🚀 Starting Snack Money payment example with thirdweb\n");

  // Create thirdweb client
  const client = createThirdwebClient({
    clientId: clientId,
    secretKey: secretKey,
  });

  // Create or connect to in-app server wallet
  const wallet = inAppWallet();
  const account = await wallet.connect({
    client: client,
    strategy: "jwt",
    jwt: async () => {
      // For server wallets, we can generate a simple JWT or use thirdweb's built-in auth
      // In production, you'd want proper JWT generation
      return secretKey;
    },
  });

  const walletAddress = account.address;

  if (!existingWalletAddress) {
    console.log(`✅ New server wallet created!`);
    console.log(`📍 Wallet Address: ${walletAddress}`);
    console.log(`\n⚠️  IMPORTANT: Save this address to your .env file!`);
    console.log(`   Add this line to your .env file:`);
    console.log(`   WALLET_ADDRESS=${walletAddress}\n`);
    console.log(`📝 Next steps:`);
    console.log(`   1. Copy the wallet address above`);
    console.log(`   2. Paste it in your .env file as WALLET_ADDRESS`);
    console.log(`   3. Fund this wallet with USDC on Base network`);
    console.log(`   4. Run the script again to make a payment\n`);
    process.exit(0);
  }

  if (walletAddress.toLowerCase() !== existingWalletAddress.toLowerCase()) {
    console.error(`❌ Wallet address mismatch!`);
    console.log(`   Expected: ${existingWalletAddress}`);
    console.log(`   Got: ${walletAddress}`);
    console.log(`\n💡 Tip: Make sure you're using the same thirdweb credentials.`);
    process.exit(1);
  }

  console.log(`✅ Server wallet connected: ${walletAddress}\n`);

  // Check USDC balance on Base
  console.log("🔍 Checking USDC balance on Base...");
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base

  let balance = 0;
  try {
    const balanceResponse = await fetch(
      `https://base-mainnet.g.alchemy.com/v2/demo/getTokenBalances?address=${walletAddress}&tokens[]=${usdcAddress}`
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
    console.log(`   Wallet Address: ${walletAddress}`);
    console.log(`\n   Option 1: Bridge USDC to Base`);
    console.log(`   → Visit: https://bridge.base.org`);
    console.log(`\n   Option 2: Buy USDC on Coinbase`);
    console.log(`   → Visit: https://www.coinbase.com`);
    console.log(`   → Then withdraw to Base network`);
    console.log(`\n   Option 3: Send from another wallet`);
    console.log(`   → Network: Base Mainnet`);
    console.log(`   → Token: USDC (${usdcAddress})`);
    console.log(`   → To: ${walletAddress}\n`);
    process.exit(1);
  }

  const url = "https://api.snack.money/payments/x/pay";
  const encodedUrl = encodeURIComponent(url);

  console.log(`💸 Sending ${amount} USDC to @${receiver} on X...\n`);

  try {
    // Using thirdweb's x402 fetch wrapper
    const response = await fetch(
      `https://api.thirdweb.com/v1/payments/x402/fetch?from=${walletAddress}&url=${encodedUrl}`,
      {
        method: "POST",
        headers: {
          "x-secret-key": secretKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amount,
          currency: "USDC",
          receiver: receiver,
          description: "Payment via thirdweb x402 wrapper"
        })
      }
    );

    const startTime = Date.now();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n📊 Response received in ${duration}s`);
    console.log(`📈 Status: ${response.status}`);
    console.log(`📋 Headers:`);

    // Log all response headers
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    const data = await response.json() as any;
    console.log("\n📄 Response Body:");
    console.log(JSON.stringify(data, null, 2));

    // Analyze the response
    if (response.status === 402) {
      console.log("\n⚠️  Payment Required (402)");

      // Parse the X402 payment details
      if (data.accepts && data.accepts.length > 0) {
        const accept = data.accepts[0];
        const requiredUSDC = parseInt(accept.maxAmountRequired) / 1e6;

        console.log("\n💳 Payment Requirements:");
        console.log(`   💸 Amount: ${requiredUSDC.toFixed(6)} USDC`);
        console.log(`   🏦 Pay to: ${accept.payTo}`);
        console.log(`   ⏰ Timeout: ${accept.maxTimeoutSeconds}s`);
        console.log(`   🌐 Network: ${accept.network}`);
        console.log(`   🪙 Asset: ${accept.asset} (${accept.extra?.name || 'USDC'})`);
      }
    } else if (response.status === 200) {
      console.log("\n✅ Payment successful!");
    } else {
      console.log(`\n❓ Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Payment failed:", error);
    process.exit(1);
  }
}

main();
