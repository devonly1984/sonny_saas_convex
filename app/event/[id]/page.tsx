"use client"

import Spinner from "@/components/shared/Spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { useStorageUrl } from "@/lib/helpers";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

const EventPage = () => {
  const {user} = useUser();
  const params = useParams();
  const event = useQuery(api.queries.events.getEventById, {
    eventId: params.id as Id<"events">,
  });
  const availability = useQuery(api.queries.events.getEventAvailability,{
    eventId: params.id as Id<'events'>
  })
  const imageUrl = useStorageUrl(event?.imageStorageId);
  if (!event || !availability) {
    return <div className="min-h-screen flex items-center justify-center">
      <Spinner/>
    </div>
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/**Event Details */}
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {imageUrl && (
            <div className="relative w-full aspect-[21/9]">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {event.name}
                  </h1>
                  <p className="text-lg text-gray-600">{event.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <CalendarDays className="size-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Date</span>
                      <p className="text-gray-900">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center text-gray-600 mb-1">
                        <MapPin className="size-5 mr-2 text-blue-600" />
                        <span className="text-sm font-medium">Location</span>
                        <p className="text-gray-900">{event.location}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center text-gray-600 mb-1">
                        <Ticket className="size-5 mr-2 text-blue-600" />
                        <span className="text-sm font-medium">Price</span>
                        <p className="text-gray-900">
                          {event.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center text-gray-600 mb-1">
                        <Users className="size-5 mr-2 text-blue-600" />
                        <span className="text-sm font-medium">
                          Availability
                        </span>
                        <p className="text-gray-900">
                          {availability.totalTickets -
                            availability.purchasedCount}
                          /{availability.totalTickets} left
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EventPage;
