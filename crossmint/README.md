# Snack Money Crossmint Smart Wallet Example

This example demonstrates how to send USDC payments to X (Twitter) users using the Snack Money API with Crossmint's API-based signing and x402 payment protocol.

## Features

- **API-based signing** - No private key exposure in your code
- **Smart contract wallets** (Account Abstraction)
- **Crossmint transaction API** - Execute transactions via REST API
- **x402 protocol** - Demonstrates manual x402 payment flow
- **Base network support**
- **Type-safe TypeScript**

## What Makes This Example Unique?

Unlike other examples that use private keys directly, this example showcases:

1. **Crossmint's signing API** - Signs transactions through Crossmint's REST API
2. **Smart wallet transactions** - Uses Crossmint's transaction endpoint to execute payments
3. **No private key in code** - All signing happens via API calls to Crossmint
4. **Manual x402 flow** - Demonstrates the x402 protocol steps explicitly

## Prerequisites

- Node.js 18+
- **Existing Crossmint smart wallet** (create via [Crossmint Console](https://www.crossmint.com/console))
- Crossmint server-side API key with permissions:
  - `wallets:transactions.create`
  - `wallets:transactions.sign`
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

## How it works

This example demonstrates the x402 payment protocol flow using Crossmint's API-based signing:

### Step 1: Initial Request
Makes a POST request to Snack Money API. Receives a `402 Payment Required` response with payment details.

### Step 2: Parse Payment Requirements
Extracts payment information from the 402 response:
- Amount required (in USDC)
- Payment recipient address
- Network (Base)
- Transaction data

### Step 3: Execute Payment via Crossmint API
Uses Crossmint's transaction API to execute the USDC transfer:
```typescript
POST /api/2025-06-09/wallets/{walletLocator}/transactions
```
The smart wallet sends USDC to the specified address. No private keys in your code!

### Step 4: Retry with Payment Proof
Retries the original request with the transaction hash as proof of payment:
```typescript
headers: { "X-Payment-Receipt": JSON.stringify({ txHash, chain }) }
```

### Step 5: Success
Snack Money verifies the payment on-chain and returns a success response.

## Architecture Diagram

```
┌─────────────────┐
│  Your Code      │
│  (index.ts)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     HTTP API
│ Crossmint API   │◄────┐
│ (signing &      │     │ Sign & Execute
│  transactions)  │     │ via REST API
└────────┬────────┘     │
         │              │
         ▼              │
  ┌────────────┐        │
  │Smart Wallet│────────┘
  │(on Base)   │
  │Holds USDC  │
  └────────────┘
```

## Why Use Crossmint with x402?

- **No Private Key Exposure**: All signing happens through Crossmint's API
- **Smart Contract Wallets**: Account abstraction enables advanced features
- **API-First**: Manage wallets and transactions via REST API calls
- **Enterprise Security**: Crossmint handles key management with MPC
- **Easy Integration**: Standard REST API calls, no blockchain libraries needed
- **Compliance-Friendly**: Custodial architecture supports regulatory requirements

## Testing

Start with a small amount (0.01 USDC = 1¢) to test the integration.

## Example Output

```
🚀 Starting Snack Money payment example with Crossmint Smart Wallet

✅ Smart Wallet Address: 0xabcd...ef00
💡 Check balance: https://basescan.org/address/0xabcd...ef00

💸 Initiating x402 payment flow: 0.01 USDC to @username on X...

📋 Received x402 Payment Required (402 status)

💳 Payment Requirements:
   Amount: 0.01 USDC
   Pay to: 0x1234...5678
   Network: base

🔐 Creating transaction via Crossmint API...

✅ Transaction submitted: 0xabc123...

🔄 Retrying request with payment proof...

✅ Payment successful!

📊 Response: {
  "code": 200,
  "msg": "0.01 USDC sent successfully",
  "data": {
    "txn_id": "...",
    "amount": 0.01,
    "receipt": "https://snack.money/x/username?txn=..."
  }
}
```

## Troubleshooting

### API Key Permission Error
Ensure your Crossmint API key has these permissions:
- `wallets:transactions.create`
- `wallets:transactions.sign`

### Wallet Not Found
Verify that:
1. `WALLET_LOCATOR` matches your wallet in Crossmint Console
2. `SMART_WALLET_ADDRESS` is the correct address for your wallet

### Insufficient Balance
Make sure your smart wallet has:
1. Sufficient USDC for the payment
2. Sufficient ETH for gas fees on Base

### Transaction Failed
Check that:
1. Your wallet address is funded with USDC on Base network
2. The API key has correct permissions
3. The wallet locator format is correct (email:... or evm-keypair:0x...)

## Learn More

- [Snack Money API Documentation](https://snack.money)
- [Crossmint Documentation](https://docs.crossmint.com/)
- [Crossmint Smart Wallets](https://docs.crossmint.com/wallets/smart-wallets/create-wallet)
- [x402 Protocol Specification](https://github.com/coinbase/x402)
