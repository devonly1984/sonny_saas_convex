import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { DURATIONS, WAITING_LIST_STATUS } from "../constants";
import { checkAvailability } from "../queries/events";
import { internal } from "../_generated/api";
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