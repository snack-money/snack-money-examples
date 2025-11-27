# Snack Money thirdweb Example

This example demonstrates how to send USDC payments to X (Twitter) users using the Snack Money API with thirdweb's x402 payment wrapper.

## Features

- Automatic server wallet creation with thirdweb in-app wallets
- Multi-network support (Base and Solana)
- x402 payment protocol integration via thirdweb API
- Simple fetch-based API
- No manual wallet management or private key handling

## Prerequisites

- Node.js 18+
- Thirdweb account and secret key ([Sign up here](https://thirdweb.com/dashboard))
- USDC balance in your thirdweb wallet

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
THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
RECEIVER=USE_YOUR_OWN_X_ACCOUNT
AMOUNT=0.01
```

**Note**:
- Use your own X (Twitter) account as the receiver to test the integration.
- The server wallet will be created automatically - no need to provide a wallet address.

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

1. Creates a thirdweb client with your credentials
2. Connects to or creates an in-app server wallet automatically
3. Encodes the Snack Money API endpoint URL
4. Makes a request to thirdweb's x402 payment wrapper
5. Thirdweb handles the x402 negotiation and payment execution
6. Supports both Base and Solana networks automatically
7. Returns the payment response with transaction details

## Why thirdweb?

- **Managed infrastructure**: No need to run your own payment infrastructure
- **Multi-network support**: Automatically handles Base and Solana
- **Automatic wallet creation**: In-app wallets created on the fly
- **Server wallets**: Secure server-side wallet management
- **Simple API**: Just one fetch call with your credentials
- **No private key exposure**: Keys managed securely by thirdweb

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
