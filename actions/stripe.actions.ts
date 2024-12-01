"use server";
import {auth} from '@clerk/nextjs/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { Id } from '@/convex/_generated/dataModel';
import { DURATIONS } from '@/convex/constants';
import { baseUrl } from '@/lib/utils';
import { getConvexClient } from '@/lib/helpers';
import { AccountStatus, StripeCheckoutMetaData } from '@/types';
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL not found in environment file")
}
export const createStripeConnectCustomer = async()=>{
  const {userId} = await auth();
  if (!userId) throw new Error("You must be logged in to perform this action")
    const existingStripeConnectId = await convex.query(
      api.queries.users.getUsersStripeConnectId,
      {
        userId,
      }
    );
    if (existingStripeConnectId) {
        return { account: existingStripeConnectId };
    }
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await convex.mutation(
      api.mutations.users.updateOrCreateUserStripeConnectId,
      {
        userId,
        stripeConnectId: account.id,
      }
    );
    return {account: account.id}
}
export const stripeConnectLoginLink = async(stripeAccountId:string)=>{
  if (!stripeAccountId) {
    throw new Error("No Stripe account ID provided")
  }
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return loginLink.url;  
  } catch (error) {
    console.error("Error creating Stripe Connect login link:",error);
    throw new Error("Failed ot create Stripe Connect login link");
  }
  
}

export const getStripeConnectAccount = async()=>{
  const {userId} = await auth();
  if (!userId) {
    throw new Error("Not Authenticated")
  }
  const stripeConnectId = await convex.query(
    api.queries.users.getUsersStripeConnectId,
    {userId}
  )
  return { stripeConnectId: stripeConnectId || null };
}
export const getStripeConnectAccountStatus = async(stripeAccountId:string):Promise<AccountStatus>=>{
if (!stripeAccountId) {
  throw new Error("No Stripe account Id provided");
}
try {
  const account = await stripe.accounts.retrieve(stripeAccountId);
  return {
    isActive: account.details_submitted && !account.requirements?.currently_due?.length,
    requiresInformation: !!(
      account.requirements?.currently_due?.length || 
      account.requirements?.eventually_due?.length || 
      account.requirements?.past_due?.length
    ),
    requirements: {
      currently_due: account.requirements?.currently_due || [],
      eventually_due: account.requirements?.eventually_due || [],
      past_due: account.requirements?.past_due || []
    },
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled
  }
} catch (error) {
  console.log(error);
  throw new Error("Failed to fetch Stripe Connect Account status")
}
}
export const createStripeAccountLink = async(account:string)=>{
  try {
    const headersList = await headers();
    const origin = headersList.get('origin')||"";
    const accountLink = await stripe.accountLinks.create({
      account,
      refresh_url: `${origin}/connect/refresh/${account}`,
      return_url: `${origin}/connect/return/${account}`,
      type: 'account_onboarding'
    });
    return {url:accountLink.url}
  } catch (error) {
    console.error("An error occurred when calling Stripe AI to create an account link",error);
    if (error instanceof Error){
      throw new Error(error.message)
    }
    throw new Error("An unknown error occurred");
  }
}
export const createStripeCheckout = async ({
  eventId,
}: {
  eventId: Id<"events">;
}) => {
  const {userId} = await auth();
  if (!userId) throw new Error("user not authenticated");
  const convex = getConvexClient();
  const event = await convex.query(api.queries.events.getEventById,{eventId});
  if (!event) throw new Error("Event not found");
  const queuePosition = await convex.query(
    api.queries.waitingList.getQueuePosition,
    { eventId, userId 

    }
  );
  if (!queuePosition || queuePosition.status !=='offered') {
    throw new Error("No Valid Ticket Offered");
  }
  const stripeConnectId = await convex.query(
    api.queries.users.getUsersStripeConnectId,
    {
      userId:event.userId,

    }
  );
  if (!stripeConnectId) {
    throw new Error("Stripe connect Id not found for owner of the event!");
  }
  if (!queuePosition.offerExpiresAt) {
    throw new Error("Ticket offere has no expiration date");
  }
  const metadata: StripeCheckoutMetaData = {
    eventId,
    userId,
    waitingListId: queuePosition._id
  }
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.name,
              description: event.description,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(event.price * 100 * 0.01),
      },
      expires_at:
        (Math.floor(Date.now() / 1000) * DURATIONS.TICKET_OFFER) / 1000,
      mode: "payment",
      success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/event/${eventId}`,
      metadata,
    },
    {
      stripeAccount: stripeConnectId,
    }
  );
  return { sessionId: session.id, sessionUrl: session.url };

};
