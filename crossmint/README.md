# Snack Money Crossmint Smart Wallet Example

This example demonstrates how to send USDC payments to X (Twitter) users using the Snack Money API with Crossmint's API-based signing and x402-axios.

## Features

- **API-based signing** - No private key exposure in your code
- **Smart contract wallets** (Account Abstraction)
- **x402-axios integration** - Automatic payment handling
- **EIP-712 typed data signing** - Secure payment authorization
- **Base network support**
- **Type-safe TypeScript**

## What Makes This Example Unique?

Unlike other examples that use private keys directly, this example showcases:

1. **Crossmint's Signature API** - Signs messages and typed data through Crossmint's REST API
2. **Custom viem Account** - Implements a LocalAccount that uses Crossmint for signing
3. **No private key in code** - All signing happens via API calls to Crossmint
4. **Smart wallet integration** - Uses Crossmint smart wallets with x402 protocol

## Prerequisites

- Node.js 18+
- **Existing Crossmint smart wallet** (create via [Crossmint Console](https://www.crossmint.com/console))
- Crossmint server-side API key with signature permissions
- **Smart wallet funded with USDC on Base network**

## Installation

```bash
npm install
```

## Configuration

### Step 1: Create a Smart Wallet

1. Go to [Crossmint Console](https://www.crossmint.com/console)
2. Create a new smart wallet or use an existing one
3. Note your wallet address and fund it with USDC on Base network
4. Create a server-side API key with required permissions

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your configuration to `.env`:
```env
CROSSMINT_API_KEY=your_server_api_key
WALLET_LOCATOR=email:your@email.com:evm-smart-wallet
SMART_WALLET_ADDRESS=0xYourSmartWalletAddress
RECEIVER=USE_YOUR_OWN_X_ACCOUNT
AMOUNT=0.01
```

**Configuration Notes**:
- `CROSSMINT_API_KEY`: Server-side API key from Crossmint Console
- `WALLET_LOCATOR`: Wallet identifier with wallet type (MUST include wallet type for signatures)
  - Format: `email:your@email.com:evm-smart-wallet` (for smart wallets)
  - Or: `email:your@email.com:evm-mpc-wallet` (for MPC wallets)
  - Or: `userId:user123:evm-smart-wallet`
  - Or just: `0xYourSmartWalletAddress`
- `SMART_WALLET_ADDRESS`: Your smart wallet's address on Base (must be funded with USDC)
- `RECEIVER`: Use your own X account for testing

## Usage

Build and run the example:

```bash
npm run dev
```

Or build separately:

```bash
npm run build
npm start
```

## How it Works

This example uses x402-axios with a custom Crossmint account adapter:

### Step 1: Create Custom Account
Creates a viem `LocalAccount` that uses Crossmint's Signature API for signing:
```typescript
const account = toAccount({
  address: smartWalletAddress,
  signMessage: async ({ message }) => {
    // Request signature via Crossmint API
    // Poll for completion
    // Return signature
  },
  signTypedData: async (typedData) => {
    // Same pattern for EIP-712 typed data
  }
});
```

### Step 2: Integrate with x402-axios
Wraps the custom account with the x402 payment interceptor:
```typescript
const api = withPaymentInterceptor(
  axios.create({ baseURL: "https://api.snack.money" }),
  crossmintAccount
);
```

### Step 3: Make Payment
The interceptor automatically handles the x402 protocol:
1. Receives `402 Payment Required` response
2. Signs EIP-712 payment authorization via Crossmint API
3. Retries request with signed payment header
4. Returns successful payment response

## Architecture Diagram

```
┌─────────────────────────┐
│  Your Code (index.ts)   │
│  - Custom viem Account  │
│  - x402-axios          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Crossmint Signature API│◄──── Sign messages & typed data
│  (REST API)             │
└─────────────────────────┘
         │
         ▼
  ┌────────────┐
  │Smart Wallet│───► USDC Transfer
  │(on Base)   │
  └────────────┘
```

## Why Use Crossmint with x402?

- **No Private Key Exposure**: All signing happens through Crossmint's API
- **Smart Contract Wallets**: Account abstraction enables advanced features
- **Secure Signing**: EIP-712 typed data signing for payment authorization
- **API-First**: Manage wallets and signatures via REST API calls
- **Enterprise Security**: Crossmint handles key management
- **Easy Integration**: Works seamlessly with x402-axios

## Testing

Start with a small amount (0.01 USDC = 1¢) to test the integration.

## Example Output

```
🚀 Starting Snack Money payment example with Crossmint Smart Wallet

✅ Smart Wallet Address: 0x2fEF716212C1F9af1bf90e50c09b093f9a0173F5
💡 Check balance: https://basescan.org/address/0x2fEF716212C1F9af1bf90e50c09b093f9a0173F5

🔐 Creating Crossmint account...

💸 Sending 0.01 USDC to @0xmesuthere on X...

✅ Payment successful!

📊 Response: {
  "code": 200,
  "msg": "0.01 USDC sent successfully",
  "data": {
    "txn_id": "1764730167847",
    "amount": 0.01,
    "receipt": "https://snack.money/twitter/0xmesuthere?txn=1764730167847"
  }
}

🔐 Payment Response Details: {
  "network": "base",
  "payer": "0x2fEF716212C1F9af1bf90e50c09b093f9a0173F5",
  "success": true,
  "transaction": "0x3bdbad3850b8ea34df5dc5a0efb1ec410cc4ccc52500f4beae1fa77d67e16216"
}

🧾 Receipt: https://snack.money/twitter/0xmesuthere?txn=1764730167847
```

## Troubleshooting

### Signature Failed
If you see signature errors:
1. Ensure your Crossmint API key has signature permissions
2. Verify `WALLET_LOCATOR` format includes wallet type (e.g., `:evm-smart-wallet`)
3. Check that the wallet exists in Crossmint Console

### Wallet Not Found
Verify that:
1. `WALLET_LOCATOR` matches your wallet in Crossmint Console
2. Format: `email:your@email.com:evm-smart-wallet` (note the wallet type suffix)
3. `SMART_WALLET_ADDRESS` is the correct address for your wallet

### Insufficient Balance
Make sure your smart wallet has:
1. Sufficient USDC for the payment
2. Sufficient ETH for gas fees on Base

### Payment Failed
Check that:
1. Your wallet is funded with USDC on Base network
2. The API key has correct permissions
3. You're using your own X account as the receiver for testing

## Learn More

- [Snack Money API Documentation](https://snack.money)
- [Crossmint Documentation](https://docs.crossmint.com/)
- [Crossmint Smart Wallets](https://docs.crossmint.com/wallets/smart-wallets/create-wallet)
- [x402 Protocol Specification](https://github.com/coinbase/x402)
