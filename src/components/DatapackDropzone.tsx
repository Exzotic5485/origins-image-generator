import { useDropzone } from "react-dropzone";
import { FileArchiveIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Datapack } from "@/lib/Datapack";

type DatapackDropzoneProps = {
    onSuccess?: (datapack: Datapack) => void;
};

export default function DatapackDropzone({ onSuccess }: DatapackDropzoneProps) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [error, setError] = useState("");

    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 1,
        accept: {
            "application/zip": [".zip"],
        },
        onDragEnter: () => {
            setIsDraggingOver(true);
            setError("");
        },
        onDragLeave: () => setIsDraggingOver(false),
        onDropAccepted: async (files: File[]) => {
            setIsDraggingOver(false);
            setError("");

            try {
                const datapack = new Datapack(files[0]);

                await datapack.parse();

                onSuccess?.(datapack);
            } catch (e: any) {
                setError(e?.message || "An error occurred while parsing the file.");
            }
        },
        onDropRejected: () => {
            setIsDraggingOver(false);

            setError("Only zip files are allowed.");
        },
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "bg-card text-card-foreground py-16 px-8 rounded-xl flex flex-col items-center justify-center mx-auto outline-1 outline-dashed outline-muted-foreground ",
                {
                    "outline-primary": isDraggingOver,
                    "outline-destructive": error,
                }
            )}
        >
            <div className="flex-1 h-full w-full flex flex-col items-center justify-center select-none text-muted-foreground">
                <input {...getInputProps()} />
                <FileArchiveIcon className="size-10" />
                <span className="font-semibold mt-1">
                    Click to upload or drag and drop
                </span>
                <span className="text-sm text-destructive mt-4">{error}</span>
            </div>
        </div>
    );
}
