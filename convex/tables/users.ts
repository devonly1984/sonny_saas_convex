import { defineTable } from "convex/server";
import {v} from 'convex/values';

export default defineTable({
  name: v.string(),
  email: v.string(),
  userId: v.string(),
  stripeConnectId: v.optional(v.string()),
})
  .index("by_user_id", ["userId"])
  .index("by_email", ["email"]);