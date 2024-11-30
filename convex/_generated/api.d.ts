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
import type * as constants from "../constants.js";
import type * as mutations_events from "../mutations/events.js";
import type * as mutations_storage from "../mutations/storage.js";
import type * as mutations_users from "../mutations/users.js";
import type * as mutations_waitingList from "../mutations/waitingList.js";
import type * as queries_events from "../queries/events.js";
import type * as queries_storage from "../queries/storage.js";
import type * as queries_tickets from "../queries/tickets.js";
import type * as queries_users from "../queries/users.js";
import type * as queries_waitingList from "../queries/waitingList.js";
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
  constants: typeof constants;
  "mutations/events": typeof mutations_events;
  "mutations/storage": typeof mutations_storage;
  "mutations/users": typeof mutations_users;
  "mutations/waitingList": typeof mutations_waitingList;
  "queries/events": typeof queries_events;
  "queries/storage": typeof queries_storage;
  "queries/tickets": typeof queries_tickets;
  "queries/users": typeof queries_users;
  "queries/waitingList": typeof queries_waitingList;
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
