"use client";

import { EventFormSchema, FormData } from "@/lib/formSchema/EventFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
    const [imagePreview,setImagePreview] = useState<File|null>(null);
    const generateUploadUrl = useMutation(api.mutations.storage.generateUploadUrl);
    const updateEventImage = useMutation(api.mutations.storage.updateEventImage);
    const deleteImage = useMutation(api.mutations.storage.deleteImage);

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
      </form>
    </Form>
  );
};
export default EventForm;
