
import { clsx, type ClassValue } from "clsx"

import { twMerge } from "tailwind-merge"

const  cn=(...inputs: ClassValue[]) =>{
  return twMerge(clsx(inputs))
}
const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://${process.env.VERCEL_PRODUCT_PRODUCTION_URL}`;

export { cn, baseUrl };