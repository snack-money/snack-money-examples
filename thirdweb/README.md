# Snack Money thirdweb Example

This example demonstrates how to send USDC payments to X (Twitter) users using the Snack Money API with thirdweb's x402 payment wrapper.

## Features

- Base network support
- x402 payment protocol integration via thirdweb API
- Simple fetch-based API
- No private key handling in your code

## Prerequisites

- Node.js 18+
- Thirdweb account and secret key ([Sign up here](https://thirdweb.com/dashboard))
- Wallet address with USDC on Base network

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Get your thirdweb secret key from [thirdweb Dashboard](https://thirdweb.com/dashboard)

3. Add your configuration to `.env`:
```env
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
WALLET_ADDRESS=your_wallet_address
RECEIVER=USE_YOUR_OWN_X_ACCOUNT
AMOUNT=0.01
```

**Notes**:
- Use your own X (Twitter) account as the receiver to test the integration
- Provide a wallet address that has USDC on Base network
- The wallet must be accessible by your thirdweb account

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

1. Takes your wallet address and thirdweb credentials
2. Encodes the Snack Money API endpoint URL with required parameters
3. Makes a POST request to thirdweb's x402 payment wrapper
4. Thirdweb handles the x402 negotiation and payment execution on Base
5. Returns the payment response with transaction details

## Why thirdweb?

- **Managed infrastructure**: No need to run your own payment infrastructure
- **Simple API**: Just one fetch call with your credentials
- **No private key in code**: Keys managed securely by thirdweb
- **x402 wrapper**: Handles the payment protocol automatically

## Testing

Start with a small amount (0.01 USDC = 1¢) to test the integration.

## Example Output

```
🚀 Starting Snack Money payment example with thirdweb

✅ Server wallet connected: 0x...

💸 Sending 0.01 USDC to @username on X...

📊 Response received in 2.45s
📈 Status: 200
📋 Headers:
   content-type: application/json
   x-payment-response: ...

📄 Response Body:
{
  "code": 200,
  "msg": "0.01 USDC sent successfully",
  "data": {
    "txn_id": "...",
    "amount": 0.01,
    "receipt": "https://snack.money/x/username?txn=..."
  }
}

✅ Payment successful!
```

## Learn More

- [Snack Money API Documentation](https://snack.money)
- [thirdweb Documentation](https://portal.thirdweb.com/)
- [x402 Protocol Specification](https://github.com/coinbase/x402)
