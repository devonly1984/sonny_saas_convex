import { mutation } from "../_generated/server";
import {v} from 'convex/values';
export const updateUser = mutation({
  args: { userId: v.string(), name: v.string(), email: v.string() },
  handler: async (ctx, { userId, name, email }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
      if (existingUser) {
        await ctx.db.patch(existingUser._id,{
            name,email
        })
        return existingUser._id;
      } else {
        const newUserId = await ctx.db.insert("users", {
          userId,
          name,
          email,
          stripeConnectId: undefined,
        });
        return newUserId;
      }
  },
});