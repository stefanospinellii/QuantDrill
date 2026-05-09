import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-04-10',
});

const PRICE_MAP = {
  monthly:  { mode: 'subscription', amount: 999,   currency: 'eur', interval: 'month', name: 'QuantDrill Pro Monthly' },
  yearly:   { mode: 'subscription', amount: 5999,  currency: 'eur', interval: 'year',  name: 'QuantDrill Pro Annual' },
  lifetime: { mode: 'payment',      amount: 17900, currency: 'eur', interval: null,    name: 'QuantDrill Pro Lifetime' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, success_url, cancel_url } = await req.json();
    const priceConfig = PRICE_MAP[plan];
    if (!priceConfig) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    const sessionParams = {
      customer_email: user.email,
      metadata: { user_id: user.id, plan },
      success_url: success_url || 'https://quantdrill.base44.app/?payment=success',
      cancel_url: cancel_url || 'https://quantdrill.base44.app/paywall',
      mode: priceConfig.mode,
      line_items: [{
        price_data: {
          currency: priceConfig.currency,
          unit_amount: priceConfig.amount,
          product_data: { name: priceConfig.name },
          ...(priceConfig.interval ? { recurring: { interval: priceConfig.interval } } : {}),
        },
        quantity: 1,
      }],
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});