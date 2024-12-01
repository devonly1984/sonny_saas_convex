import { defineTable } from "convex/server";
import {v} from 'convex/values';

export default defineTable({
  eventId: v.id("events"),
  userId: v.string(),
  purchasedAt: v.number(),
  status: v.union(
    v.literal("valid"),
    v.literal("used"),
    v.literal("refunded"),
    v.literal("cancelled")
  ),
  paymentIntentId: v.optional(v.string()),
  amount: v.optional(v.number()),
})
  .index("by_event", ["eventId"])
  .index("by_user", ["userId"])
  .index("by_user_event", ["userId", "eventId"])
  .index("by_payment_intent", ["paymentIntentId"]);