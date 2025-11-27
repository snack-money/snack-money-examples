# Snack Money x402-axios Example

This example demonstrates how to send USDC payments to X (Twitter) users using the Snack Money API with x402-axios.

## Features

- Base network support
- Automatic x402 payment negotiation
- Simple axios-based API
- Type-safe TypeScript implementation

## Prerequisites

- Node.js 18+
- USDC balance on Base network
- EVM private key

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your configuration to `.env`:
```env
EVM_PRIVATE_KEY=0x...
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

1. Creates a Base signer from your private key
2. Wraps axios with the x402 payment interceptor
3. Makes a POST request to `/payments/x/pay`
4. The interceptor handles the 402 Payment Required response
5. Executes the payment on Base network
6. Retries the request with payment proof
7. Returns the successful response

## Testing

Start with a small amount (0.01 USDC = 1¢) to test the integration.

## Example Output

```
🚀 Starting Snack Money payment example with x402-axios

✅ Base signer created
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
