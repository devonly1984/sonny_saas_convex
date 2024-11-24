import { defineTable } from "convex/server";
import {v} from 'convex/values';


export default defineTable({
  name: v.string(),
  description: v.string(),
  location: v.string(),
  eventDate: v.number(),
  price: v.number(),
  totalTickets: v.number(),
  userId: v.string(),
  imageStorageId: v.optional(v.id("_storage")),
  is_cancelled: v.optional(v.boolean()),
});