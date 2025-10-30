import { clsx, type ClassValue} from "clsx";
import { twMerge } from "tailwind-merge";

// Combines multiple class names and merges tailwind css classes efficiently 

export function cn(...inputs: ClassValue[]){
    return twMerge(clsx(inputs));
}