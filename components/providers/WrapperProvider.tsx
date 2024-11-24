"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import SyncUserWithConvex from "./SyncUserWithConvex";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

const WrapperProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <SyncUserWithConvex />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};
export default WrapperProvider;
