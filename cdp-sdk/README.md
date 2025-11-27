# Snack Money CDP SDK Example

This example demonstrates how to send USDC payments to X (Twitter) users using the Snack Money API with Coinbase CDP SDK and x402-axios.

## Features

- Server-side wallet management with CDP SDK
- MPC-based key management (no private keys needed)
- Automatic x402 payment negotiation
- Base network support
- Type-safe TypeScript implementation

## Prerequisites

- Node.js 18+
- Coinbase CDP API credentials ([Get them here](https://portal.cdp.coinbase.com/))
- USDC balance on Base

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Get your CDP API credentials from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)

3. Add your configuration to `.env`:
```env
CDP_API_KEY_ID=your_api_key_id
CDP_API_KEY_SECRET=your_api_key_secret
CDP_WALLET_SECRET=your_wallet_secret
WALLET_ADDRESS=your_wallet_address
RECEIVER=USE_YOUR_OWN_X_ACCOUNT
AMOUNT=0.01
```

**Notes**:
- Use your own X (Twitter) account as the receiver to test the integration
- You need to provide an existing CDP wallet address that was created with these credentials
- Fund this wallet with USDC on Base network before running the example

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

1. Initializes Coinbase CDP client with API credentials
2. Uses your existing CDP wallet address from .env
3. Exports the private key from CDP for the wallet address
4. Creates a viem account from the exported private key
5. Wraps axios with the x402 payment interceptor
6. Makes a POST request to `/payments/x/pay`
7. The interceptor handles the 402 Payment Required response
8. Executes the payment on Base network
9. Retries the request with payment proof
10. Returns the successful response

## Why CDP SDK?

- **No private key management**: CDP handles keys with MPC technology
- **Server-side wallets**: Perfect for backend applications
- **Enterprise-grade security**: Built by Coinbase
- **Easy integration**: Simple API for wallet operations

## Testing

Start with a small amount (0.01 USDC = 1¢) to test the integration.

## Example Output

```
🚀 Starting Snack Money payment example with CDP SDK

✅ Initialized CDP client
✅ Retrieved CDP server account
💸 Sending 0.01 USDC to @username on X...

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

## Learn More

- [Snack Money API Documentation](https://snack.money)
- [Coinbase CDP SDK Documentation](https://docs.cdp.coinbase.com/)
- [x402 Protocol Specification](https://github.com/coinbase/x402)
