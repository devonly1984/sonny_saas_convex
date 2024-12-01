import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "../constants";
import { checkAvailability } from "../queries/events";
import { internal } from "../_generated/api";
import { processQueue } from "./waitingList";
export const joinWaitingList = mutation({
    args:{
        eventId:v.id('events'),
        userId:v.string()
    },
    handler: async(ctx,{eventId,userId})=>{
       /* const status = await rateLimiter.limit(ctx,'queueJoin',{key:userId});
        if (!status.ok) {
            throw new ConvexError(
              `You've joined the waiting list too many timeStamp. Please wait ${Math.ceil(status.retryAfter / (60 * 1000))} minutes before trying again.`
            );
        }*/
       const existingEntry = await ctx.db
         .query("waitingList")
         .withIndex("by_user_event", (q) =>
           q.eq("userId", userId).eq("eventId", eventId)
         )
         .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
         .first();
         if (existingEntry){
            throw new ConvexError("Already in waiting list for this event");
         }
         const event = await ctx.db.get(eventId);
         if (!event) throw new ConvexError("Event not found");
         const { available } = await checkAvailability(ctx, { eventId });
         const now = Date.now();

         if (available) {
            const waitingListId = await ctx.db.insert('waitingList',{
                eventId,
                userId,
                status: WAITING_LIST_STATUS.OFFERED,
                offerExpiresAt: now+DURATIONS.TICKET_OFFER
            })
            await ctx.scheduler.runAfter(
              DURATIONS.TICKET_OFFER,
              internal.mutations.waitingList.expireOffer,
              {
                waitingListId,
                eventId,
              }
            );
         } else {
            await ctx.db.insert("waitingList", {
              eventId,
              userId,
              status: WAITING_LIST_STATUS.WAITING,
            });
         }
         return {
           success: true,
           status: available
             ? WAITING_LIST_STATUS.OFFERED
             : WAITING_LIST_STATUS.WAITING,
           message: available
             ? `Ticket offered - you have ${DURATIONS.TICKET_OFFER / (60 * 1000)} minutes to purchase`
             : "Added to waiting list - you'll be notified when a ticket becomes available",
         };
    }
})
export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      location: args.location,
      eventDate: args.eventDate,
      price: args.price,
      totalTickets: args.totalTickets,
      userId: args.userId,
    });
    return eventId;
  },
});
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    
  },
  handler: async (ctx, args) => {
    const { eventId, ...updates } = args;
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    const soldTickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();
      if (updates.totalTickets < soldTickets.length) {
        throw new Error(`Cannot reduce total tickets below ${soldTickets.length} (number of tickets already sold)`)
      }
      await ctx.db.patch(eventId,updates);
      return eventId;
  },
});
export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    paymentInfo: v.object({
      paymentIntentId: v.string(),
      amount: v.number(),
    }),
  },
  handler: async (ctx, { eventId, userId, waitingListId, paymentInfo }) => {
    const waitingListentry = await ctx.db.get(waitingListId);
    if (!waitingListentry) {
      throw new Error("Waiting list entry not found");
    }
    if (waitingListentry.status !== WAITING_LIST_STATUS.OFFERED) {
      throw new Error(
        "Invalid waiting list status -- ticket offer may have expired"
      );
    }
    if (waitingListentry.userId !==userId) {
      throw new Error("Waiting list entry does not belong to this user");
    }
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.is_cancelled) {
      throw new Error("Event is no longer active");
    }
    try {
      await ctx.db.insert('tickets',{
        eventId,
        userId,
        purchasedAt: Date.now(),
        status: TICKET_STATUS.VALID,
        paymentIntentId: paymentInfo.paymentIntentId,
        amount: paymentInfo.amount
      })
      await ctx.db.patch(waitingListId,{
        status: WAITING_LIST_STATUS.PURCHASED
      })
      await processQueue(ctx, { eventId });
    } catch (error) {
      throw new Error(`Failed to process ticket purchase ${error}`);
      
    }
  },
});