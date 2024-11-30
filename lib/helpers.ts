"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { useQuery } from "convex/react";

export const useStorageUrl = (storageId: Id<"_storage"> | undefined) => {
  return useQuery(
    api.queries.storage.getUrl,
    storageId ? { storageId } : "skip"
  );
};
export const getConvexClient = ()=>{
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
}

