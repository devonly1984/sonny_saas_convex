import { mutation } from "../_generated/server";
import {v} from 'convex/values';
import { WAITING_LIST_STATUS } from "../constants";
export const releaseTicket =  mutation({
    args: {
        eventId:v.id('events'),
        waitingListId:v.id('waitingList')
    },
    handler: async(ctx,{eventId,waitingListId})=>{
      const entry = await ctx.db.get(waitingListId);
      if (!entry || entry.status !== WAITING_LIST_STATUS.OFFERED) {
        throw new Error("No valid Ticket offer found");
      }
      await ctx.db.patch(waitingListId, {
        status: WAITING_LIST_STATUS.EXPIRED,
      });
      //TODO
      //await processQueue(ctx, { eventId });
    }

})