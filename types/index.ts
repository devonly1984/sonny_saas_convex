import { Id } from "@/convex/_generated/dataModel";

export type AccountStatus = {
    isActive: boolean;
    requiresInformation: boolean;
    requirements: {
      currently_due: string[];
      eventually_due: string[];
      past_due: string[];
    };
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  };
  export type StripeCheckoutMetaData = {
    eventId: Id<'events'>;
    userId:string;
    waitingListId:Id<'waitingList'>;
  }
  export interface InitialEventData {
    _id: Id<"events">;
    name: string;
    description: string;
    location: string;
    eventDate: number;
    price: number;
    totalTickets: number;
    imageStorageId?: Id<"_storage">;
  }