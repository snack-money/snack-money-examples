# Snack Money API Examples

Examples demonstrating how to integrate with the Snack Money API using different x402 payment clients.

## What is Snack Money?

Snack Money enables USDC payments to users across multiple platforms (X/Twitter, Farcaster, GitHub, Email, Domains) using the x402 payment protocol.

## Available Examples

Each example demonstrates sending USDC to X (Twitter) users via configurable environment variables.

### 1. [axios](./axios) - x402-axios
Axios HTTP client with x402 payment interceptor
- ✅ Base network
- ✅ Payment interceptor pattern
- ✅ Simple integration
- ✅ Type-safe TypeScript

### 2. [cdp-sdk](./cdp-sdk) - Coinbase CDP SDK
Server-side wallet management with MPC security
- ✅ Base network
- ✅ No private key management
- ✅ Enterprise-grade security
- ✅ Perfect for backend apps

### 3. [fetch](./fetch) - x402-fetch
Native fetch API wrapper
- ✅ Base or Solana network (configurable)
- ✅ Minimal dependencies
- ✅ Simple wrapper pattern
- ✅ TypeScript support

### 4. [thirdweb](./thirdweb) - thirdweb
Managed infrastructure with thirdweb API
- ✅ Base network
- ✅ Managed payment infrastructure
- ✅ x402 wrapper
- ✅ No private key in code

## Quick Start

Each example has its own directory with:
- `package.json` - Dependencies
- `index.ts` - Main implementation
- `.env.example` - Configuration template
- `README.md` - Detailed instructions
- `tsconfig.json` - TypeScript config

To run any example:

```bash
cd <example-directory>
npm install
cp .env.example .env
# Edit .env with your credentials and receiver username
npm run dev
```

All examples require setting:
- **RECEIVER**: X (Twitter) username to send payment to (without @) - use your own X account for testing
- **AMOUNT**: Amount to send in USDC (default: 0.01)

## Testing

Start with a small amount (0.01 USDC = 1¢) to test the integration before scaling up.

## Supported Networks

- **Base** (Mainnet)
- **Solana** (Mainnet)

## Supported Payment Destinations

- **X (Twitter)**: `/payments/x/pay`
- **Farcaster**: `/payments/farcaster/pay`
- **GitHub**: `/payments/github/pay`
- **Email**: `/payments/email/pay`
- **Web Domain**: `/payments/web/pay`

## API Endpoints

All examples use the production API:
```
https://api.snack.money
```

## Example Request

```typescript
{
  amount: 0.01,
  currency: "USDC",
  receiver: "username",
  description: "Payment via x402"
}
```

## Example Response

```json
{
  "code": 200,
  "msg": "0.01 USDC sent successfully",
  "data": {
    "txn_id": "...",
    "amount": 0.01,
    "receipt": "https://snack.money/x/username?txn=..."
  }
}
```

## How x402 Works

1. **Initial Request**: Client makes API call to Snack Money
2. **402 Response**: Server returns payment requirements
3. **Payment Execution**: Client executes on-chain payment
4. **Retry with Proof**: Client retries request with payment proof
5. **Success**: Server processes and returns success response

## Learn More

- [Snack Money](https://snack.money)
- [x402 Protocol](https://github.com/coinbase/x402)
- [x402-axios](https://www.npmjs.com/package/x402-axios)
- [x402-fetch](https://www.npmjs.com/package/x402-fetch)

## Support

For questions or issues:
- Visit [snack.money](https://snack.money)
- Check the [x402 specification](https://github.com/coinbase/x402)
