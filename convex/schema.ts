import { defineSchema } from "convex/server";
import events from "./tables/events";
import tickets from "./tables/tickets";
import waitingList from "./tables/waitingList";
import users from "./tables/users";
export default defineSchema({
  events,
  tickets,
  waitingList,
  users,
});