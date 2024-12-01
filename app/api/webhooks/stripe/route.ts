import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/helpers";
import { api } from "@/convex/_generated/api";
import Stripe from 'stripe';
import { StripeCheckoutMetaData } from "@/types";

export const POST = async(req:Request)=>{
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;
    try {
        event  = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.WEBHOOK_SECRET!
        )
    } catch (error) {
       return new Response(`Webhook error ${(error as Error).message}`);
    }    
    const convex = getConvexClient();

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata as StripeCheckoutMetaData;
        try {
            const result = await convex.mutation(
              api.mutations.events.purchaseTicket,
              {
                eventId: metadata.eventId,
                userId: metadata.userId,
                waitingListId: metadata.waitingListId,
                paymentInfo: {
                  paymentIntentId: session.payment_intent as string,
                  amount: session.amount_total ?? 0,
                },
              }
            );
            console.log(result)
        } catch (error) {
            return new Response(`Error processing webhook,${error}`);
        }
    }
    return new Response(null, { status: 200 });
}