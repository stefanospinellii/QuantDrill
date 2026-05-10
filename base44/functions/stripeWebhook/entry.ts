import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-04-10',
});

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (!userId) return Response.json({ received: true });

    const updateData = {
      is_premium: true,
      subscription_plan: plan,
      stripe_customer_id: session.customer || null,
      stripe_subscription_id: session.subscription || null,
    };

    // For lifetime, no expiry needed. For subscriptions, expiry managed via subscription events.
    await base44.asServiceRole.entities.User.update(userId, updateData);
  }

  // Subscription actually ended (period over) → revoke premium
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    const customerId = sub.customer;

    const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, {
        is_premium: false,
        stripe_subscription_id: null,
        subscription_plan: null,
      });
    }
  }

  // Subscription scheduled to cancel at period end → keep premium until then, do NOT revoke now
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object;
    const customerId = sub.customer;

    if (sub.cancel_at_period_end === true) {
      // User cancelled via portal — access remains until period ends, nothing to revoke yet
      // Optionally mark as cancelling so UI can show a notice
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_cancel_at_period_end: true,
        });
      }
    } else if (sub.cancel_at_period_end === false && sub.status === 'active') {
      // User reversed the cancellation
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_cancel_at_period_end: false,
        });
      }
    }
  }

  return Response.json({ received: true });
});