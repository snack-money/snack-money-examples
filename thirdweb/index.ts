import { config } from "dotenv";

config();

/**
 * This example shows how to use thirdweb's x402 payment wrapper to make a payment via Snack Money API.
 *
 * Thirdweb's x402 wrapper handles the payment negotiation and execution automatically.
 * You only need to provide a wallet address with USDC on Base network.
 */
async function main(): Promise<void> {
  const receiver = process.env.RECEIVER as string;
  const amount = parseFloat(process.env.AMOUNT || "0.01");
  const secretKey = process.env.THIRDWEB_SECRET_KEY as string;
  const walletAddress = process.env.WALLET_ADDRESS as string;

  if (!receiver || !secretKey || !walletAddress) {
    console.error("Missing required environment variables: RECEIVER, THIRDWEB_SECRET_KEY, and WALLET_ADDRESS");
    console.log("\n💡 Get your thirdweb credentials from: https://thirdweb.com/dashboard");
    console.log("💡 WALLET_ADDRESS should be your thirdweb server wallet address with USDC on Base network");
    process.exit(1);
  }

  console.log("🚀 Starting Snack Money payment example with thirdweb\n");
  console.log(`📍 Wallet Address: ${walletAddress}`);

  console.log(`💡 Check your balance at: https://basescan.org/address/${walletAddress}\n`);

  const url = "https://api.snack.money/payments/x/pay";
  const encodedUrl = encodeURIComponent(url);
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
  const maxValue = 1000000; // 1 USDC in smallest units (6 decimals)

  console.log(`💸 Sending ${amount} USDC to @${receiver} on X...\n`);

  const startTime = Date.now();

  // Using thirdweb's x402 fetch wrapper
  const response = await fetch(
    `https://api.thirdweb.com/v1/payments/x402/fetch?from=${walletAddress}&url=${encodedUrl}&method=POST&maxValue=${maxValue}&asset=${usdcAddress}`,
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
}

main();
