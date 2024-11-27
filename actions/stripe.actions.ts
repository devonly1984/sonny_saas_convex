"use server";
import {auth} from '@clerk/nextjs/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { stripe } from '@/lib/stripe';
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