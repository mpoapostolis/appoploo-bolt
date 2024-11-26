import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = 'your_stripe_public_key';

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const createSubscription = async (fleetId: string, priceId: string) => {
  // In a real app, this would call your backend to create a Stripe Checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fleetId,
      priceId,
    }),
  });

  const session = await response.json();
  return session;
};