# Snack Money x402-fetch Example

This example demonstrates how to send USDC payments to X (Twitter) users using the Snack Money API with x402-fetch and native fetch API.

## Features

- Native fetch API wrapper
- Support for Base and Solana networks
- Automatic x402 payment negotiation
- Minimal dependencies
- Type-safe TypeScript implementation

## Prerequisites

- Node.js 18+
- USDC balance on Base or Solana
- Private key for your chosen network

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your private key and choose network in `.env`:

For Base:
```env
PRIVATE_KEY=0x...
NETWORK=base
RECEIVER=USE_YOUR_OWN_X_ACCOUNT
AMOUNT=0.01
```

For Solana:
```env
PRIVATE_KEY=your_solana_private_key_base58
NETWORK=solana
RECEIVER=USE_YOUR_OWN_X_ACCOUNT
AMOUNT=0.01
```

**Note**: Use your own X (Twitter) account as the receiver to test the integration.

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

1. Creates a signer for the specified network (Base or Solana)
2. Wraps the native fetch API with x402 payment capabilities
3. Makes a POST request to `/payments/x/pay`
4. The wrapper handles the 402 Payment Required response
5. Executes the payment on the selected network
6. Retries the request with payment proof
7. Returns the successful response

## Switching Networks

Simply change the `NETWORK` environment variable:
- `NETWORK=base` - Use Base network (EVM, 0x-prefixed private key)
- `NETWORK=solana` - Use Solana network (base58 private key)

## Testing

Start with a small amount (0.01 USDC = 1¢) to test the integration.

## Example Output

```
🚀 Starting Snack Money payment example with x402-fetch (BASE)

✅ Created base signer
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
- [x402 Protocol Specification](https://github.com/coinbase/x402)
