This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Stripe testing
- create test product on Stripe and payment link
- add environment variables `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_SUBSCRIPTION_URL` (payment link to subscription product e.g. https://buy.stripe.com/test_aEUdRX5RJgb2eDS288)
- for local testing expose `localhost:3000` with ngrok or similar tool
- on Stripe side set After payment -> Confirmation page -> set URL to website: `[URL]/payment/success?session_id={CHECKOUT_SESSION_ID}` (e.g. https://f816-178-235-180-212.ngrok-free.app/payment/success?session_id={CHECKOUT_SESSION_ID})
- use test card: https://docs.stripe.com/testing#use-test-cards
