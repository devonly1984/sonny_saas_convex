"use client";

import { EventFormSchema, FormData } from "@/lib/formSchema/EventFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
 
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea";
import { InitialEventData } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { useStorageUrl } from "@/lib/helpers";
import { ChangeEvent, useRef, useState, useTransition } from "react";
import { Label } from "../ui/label";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
interface EventFormProps {
    mode: 'create'|'edit';
    initialData?:InitialEventData
}
const EventForm = ({ mode, initialData }: EventFormProps) => {
    const {user} = useUser();
    const router = useRouter();
    const createEvent = useMutation(api.mutations.events.createEvent);
    const updateEvent = useMutation(api.mutations.events.updateEvent);
    const {toast} = useToast();
    const currentImageUrl = useStorageUrl(initialData?.imageStorageId);
    const [isPending, startTransition] = useTransition();
    //image upload
    const imageInput = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File|null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const generateUploadUrl = useMutation(api.mutations.storage.generateUploadUrl);
    const updateEventImage = useMutation(api.mutations.storage.updateEventImage);
    const deleteImage = useMutation(api.mutations.storage.deleteImage);
const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const form = useForm<FormData>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      eventDate: initialData ? new Date(initialData.eventDate) : new Date(),
      price: initialData?.price ?? 0,
      totalTickets: initialData?.totalTickets ?? 1,
    },
  });
  const onSubmit = async(values:FormData)=>{
    if (!user?.id) return;
   startTransition(async () => {
    try {
      let imageStorageId = null;
      if (selectedImage) {
        imageStorageId = await handleImageUpload(selectedImage)
      }
      if (mode==='edit' && initialData?.imageStorageId) {
        await deleteImage({
          storageId: initialData.imageStorageId,
        });
      }
      if (mode==='create') {
        const eventId = await createEvent({
          ...values,
          userId:user.id,
          eventDate: values.eventDate.getTime()
        })
        if (imageStorageId) {
          await updateEventImage({
            eventId,
            storageId: imageStorageId as Id<"_storage">,
          });
        }
        router.push(`/event/${eventId}`);
      } else {
        if (!initialData) {
          throw new Error("Initial event Date is required for updates")
        }
        await updateEvent({
          eventId: initialData._id,
          ...values,
          eventDate: values.eventDate.getTime()
        })
        if (imageStorageId || removeCurrentImage) {
          await updateEventImage({
            eventId: initialData._id,
            storageId: imageStorageId
              ? (imageStorageId as Id<"_storage">)
              : null,
          });
        }
        toast({
          title:"Event Updated",
          description: "You event has been successfully updated"
        })
        router.push(`/event/${initialData._id}`)
      }

    } catch (error) {
      console.log("Failed to handle event",error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request",
      });
    }
   });
  }
  const handleImageUpload=async(file:File):Promise<string|null>=>{
    try {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl,{
            method: "POST",
            headers: {"Content-Type":file.type},
            body: file
        })
        const {storageId} = await result.json();
        return storageId;
    } catch (error) {
        console.log("Failed to upload image",error);
        return null;
    }
  }
  const handleImageChange = (event:ChangeEvent<HTMLInputElement>)=>{
    const file = event.target.files?.[0];
    if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/**Form Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Please enter your event name"
                    {...field}
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      );
                    }}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Ticket</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pl-6"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalTickets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Tickets Available</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">
              Event Image
            </Label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview || (!removeCurrentImage && currentImageUrl) ? (
                <div className="relative w-32 aspect-square bg-gray-100 rounded-lg">
                  <Image
                    src={imagePreview || currentImageUrl!}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setRemoveCurrentImage(true);
                      if (imageInput.current) {
                        imageInput.current.value = "";
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    X
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInput}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              )}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {mode === "create" ? "Creating Event..." : "Updating Event..."}
            </>
          ) : mode === "create" ? (
            "Create Event"
          ) : (
            "Update Event"
          )}
        </Button>
      </form>
    </Form>
  );
};
export default EventForm;
