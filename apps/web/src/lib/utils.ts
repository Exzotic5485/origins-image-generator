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

export function dataURLToBase64(dataURL: string) {
    const [, base64] = dataURL.split("base64,");

    if (!base64)
        throw new Error("Data URL provided does not contain a base64 string");

    return base64;
}

export function generateRandomFileName(
    ext?: string,
    prefix = "origins-image-generator"
) {
    const date = new Date();

    return `${prefix}_${date.getDay()}-${date.getMonth()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}${
        ext ? `.${ext}` : ""
    }`;
}
