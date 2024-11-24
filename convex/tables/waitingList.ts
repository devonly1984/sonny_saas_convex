import { defineTable } from "convex/server";
import {v} from 'convex/values';

export default defineTable({
  eventId: v.id("events"),
  userId: v.string(),
  status: v.union(
    v.literal("waiting"),
    v.literal("offered"),
    v.literal("purchased"),
    v.literal("expired")
  ),
  offerExpiresAt: v.optional(v.number()),
})
  .index("by_event_status", ["eventId", "status"])
  .index("by_user_event", ["userId", "eventId"])
  .index("by_user", ["userId"]);