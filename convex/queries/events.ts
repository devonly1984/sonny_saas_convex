import {query} from '../_generated/server';


export const getEvents = query({
    args: {},
    handler: async(ctx)=>{
        const events = await ctx.db.query('events').collect();
        return events;
    }
})