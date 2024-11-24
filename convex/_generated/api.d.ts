/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as mutations_users from "../mutations/users.js";
import type * as queries_events from "../queries/events.js";
import type * as tables_events from "../tables/events.js";
import type * as tables_tickets from "../tables/tickets.js";
import type * as tables_users from "../tables/users.js";
import type * as tables_waitingList from "../tables/waitingList.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "mutations/users": typeof mutations_users;
  "queries/events": typeof queries_events;
  "tables/events": typeof tables_events;
  "tables/tickets": typeof tables_tickets;
  "tables/users": typeof tables_users;
  "tables/waitingList": typeof tables_waitingList;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
