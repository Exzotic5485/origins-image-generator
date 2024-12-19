import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function saveFile(file: Blob, fileName: string) {
    const a = document.createElement("a");

    a.href = URL.createObjectURL(file);
    a.download = fileName;

    a.click();
}
