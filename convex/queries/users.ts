import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUsersStripeConnectId = query({
    args: {userId:v.string()},
    handler: async(ctx,{userId})=>{
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), userId))
          .filter((q) => q.neq(q.field("stripeConnectId"), undefined))
          .first();
        return user?.stripeConnectId
    }
})

export const getUserById = query({
    args: {userId:v.string()},
    handler: async(ctx,{userId})=>{
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", userId))
          .first();
          return user;
    }
})  